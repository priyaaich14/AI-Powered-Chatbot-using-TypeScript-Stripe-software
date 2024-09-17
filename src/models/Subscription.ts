import mongoose, { Document, Schema } from 'mongoose';
export interface ISubscription extends Document {
  userId: mongoose.Types.ObjectId;
  plan: string;
  status: 'active' | 'canceled' | 'expired';
  renewalDate: Date;
}

const subscriptionSchema: Schema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  plan: { type: String, required: true },
  status: { type: String, enum: ['active', 'canceled', 'expired'], default: 'active' },
  renewalDate: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<ISubscription>('Subscription', subscriptionSchema);
