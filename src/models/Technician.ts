
import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ITechnician extends Document {
  userId: Types.ObjectId;
  available: boolean;
  handledChats: Types.ObjectId[];
}

const technicianSchema: Schema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  available: { type: Boolean, default: true },
  handledChats: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ChatSession' }],
  createdAt: { type: Date, default: Date.now },
});

// Create an index for faster lookups by availability
technicianSchema.index({ available: 1 });

export default mongoose.model<ITechnician>('Technician', technicianSchema);
