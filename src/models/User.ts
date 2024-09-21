
import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'user' | 'technician' | 'admin';
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  subscriptionStatus: 'active' | 'inactive';
  createdAt: Date;
}

const userSchema: Schema = new mongoose.Schema({
  name: { type: String, required: true },  // Added name field
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'technician', 'admin'], default: 'user' },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
  subscriptionStatus: { type: String, enum: ['active', 'inactive'], default: 'inactive' },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IUser>('User', userSchema);
