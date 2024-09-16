
// import mongoose, { Document, Schema, Types } from 'mongoose';
// import { ITechnician } from './Technician';  // Import the Technician interface

// export interface IChatSession extends Document {
//   userId: Types.ObjectId;
//   messages: { sender: string; message: string; timestamp: Date }[];
//   status: 'open' | 'escalated' | 'closed';
//   escalatedTo?: Types.ObjectId | ITechnician;  // Allow either ObjectId or populated Technician document
// }

// const chatSessionSchema: Schema = new mongoose.Schema({
//   userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
//   messages: [
//     { sender: { type: String, required: true }, message: { type: String, required: true }, timestamp: { type: Date, default: Date.now } }
//   ],
//   status: { type: String, enum: ['open', 'escalated', 'closed'], default: 'open' },
//   escalatedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Technician', required: false },
//   createdAt: { type: Date, default: Date.now },
// });

// // Index to speed up querying based on status
// chatSessionSchema.index({ status: 1 });

// // Pre-query middleware to auto-populate the `escalatedTo` field
// chatSessionSchema.pre<IChatSession>(/^find/, function (next) {
//   this.populate('escalatedTo');  // Populate the escalatedTo field with Technician data
//   next();
// });

// export default mongoose.model<IChatSession>('ChatSession', chatSessionSchema);


// src/models/ChatSession.ts
// import mongoose, { Document, Schema, Types } from 'mongoose';

// export interface IChatSession extends Document {
//   sessionId: string;
//   userId: Types.ObjectId;
//   messages: { sender: string; message: string; timestamp: Date }[];
//   status: 'open' | 'escalated' | 'closed';
//   escalatedTo?: Types.ObjectId | ITechnician;
// }

// const chatSessionSchema: Schema = new mongoose.Schema({
//   sessionId: { type: String, required: true },  // Add sessionId to the schema
//   userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
//   messages: [
//     { sender: { type: String, required: true }, message: { type: String, required: true }, timestamp: { type: Date, default: Date.now } }
//   ],
//   status: { type: String, enum: ['open', 'escalated', 'closed'], default: 'open' },
//   escalatedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Technician', required: false },
//   createdAt: { type: Date, default: Date.now },
// });

// export default mongoose.model<IChatSession>('ChatSession', chatSessionSchema);


import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IChatSession extends Document {
  sessionId: string;
  userId: Types.ObjectId;
  messages: { sender: string; message: string; timestamp: Date }[];
  status: 'open' | 'escalated' | 'closed';
  escalatedTo?: Types.ObjectId;  // Correctly refer to Types.ObjectId
}

const chatSessionSchema: Schema = new mongoose.Schema({
  sessionId: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  messages: [
    { sender: { type: String, required: true }, message: { type: String, required: true }, timestamp: { type: Date, default: Date.now } }
  ],
  status: { type: String, enum: ['open', 'escalated', 'closed'], default: 'open' },
  escalatedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Technician', required: false },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IChatSession>('ChatSession', chatSessionSchema);
