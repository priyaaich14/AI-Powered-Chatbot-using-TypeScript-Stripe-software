import { Request, Response } from 'express';
import Stripe from 'stripe';
import Subscription from '../models/Subscription';
import Payment from '../models/Payment';

// Initialize Stripe with Mock configuration
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',  // Use the correct API version
  host: 'localhost',         // Points to Stripe Mock
  port: 12111,               // The port where Stripe Mock is running
  protocol: 'http',          // Use HTTP since Stripe Mock is running locally
});
export const createStripeSubscription = async (req: Request, res: Response) => {
  const { email, paymentMethodId, priceId, userId } = req.body;

  try {
    // Create a customer in Stripe
    const customer = await stripe.customers.create({
      email,
      payment_method: paymentMethodId,
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    // Create a subscription in Stripe
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: priceId }],
    });

    // Extract the price information from the subscription's items array
    const priceAmount = subscription.items.data[0].price.unit_amount;

    // Check if the latest_invoice is available
    const transactionId = subscription.latest_invoice || 'mock_transaction_id';  // Fallback if null

    // Save subscription info in your database
    const newSubscription = new Subscription({
      userId,
      plan: priceId,
      status: 'active',
      renewalDate: new Date(subscription.current_period_end * 1000),
    });
    await newSubscription.save();

    // Save payment info in your database
    const payment = new Payment({
      userId,
      transactionId,  // Use the fallback transaction ID if not available
      amount: priceAmount || 0,  // Fallback to 0 if priceAmount is null
      status: 'success',
    });
    await payment.save();

    // Return response with subscription, email, and userId
    res.json({
      subscription,
      email,   // Include email in the response
      userId,  // Include userId in the response
    });
  } catch (error) {
    console.error('Error creating subscription:', error);
    res.status(500).json({ error: 'Error creating subscription' });
  }
};
export const cancelStripeSubscription = async (req: Request, res: Response) => {
  const { subscriptionId } = req.body;

  try {
    // Cancel the subscription by setting 'cancel_at_period_end' to true
    const canceledSubscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,  // Cancels the subscription at the end of the current billing cycle
    });

    // Optionally, update the subscription status in your database
    await Subscription.findOneAndUpdate(
      { subscriptionId }, // Assuming subscriptionId is saved in your database
      { status: 'canceled' }
    );

    res.json({ message: 'Subscription will be canceled at the end of the current billing period', canceledSubscription });
  } catch (error) {
    console.error('Error canceling subscription:', error);
    res.status(500).json({ error: 'Error canceling subscription' });
  }
};
export const handleStripeWebhook = async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'] as string;
  let stripeEvent: Stripe.Event;

  if (process.env.USE_STRIPE_MOCK === 'true') {
    console.log('Running with stripe-mock, skipping signature validation.');
    stripeEvent = req.body;
  } else {
    try {
      stripeEvent = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
    } catch (err) {
      console.error(`⚠️  Webhook signature verification failed.`, err);
      return res.sendStatus(400);
    }
  }

  console.log(`Received event type: ${stripeEvent.type}`);

  if (stripeEvent.type === 'invoice.payment_failed') {
    const invoice = stripeEvent.data.object as Stripe.Invoice;
    const subscriptionId = invoice.subscription as string;

    console.log(`Handling payment failure for subscription: ${subscriptionId}`);

    // Update the payment status in your database
    await Payment.findOneAndUpdate(
      { transactionId: invoice.id },
      { status: 'failed' }
    );

    // Cancel the subscription
    try {
      await stripe.subscriptions.cancel(subscriptionId);
      console.log(`Successfully canceled subscription: ${subscriptionId}`);
    } catch (err) {
      console.error(`Failed to cancel subscription: ${subscriptionId}`, err);
    }
  }

  res.json({ received: true });
};
