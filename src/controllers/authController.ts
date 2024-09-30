import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User'
import Technician from '../models/Technician';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import mongoose from 'mongoose';

interface IAuthRequest extends Request {
  user?: any;
}

// Transporter for nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const registerUser = async (req: Request, res: Response) => {
  const { name, email, password, role } = req.body;

  try {
    // Hash the password before saving it
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user with the provided name, email, password, and role
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role,
    });

    // Save the user to the database
    await newUser.save();

    // If the user is a technician, create a technician profile
    if (role === 'technician') {
      const newTechnician = new Technician({
        userId: newUser._id,
        available: true,  // Mark technician as available
        handledChats: []
      });
      await newTechnician.save();
    }

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error registering user' });
  }
};


export const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    // Generate JWT token with user ID and role
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET!, { expiresIn: '1h' });

    // If the user is a technician, mark them as available
    if (user.role === 'technician') {
      const technician = await Technician.findOne({ userId: user._id });
      if (!technician) {
        return res.status(404).json({ message: 'Technician profile not found' });
      }

      technician.available = true;  // Mark technician as available when they log in
      await technician.save();
    }

    // Return token, userId, name, and email in the response
    res.json({ token, userId: user._id, name: user.name, email: user.email });
  } catch (error) {
    res.status(500).json({ error: 'Error logging in' });
  }
};


// User can delete their own account
export const deleteOwnAccount = async (req: IAuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    await User.findByIdAndDelete(req.user.id);

    res.json({ message: 'Your account has been successfully deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting account' });
  }
};



// Admin Delete Any User or Technician
export const adminDeleteAccount = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;  // Assuming the userId is passed as a parameter

    // Check if the account exists
    const userToDelete = await User.findById(userId);
    if (!userToDelete) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Delete the user
    await User.findByIdAndDelete(userId);

    res.json({ message: 'User account deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting account' });
  }
};

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find({ role: 'user' });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching users' });
  }
};

export const getAllTechnicians = async (req: Request, res: Response) => {
  try {
    const technicians = await User.find({ role: 'technician' });
    res.json(technicians);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching technicians' });
  }
};

// Update Email
export const updateEmail = async (req: IAuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { newEmail } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.email = newEmail;
    await user.save();

    res.json({ message: 'Email updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error updating email' });
  }
};

// Update Password

export const updatePassword = async (req: IAuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);  // Use 'id' instead of '_id'

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Incorrect old password' });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error updating password' });
  }
};


// Reset Password
export const resetPassword = async (req: Request, res: Response) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  try {
    const user = await User.findOne({ 
      resetPasswordToken: token, 
      resetPasswordExpires: { $gt: new Date() } 
    });

    if (!user) return res.status(400).json({ message: 'Invalid or expired token' });

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: 'Password has been reset' });
  } catch (error) {
    res.status(500).json({ error: 'Error resetting password' });
  }
};

// Forgot Password

export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;
  
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    const token = crypto.randomBytes(20).toString('hex');
    
    user.resetPasswordToken = token;
    user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour expiry
    await user.save();
    
    const resetURL = `${req.protocol}://${req.get('host')}/auth/reset/${token}`;
    
    await transporter.sendMail({
      to: user.email,
      subject: 'Password Reset',
      text: `Please click on the following link to reset your password: ${resetURL}`,
    });

    res.json({ message: 'Password reset link sent to your email.' });
  } catch (error) {
    console.error('Error in forgotPassword:', error);
    res.status(500).json({ error: 'Error processing request' });
  }
};

// Add technician function (Admin only)
export const addTechnician = async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;  // Pass the technician's user ID

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if the user is already a technician
    if (user.role === 'technician') {
      return res.status(400).json({ message: 'User is already a technician' });
    }

    // Check if technician profile already exists
    const existingTechnician = await Technician.findOne({ userId });
    if (existingTechnician) {
      return res.status(400).json({ message: 'Technician profile already exists' });
    }

    // Create new technician profile
    const newTechnician = new Technician({
      userId: new mongoose.Types.ObjectId(userId),
      available: true,  // Mark technician as available
      handledChats: []
    });

    // Save the technician profile
    await newTechnician.save();

    // Update user's role to 'technician'
    user.role = 'technician';
    await user.save();

    res.status(201).json({ message: 'Technician added successfully', technician: newTechnician });
  } catch (error) {
    res.status(500).json({ error: 'Error adding technician' });
  }
};
