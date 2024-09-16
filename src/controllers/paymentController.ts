
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

// export const createStripeSubscription = async (req: Request, res: Response) => {
//   const { email, paymentMethodId, priceId, userId } = req.body;  // Use 'priceId'

//   try {
//     // Create a customer in Stripe
//     const customer = await stripe.customers.create({
//       email,
//       payment_method: paymentMethodId,
//       invoice_settings: {
//         default_payment_method: paymentMethodId,
//       },
//     });

//     // Create a subscription in Stripe
//     const subscription = await stripe.subscriptions.create({
//       customer: customer.id,
//       items: [{ price: priceId }],  // Use 'price' instead of 'plan'
//     });

//     // Extract the price information from the subscription's items array
//     const priceAmount = subscription.items.data[0].price.unit_amount;

//     // Save subscription info in your database
//     const newSubscription = new Subscription({
//       userId,
//       plan: priceId,  // Save priceId as the 'plan'
//       status: 'active',
//       renewalDate: new Date(subscription.current_period_end * 1000),
//     });
//     await newSubscription.save();

//     // Save payment info in your database
//     const payment = new Payment({
//       userId,
//       transactionId: subscription.latest_invoice,
//       amount: priceAmount,  // Get the amount from the subscription's price data
//       status: 'success',
//     });
//     await payment.save();

//     res.json({ subscription });
//   } catch (error) {
//     console.error('Error creating subscription:', error);
//     res.status(500).json({ error: 'Error creating subscription' });
//   }
// };
// export const createStripeSubscription = async (req: Request, res: Response) => {
//   const { email, paymentMethodId, priceId, userId } = req.body;

//   try {
//     // Create a customer in Stripe
//     const customer = await stripe.customers.create({
//       email,
//       payment_method: paymentMethodId,
//       invoice_settings: {
//         default_payment_method: paymentMethodId,
//       },
//     });

//     // Create a subscription in Stripe
//     const subscription = await stripe.subscriptions.create({
//       customer: customer.id,
//       items: [{ price: priceId }],
//     });

//     // Extract the price information from the subscription's items array
//     const priceAmount = subscription.items.data[0].price.unit_amount;

//     // Check if the latest_invoice is available
//     const transactionId = subscription.latest_invoice || 'mock_transaction_id';  // Fallback if null

//     // Save subscription info in your database
//     const newSubscription = new Subscription({
//       userId,
//       plan: priceId,
//       status: 'active',
//       renewalDate: new Date(subscription.current_period_end * 1000),
//     });
//     await newSubscription.save();

//     // Save payment info in your database
//     const payment = new Payment({
//       userId,
//       transactionId,  // Use the fallback transaction ID if not available
//       amount: priceAmount || 0,  // Fallback to 0 if priceAmount is null
//       status: 'success',
//     });
//     await payment.save();

//     res.json({ subscription });
//   } catch (error) {
//     console.error('Error creating subscription:', error);
//     res.status(500).json({ error: 'Error creating subscription' });
//   }
// };
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
