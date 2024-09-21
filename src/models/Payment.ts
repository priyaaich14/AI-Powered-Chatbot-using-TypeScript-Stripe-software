
import mongoose, { Document, Schema } from 'mongoose'; 

export interface IPayment extends Document {
  userId: mongoose.Types.ObjectId;
  transactionId: string;
  amount: number;
  status: 'success' | 'pending' | 'failed';
}

const paymentSchema: Schema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  transactionId: { type: String, required: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ['success', 'pending', 'failed'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IPayment>('Payment', paymentSchema);