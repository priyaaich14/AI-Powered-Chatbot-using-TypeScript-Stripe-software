
import mongoose, { Document, Schema } from 'mongoose';

// Define the IUser interface to include all possible subscription statuses from Stripe
export interface IUser extends Document {
  _id: mongoose.Types.ObjectId; // Ensure _id is defined as ObjectId
  name: string;
  email: string;
  password: string;
  role: 'user' | 'technician' | 'admin';
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  subscriptionStatus: 'active' | 'inactive' | 'paused' | 'trialing' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'past_due' | 'unpaid';
  stripeCustomerId: string;
  subscriptionId?: string; // Add subscriptionId to store the Stripe subscription ID
  createdAt: Date;
}

// Define the user schema with appropriate fields and types
const userSchema: Schema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'technician', 'admin'], default: 'user' },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
  subscriptionStatus: {
    type: String,
    enum: ['active', 'inactive', 'paused', 'trialing', 'canceled', 'incomplete', 'incomplete_expired', 'past_due', 'unpaid'],
    default: 'inactive',
  }, // Subscription status
  stripeCustomerId: { type: String, required: true }, // Stripe customer ID
  subscriptionId: { type: String }, // Stripe subscription ID
  createdAt: { type: Date, default: Date.now },
});

// Export the User model using the IUser interface
export default mongoose.model<IUser>('User', userSchema);
