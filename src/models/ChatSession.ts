
import mongoose, { Document, Schema, Types } from 'mongoose';
import { IUser } from './User';  // Import the IUser interface

export interface IChatSession extends Document {
  sessionId: string;
  userId: Types.ObjectId | IUser;  // Ensure userId references the IUser interface or ObjectId
  messages: { 
    sender: string; 
    senderType: 'user' | 'Bot' | 'technician';  // Add senderType here to the messages interface
    message: string; 
    timestamp: Date 
  }[];
  status: 'open' | 'escalated' | 'closed';
  escalatedTo?: Types.ObjectId | IUser;  // Same here for escalatedTo
  updatedAt: Date; // Add this line

}

const chatSessionSchema = new Schema({
  sessionId: { type: String, required: true }, // UUID instead of ObjectId
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  escalatedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Technician', required: false },
  messages: [
    {
      sender: { type: String, required: true },
      senderType: { type: String, enum: ['user', 'Bot', 'technician'], required: true },  // The type of sender
      message: { type: String, required: true },
      timestamp: { type: Date, default: Date.now }
    }
  ],
  status: { type: String, enum: ['open', 'escalated', 'closed'], default: 'open' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now } // Add this line
});

export default mongoose.model<IChatSession>('ChatSession', chatSessionSchema);
