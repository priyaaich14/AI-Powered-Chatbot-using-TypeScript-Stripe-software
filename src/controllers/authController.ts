import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User'

export const registerUser = async (req: Request, res: Response) => {
  const { email, password, role } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ email, password: hashedPassword, role });
    await newUser.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error registering user' });
  }
};

// export const loginUser = async (req: Request, res: Response) => {
//   const { email, password } = req.body;

//   try {
//     const user = await User.findOne({ email });
//     if (!user) return res.status(404).json({ message: 'User not found' });

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

//     const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET!, { expiresIn: '1h' });
//     res.json({ token });
//   } catch (error) {
//     res.status(500).json({ error: 'Error logging in' });
//   }
// };
export const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    // Generate JWT token with user ID and role
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET!, { expiresIn: '1h' });

    // Return both the token and userId in the response
    res.json({ token, userId: user._id });
  } catch (error) {
    res.status(500).json({ error: 'Error logging in' });
  }
};
