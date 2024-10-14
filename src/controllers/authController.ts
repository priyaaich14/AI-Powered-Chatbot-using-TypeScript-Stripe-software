import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User , { IUser} from '../models/User'
import Technician from '../models/Technician';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import mongoose from 'mongoose';
import ChatSession from '../models/ChatSession'; // Import ChatSession model
import Stripe from 'stripe'; // Make sure Stripe is imported

const stripe = new Stripe('sk_test_51K8SLdSCl2fLeg6X0IxSZAlzhIQ33wNVRwtwisxgFMDoSNqIDQtP0okJrxRKWLJ3bcBQUYmOL9QKj2IMBcsXOcqG00Qaxdk5AS', {
  apiVersion: '2020-08-27' as any, // Use the version shown in your Stripe dashboard
});

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
    // Check if the email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email is already in use' });
    }

    // Hash the user's password
    const hashedPassword = await bcrypt.hash(password, 10);

    // // Create a Stripe customer for the user
    const stripeCustomer = await stripe.customers.create({
      email,
      name,
    });

    // Create a new user with the provided data and the stripeCustomerId
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role,
     stripeCustomerId: stripeCustomer.id, // Save Stripe customer ID
    });
    await newUser.save();

    if (role === 'technician') {
      const newTechnician = new Technician({
        userId: newUser._id,
        available: true,  // Mark technician as available
        handledChats: [],
      });
      await newTechnician.save();
      console.log('Technician created:', newTechnician);
    }

    // Generate a JWT token for the newly created user
    const token = jwt.sign({ id: newUser._id, role: newUser.role }, process.env.JWT_SECRET!, { expiresIn: '1h' });

    res.status(201).json({
      token,
      user: { id: newUser._id, name: newUser.name, email: newUser.email, role: newUser.role },
    });
  } catch (error) {
    console.error('Error during user registration:', error);
    res.status(500).json({ error: 'Error registering user' });
  }
};

const updateSubscriptionOnLogin = async (userId: string) => {
  try {
    const user = await User.findById(userId);

    if (user && user.stripeCustomerId) {
      // Always fetch subscriptions from Stripe
      const subscriptions = await stripe.subscriptions.list({
        customer: user.stripeCustomerId,
        status: 'all',
        limit: 1,
      });

      if (subscriptions.data.length > 0) {
        const subscription = subscriptions.data[0];
        user.subscriptionId = subscription.id;
        user.subscriptionStatus = subscription.status as IUser['subscriptionStatus'];

        // Save updated subscription data in MongoDB
        await user.save();
      } else {
        console.warn(`No subscriptions found for customer ID: ${user.stripeCustomerId}`);
      }
    } else {
      console.warn(`User does not have a Stripe customer ID or user not found.`);
    }
  } catch (error) {
    console.error('Error updating subscription on login:', error);
  }
};

export const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }) as IUser;

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Update subscription details on login
    try {
      await updateSubscriptionOnLogin(user._id.toString());
    } catch (error) {
      console.error('Subscription update failed during login, but continuing:', error);
      // Optional: You could return a specific error message here if you want
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '1h' }
    );

    // Return user details and token
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        subscriptionId: user.subscriptionId,
        subscriptionStatus: user.subscriptionStatus,
      },
    });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ error: 'Error logging in' });
  }
};


// Ensure chat history is removed when a user is deleted
export const deleteOwnAccount = async (req: IAuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = req.user.id;

    // Delete the user's account
    await User.findByIdAndDelete(userId);

    // Delete the user's chat sessions
    await ChatSession.deleteMany({ userId });

    res.json({ message: 'Your account and chat history have been successfully deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting account and chat history' });
  }
};

// Admin can delete any user and their associated chat history
export const adminDeleteAccount = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const userToDelete = await User.findById(userId);
    if (!userToDelete) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Delete the user's account
    await User.findByIdAndDelete(userId);

    // Delete the user's chat sessions
    await ChatSession.deleteMany({ userId });

    res.json({ message: 'User account and chat history deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting account and chat history' });
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

    console.log('User ID from token:', req.user.id);  // Debugging log

    const { newEmail } = req.body;
    const user = await User.findById(req.user.id);  // Fetch user by ID

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
    
    //const resetURL = `${req.protocol}://${req.get('host')}/auth/reset-password/${token}`;
    const resetURL = `${process.env.FRONTEND_URL}/reset-password/${token}`;

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


// When adding a technician (Admin only)
export const addTechnician = async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.role === 'technician') {
      return res.status(400).json({ message: 'User is already a technician' });
    }

    const newTechnician = new Technician({
      userId: new mongoose.Types.ObjectId(userId),
      available: true,  // Mark technician as available
      handledChats: []
    });

    await newTechnician.save();
    user.role = 'technician';
    await user.save();

    res.status(201).json({ message: 'Technician added successfully', technician: newTechnician });
  } catch (error) {
    res.status(500).json({ error: 'Error adding technician' });
  }
};
