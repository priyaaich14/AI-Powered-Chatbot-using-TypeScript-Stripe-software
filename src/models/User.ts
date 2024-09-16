import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password: string;
  role: 'user' | 'technician' | 'admin';
  subscriptionStatus: 'active' | 'inactive';
}

const userSchema: Schema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'technician', 'admin'], default: 'user' },
  subscriptionStatus: { type: String, enum: ['active', 'inactive'], default: 'inactive' },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IUser>('User', userSchema);
