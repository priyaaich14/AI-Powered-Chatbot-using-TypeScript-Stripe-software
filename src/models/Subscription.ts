
import mongoose, { Document, Schema } from 'mongoose';

export interface ISubscription extends Document {
  userId: mongoose.Types.ObjectId;
  plan: string;
  status: 'active' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'past_due' | 'unpaid' | 'expired';
  renewalDate: Date;
  createdAt: Date;
}

const subscriptionSchema: Schema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  plan: { type: String, required: true },
  status: {
    type: String,
    enum: ['active', 'canceled', 'incomplete', 'incomplete_expired', 'past_due', 'unpaid', 'expired'],
    default: 'incomplete',  // Defaulting to 'incomplete' until payment is confirmed
  },
  renewalDate: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<ISubscription>('Subscription', subscriptionSchema);
