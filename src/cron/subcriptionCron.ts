import cron from 'node-cron';
import Subscription from '../models/Subscription';

// This cron job runs every day at midnight
cron.schedule('0 0 * * *', async () => {
  try {
    const currentDate = new Date();

    // Find all active subscriptions where renewalDate has passed
    const expiredSubscriptions = await Subscription.find({
      status: 'active',
      renewalDate: { $lt: currentDate },
    });

    if (expiredSubscriptions.length > 0) {
      for (const subscription of expiredSubscriptions) {
        subscription.status = 'expired';
        await subscription.save();
        console.log(`Subscription ${subscription._id} marked as expired.`);
      }
    }
  } catch (error) {
    console.error('Error marking subscriptions as expired:', error);
  }
});
