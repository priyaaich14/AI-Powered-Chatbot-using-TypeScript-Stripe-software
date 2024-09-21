/////////////// USING STRIPE_MOCK FROM GITHUB/////////////////////////////////////////

// import { Request, Response } from 'express';
// import Stripe from 'stripe';
// import Subscription from '../models/Subscription';
// import Payment from '../models/Payment';

// // Initialize Stripe with Mock configuration
// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
//   apiVersion: '2024-06-20',  // Use the correct API version
//   host: 'localhost',         // Points to Stripe Mock
//   port: 12111,               // The port where Stripe Mock is running
//   protocol: 'http',          // Use HTTP since Stripe Mock is running locally
// });
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

//     // Return response with subscription, email, and userId
//     res.json({
//       subscription,
//       email,   // Include email in the response
//       userId,  // Include userId in the response
//     });
//   } catch (error) {
//     console.error('Error creating subscription:', error);
//     res.status(500).json({ error: 'Error creating subscription' });
//   }
// };
// export const cancelStripeSubscription = async (req: Request, res: Response) => {
//   const { subscriptionId } = req.body;

//   try {
//     // Cancel the subscription by setting 'cancel_at_period_end' to true
//     const canceledSubscription = await stripe.subscriptions.update(subscriptionId, {
//       cancel_at_period_end: true,  // Cancels the subscription at the end of the current billing cycle
//     });

//     // Optionally, update the subscription status in your database
//     await Subscription.findOneAndUpdate(
//       { subscriptionId }, // Assuming subscriptionId is saved in your database
//       { status: 'canceled' }
//     );

//     res.json({ message: 'Subscription will be canceled at the end of the current billing period', canceledSubscription });
//   } catch (error) {
//     console.error('Error canceling subscription:', error);
//     res.status(500).json({ error: 'Error canceling subscription' });
//   }
// };
// export const handleStripeWebhook = async (req: Request, res: Response) => {
//   const sig = req.headers['stripe-signature'] as string;
//   let stripeEvent: Stripe.Event;

//   if (process.env.USE_STRIPE_MOCK === 'true') {
//     console.log('Running with stripe-mock, skipping signature validation.');
//     stripeEvent = req.body;
//   } else {
//     try {
//       stripeEvent = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
//     } catch (err) {
//       console.error(`⚠️  Webhook signature verification failed.`, err);
//       return res.sendStatus(400);
//     }
//   }

//   console.log(`Received event type: ${stripeEvent.type}`);

//   if (stripeEvent.type === 'invoice.payment_failed') {
//     const invoice = stripeEvent.data.object as Stripe.Invoice;
//     const subscriptionId = invoice.subscription as string;

//     console.log(`Handling payment failure for subscription: ${subscriptionId}`);

//     // Update the payment status in your database
//     await Payment.findOneAndUpdate(
//       { transactionId: invoice.id },
//       { status: 'failed' }
//     );

//     // Cancel the subscription
//     try {
//       await stripe.subscriptions.cancel(subscriptionId);
//       console.log(`Successfully canceled subscription: ${subscriptionId}`);
//     } catch (err) {
//       console.error(`Failed to cancel subscription: ${subscriptionId}`, err);
//     }
//   }

//   res.json({ received: true });
// };



//////////////////// USING STRIPE KEYS TEST ////////////////////////////////////////

// import { Request, Response } from 'express';
// import Stripe from 'stripe';
// import Payment from '../models/Payment';
// import Subscription from '../models/Subscription';

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
//   apiVersion: '2024-06-20',
// });

// // Create a Payment Method
// export const createPaymentMethod = async (req: Request, res: Response) => {
//   const { paymentToken } = req.body;

//   try {
//     // Create a payment method using a token (e.g., tok_visa)
//     const paymentMethod = await stripe.paymentMethods.create({
//       type: 'card',
//       card: {
//         token: paymentToken,
//       },
//     });

//     res.json({ paymentMethodId: paymentMethod.id });
//   } catch (error) {
//     console.error('Error creating payment method:', error);
//     res.status(500).json({ error: 'Error creating payment method' });
//   }
// };

// // Create a Subscription
// export const createStripeSubscription = async (req: Request, res: Response) => {
//   const { email, paymentMethodId, priceId, name, line1, city, state, country, postal_code } = req.body;

//   try {
//     // Create a customer in Stripe
//     const customer = await stripe.customers.create({
//       email,
//       payment_method: paymentMethodId,
//       invoice_settings: {
//         default_payment_method: paymentMethodId,
//       },
//       name, // Use dynamic name and address
//       address: {
//         line1,
//         city,
//         state,
//         country,
//         postal_code,
//       },
//     });

//     // Attach the payment method to the customer
//     await stripe.paymentMethods.attach(paymentMethodId, {
//       customer: customer.id,
//     });

//     // Create a subscription
//     const subscription = await stripe.subscriptions.create({
//       customer: customer.id,
//       items: [{ price: priceId }],
//       expand: ['latest_invoice.payment_intent'],
//     });

//     // Check if latest_invoice exists and get payment intent
//     const latestInvoice = subscription.latest_invoice as Stripe.Invoice;

//     if (latestInvoice && latestInvoice.payment_intent) {
//       const paymentIntent = latestInvoice.payment_intent as Stripe.PaymentIntent;

//       if (paymentIntent.status === 'requires_payment_method') {
//         return res.status(400).json({
//           error: 'Payment was declined. Please use a different payment method or try again.',
//           paymentIntentStatus: paymentIntent.status,
//           reason: paymentIntent.last_payment_error?.message || 'Card was declined',
//         });
//       }
//     }

//     res.json({ subscription });
//   } catch (error: any) {
//     console.error('Error creating subscription:', error);
//     res.status(500).json({ error: 'Error creating subscription', message: error.message });
//   }
// };

// // Cancel a Subscription
// export const cancelStripeSubscription = async (req: Request, res: Response) => {
//   const { subscriptionId } = req.body;

//   try {
//     const canceledSubscription = await stripe.subscriptions.cancel(subscriptionId);

//     // Optionally, update the subscription status in your database
//     await Subscription.findOneAndUpdate(
//       { subscriptionId },
//       { status: 'canceled' }
//     );

//     res.json({ message: 'Subscription has been canceled', canceledSubscription });
//   } catch (error) {
//     console.error('Error canceling subscription:', error);
//     res.status(500).json({ error: 'Error canceling subscription' });
//   }
// };


/////////////////////////////// USING STRIPE KEYS ////////////////////////////////////////////

import { Request, Response } from 'express';
import Stripe from 'stripe';
import Subscription from '../models/Subscription';
import { IAuthRequest } from '../middlewares/auth'; // Importing IAuthRequest from your authController

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20', // Ensure you're using the correct Stripe API version
});

// Create Payment Method
export const createPaymentMethod = async (req: Request, res: Response) => {
  const { paymentToken } = req.body;

  try {
    // Create a payment method using a token (e.g., tok_visa)
    const paymentMethod = await stripe.paymentMethods.create({
      type: 'card',
      card: {
        token: paymentToken, // Use the token from Stripe (e.g., tok_visa)
      },
    });

    res.status(200).json({ paymentMethodId: paymentMethod.id });
  } catch (error: any) {
    console.error('Error creating payment method:', error.message);
    res.status(500).json({ error: 'Error creating payment method', message: error.message });
  }
};

// Create a Subscription
// export const createStripeSubscription = async (req: Request, res: Response) => {
//   const { email, paymentMethodId, priceId, name } = req.body;

//   try {
//     // Create a customer in Stripe
//     const customer = await stripe.customers.create({
//       email,
//       name,
//       payment_method: paymentMethodId,
//       invoice_settings: {
//         default_payment_method: paymentMethodId,
//       },
//     });

//     // Create a subscription for the customer
//     const subscription = await stripe.subscriptions.create({
//       customer: customer.id,
//       items: [{ price: priceId }],
//       expand: ['latest_invoice.payment_intent'],
//     });

//     // Check the payment intent, but we're assuming non-3DS cards, so we skip further action checks
//     const latestInvoice = subscription.latest_invoice as Stripe.Invoice;
//     const paymentIntent = latestInvoice.payment_intent as Stripe.PaymentIntent;

//     // If no authentication is required, it will succeed here
//     if (paymentIntent && paymentIntent.status === 'succeeded') {
//       res.status(200).json({
//         message: 'Subscription created successfully',
//         subscription,
//       });
//     } else {
//       res.status(200).json({
//         message: 'Subscription created, but no immediate charge',
//         subscription,
//       });
//     }
//   } catch (error: any) {
//     console.error('Error creating subscription:', error.message);
//     res.status(500).json({ error: 'Error creating subscription', message: error.message });
//   }
// };

// Create a Subscription
export const createStripeSubscription = async (req: Request, res: Response) => {
  const { email, paymentMethodId, priceId, name,phone } = req.body;

  try {
    // Create a customer in Stripe
    const customer = await stripe.customers.create({
      email,
      name,
      phone,
      payment_method: paymentMethodId,
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    // Create a subscription for the customer
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: priceId }],
      expand: ['latest_invoice.payment_intent'],
      payment_behavior:'default_incomplete', // Ensure subscription remains incomplete until payment is confirmed
      payment_settings: {
        payment_method_options: {
          card: {
            request_three_d_secure: 'automatic', // Set to automatic to minimize unnecessary 3DS
          },
        },
      },
    });

    // Check the payment intent
    const latestInvoice = subscription.latest_invoice as Stripe.Invoice;
    const paymentIntent = latestInvoice.payment_intent as Stripe.PaymentIntent;

    // Handle if payment requires additional action like 3DS
    if (paymentIntent && paymentIntent.status === 'requires_action') {
      return res.status(400).json({
        error: 'Payment requires further authentication.',
        paymentIntentClientSecret: paymentIntent.client_secret,
        nextAction: paymentIntent.next_action,
      });
    }

    // Subscription creation successful without further actions
    res.status(200).json({
      message: 'Subscription created successfully',
      subscription,
    });
  } catch (error: any) {
    console.error('Error creating subscription:', error.message);
    res.status(500).json({ error: 'Error creating subscription', message: error.message });
  }
};


// Cancel a Subscription
export const cancelStripeSubscription = async (req: Request, res: Response) => {
  const { subscriptionId } = req.body;

  try {
    // Cancel the subscription
    const canceledStripeSubscription = await stripe.subscriptions.cancel(subscriptionId);

    // Optionally, update the subscription status in your database
    await Subscription.findOneAndUpdate(
      { stripeSubscriptionId: subscriptionId },
      { status: 'canceled' }
    );

    res.status(200).json({ message: 'Subscription has been canceled', canceledStripeSubscription });
  } catch (error: any) {
    console.error('Error canceling subscription:', error.message);
    res.status(500).json({ error: 'Error canceling subscription', message: error.message });
  }
};

// Get Subscription Details
// export const getSubscriptionDetails = async (req: IAuthRequest, res: Response) => {
//   try {
//     const { subscriptionId } = req.params;

//     // Check if the user is authenticated
//     if (!req.user) {
//       return res.status(401).json({ error: 'Unauthorized' });
//     }

//     // Fetch subscription details from Stripe
//     const subscription = await stripe.subscriptions.retrieve(subscriptionId);

//     // Extract the customer ID from the subscription
//     const customerId = subscription.customer as string;

//     // Fetch customer details from Stripe using the customer ID
//     const customer = await stripe.customers.retrieve(customerId);

//     // Combine subscription and customer details
//     res.status(200).json({
//       subscription,
//       customer, // This will include details like email, phone, etc.
//     });
//   } catch (error) {
//     console.error('Error retrieving subscription:', error);
//     res.status(500).json({ error: 'Error retrieving subscription' });
//   }
// };
export const getSubscriptionDetails = async (req: IAuthRequest, res: Response) => {
  try {
    const { subscriptionId } = req.params;

    // Check if the user is authenticated
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Fetch subscription details from Stripe
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);

    // Extract the customer ID from the subscription
    const customerId = subscription.customer as string;

    // Fetch customer details from Stripe using the customer ID
    const customer = await stripe.customers.retrieve(customerId);

    // Check if the subscription is expired based on current_period_end
    const isExpired = new Date(subscription.current_period_end * 1000) < new Date();

    // Combine subscription, customer, and status details
    res.status(200).json({
      subscription: {
        ...subscription,
        isExpired, // Custom flag to indicate if the subscription is expired
      },
      customer, // This will include details like email, phone, etc.
      status: subscription.status, // Include Stripe status (e.g., "active", "canceled", etc.)
    });
  } catch (error) {
    console.error('Error retrieving subscription:', error);
    res.status(500).json({ error: 'Error retrieving subscription' });
  }
};

// Handle Payment Intent Statuses (insufficient balance, card declined, etc.)
export const handlePaymentIntent = async (req: IAuthRequest, res: Response) => {
  const { paymentIntentId } = req.body;

  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    switch (paymentIntent.status) {
      case 'succeeded':
        return res.status(200).json({ message: 'Payment successful', paymentIntent });

      case 'requires_payment_method':
        return res.status(400).json({ error: 'Payment failed, card declined' });

      case 'requires_action':
        return res.status(400).json({ error: 'Payment requires additional action' });

      case 'canceled':
        return res.status(400).json({ error: 'Payment canceled, insufficient balance' });

      default:
        return res.status(500).json({ error: 'Payment failed, unknown error' });
    }
  } catch (error) {
    console.error('Error handling payment intent:', error);
    res.status(500).json({ error: 'Error handling payment intent' });
  }
};

// Get Payment Details

export const getPaymentDetails = async (req: IAuthRequest, res: Response) => {
  try {
    const { paymentId } = req.params;

    // Check if the user is authenticated
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Retrieve the payment intent
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentId);

    // Check if there's a customer associated with the payment intent
    const customerId = paymentIntent.customer as string;

    // If there's a customer ID, retrieve customer details
    let customerDetails = null;
    if (customerId) {
      customerDetails = await stripe.customers.retrieve(customerId);
    }

    // Return payment details along with customer details (if available)
    res.status(200).json({
      paymentIntent,
      customer: customerDetails, // Include customer details in the response
    });
  } catch (error) {
    console.error('Error retrieving payment details:', error);
    res.status(500).json({ error: 'Error retrieving payment details' });
  }
};
