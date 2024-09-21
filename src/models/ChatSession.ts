
import mongoose, { Document, Schema, Types } from 'mongoose';
import { IUser } from './User';  // Import the IUser interface

export interface IChatSession extends Document {
  sessionId: string;
  userId: Types.ObjectId | IUser;  // Ensure userId references the IUser interface or ObjectId
  messages: { sender: string; message: string; timestamp: Date }[];
  status: 'open' | 'escalated' | 'closed';
  escalatedTo?: Types.ObjectId | IUser;  // Same here for escalatedTo
}

const chatSessionSchema = new mongoose.Schema({
  sessionId: { type: String, required: true }, // UUID instead of ObjectId
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  escalatedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Technician', required: false },
  messages: [
    {
      sender: { type: String, required: true },
      message: { type: String, required: true },
      timestamp: { type: Date, default: Date.now }
    }
  ],
  status: { type: String, enum: ['open', 'escalated', 'closed'], default: 'open' },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IChatSession>('ChatSession', chatSessionSchema);
