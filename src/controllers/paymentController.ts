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



//////////// USING STRIPE KEYS ///////////////////////////////

// import { Request, Response } from 'express';
// import Stripe from 'stripe';
// import Payment from '../models/Payment';
// import Subscription from '../models/Subscription';

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
//   apiVersion: '2024-06-20',
// });


// // Create a Payment Method
// export const createPaymentMethod = async (req: Request, res: Response) => {
//   const { cardNumber, expMonth, expYear, cvc } = req.body;

//   try {
//     // Create a payment method using the card details
//     const paymentMethod = await stripe.paymentMethods.create({
//       type: 'card',
//       card: {
//         number: cardNumber,
//         exp_month: expMonth,
//         exp_year: expYear,
//         cvc: cvc,
//       },
//     });

//     res.json({ paymentMethodId: paymentMethod.id });
//   } catch (error) {
//     console.error('Error creating payment method:', error);
//     res.status(500).json({ error: 'Error creating payment method' });
//   }
// };

// export const createStripeSubscription = async (req: Request, res: Response) => {
//   const { email, paymentMethodId, priceId } = req.body;

//   try {
//     // Step 1: Create a customer in Stripe
//     const customer = await stripe.customers.create({
//       email,
//       payment_method: paymentMethodId,
//       invoice_settings: {
//         default_payment_method: paymentMethodId,
//       },
//     });

//     // Step 2: Attach the payment method to the customer
//     await stripe.paymentMethods.attach(paymentMethodId, {
//       customer: customer.id,
//     });

//     // Step 3: Create a subscription
//     const subscription = await stripe.subscriptions.create({
//       customer: customer.id,
//       items: [{ price: priceId }],
//       expand: ['latest_invoice.payment_intent'], // Ensure payment intent is included
//     });

//     // Step 4: Check if latest_invoice exists and get payment intent
//     const latestInvoice = subscription.latest_invoice as Stripe.Invoice;

//     if (latestInvoice && latestInvoice.payment_intent) {
//       // Safely cast the payment_intent to a Stripe.PaymentIntent
//       const paymentIntent = latestInvoice.payment_intent as Stripe.PaymentIntent;

//       // Check the payment intent status
//       if (paymentIntent.status === 'requires_payment_method') {
//         return res.status(400).json({
//           error: 'Payment was declined. Please use a different payment method or try again.',
//           paymentIntentStatus: paymentIntent.status,
//           reason: paymentIntent.last_payment_error?.message || 'Card was declined',
//         });
//       }
//     }

//     // Step 5: Respond with the subscription details
//     res.json({ subscription });
//   } catch (error: any) {
//     console.error('Error creating subscription:', error);

//     // Check if it's a Stripe error and handle it accordingly
//     if (error.type === 'StripeCardError' || error.type === 'StripeInvalidRequestError') {
//       return res.status(400).json({
//         error: 'Payment failed due to invalid card or request.',
//         message: error.message,
//       });
//     }

//     // Handle other errors
//     res.status(500).json({ error: 'Error creating subscription', message: error.message });
//   }
// };


// export const cancelStripeSubscription = async (req: Request, res: Response) => {
//   const { subscriptionId } = req.body;

//   try {
//     // Cancel the subscription
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


// // export const handleStripeWebhook = async (req: Request, res: Response) => {
// //   const sig = req.headers['stripe-signature'] as string;
// //   let event: Stripe.Event;

// //   try {
// //     event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
// //   } catch (err) {
// //     console.error(`⚠️  Webhook signature verification failed.`, err);
// //     return res.sendStatus(400);
// //   }

// //   if (event.type === 'invoice.payment_failed') {
// //     const invoice = event.data.object as Stripe.Invoice;

// //     // Check if payment_intent is available and its type
// //     const paymentIntentId = typeof invoice.payment_intent === 'string' ? invoice.payment_intent : invoice.payment_intent?.id;

// //     // Process payment failure
// //     if (paymentIntentId) {
// //       // Update payment status in your database
// //       await Payment.findOneAndUpdate(
// //         { transactionId: invoice.id },
// //         { status: 'failed' }
// //       );

// //       console.log(`Payment failed for invoice: ${invoice.id}, paymentIntent: ${paymentIntentId}`);
// //     }
// //   }

// //   res.json({ received: true });
// // };

// // Handle Stripe Webhook
// export const handleStripeWebhook = async (req: Request, res: Response) => {
//   const sig = req.headers['stripe-signature'] as string;
//   let event: Stripe.Event;

//   try {
//     // Pass the raw body to Stripe's constructEvent function
//     event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
//   } catch (err) {
//     if (err instanceof Error) {
//       console.error(`⚠️  Webhook signature verification failed: ${err.message}`);
//     }
//     return res.sendStatus(400); // Bad Request
//   }

//   // Handle specific event types
//   if (event.type === 'invoice.payment_failed') {
//     const invoice = event.data.object as Stripe.Invoice;

//     // Check if payment_intent is available and its type
//     const paymentIntentId = typeof invoice.payment_intent === 'string' ? invoice.payment_intent : invoice.payment_intent?.id;

//     // Log payment failure event
//     if (paymentIntentId) {
//       // Update payment status in your database
//       await Payment.findOneAndUpdate(
//         { transactionId: invoice.id },
//         { status: 'failed' }
//       );
//       console.log(`Payment failed for invoice: ${invoice.id}, paymentIntent: ${paymentIntentId}`);
//     }
//   }

//   res.json({ received: true });
// };


import { Request, Response } from 'express';
import Stripe from 'stripe';
import Payment from '../models/Payment';
import Subscription from '../models/Subscription';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

// Create a Payment Method
export const createPaymentMethod = async (req: Request, res: Response) => {
  const { paymentToken } = req.body;

  try {
    // Create a payment method using a token (e.g., tok_visa)
    const paymentMethod = await stripe.paymentMethods.create({
      type: 'card',
      card: {
        token: paymentToken,
      },
    });

    res.json({ paymentMethodId: paymentMethod.id });
  } catch (error) {
    console.error('Error creating payment method:', error);
    res.status(500).json({ error: 'Error creating payment method' });
  }
};

// Create a Subscription
export const createStripeSubscription = async (req: Request, res: Response) => {
  const { email, paymentMethodId, priceId, name, line1, city, state, country, postal_code } = req.body;

  try {
    // Create a customer in Stripe
    const customer = await stripe.customers.create({
      email,
      payment_method: paymentMethodId,
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
      name, // Use dynamic name and address
      address: {
        line1,
        city,
        state,
        country,
        postal_code,
      },
    });

    // Attach the payment method to the customer
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customer.id,
    });

    // Create a subscription
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: priceId }],
      expand: ['latest_invoice.payment_intent'],
    });

    // Check if latest_invoice exists and get payment intent
    const latestInvoice = subscription.latest_invoice as Stripe.Invoice;

    if (latestInvoice && latestInvoice.payment_intent) {
      const paymentIntent = latestInvoice.payment_intent as Stripe.PaymentIntent;

      if (paymentIntent.status === 'requires_payment_method') {
        return res.status(400).json({
          error: 'Payment was declined. Please use a different payment method or try again.',
          paymentIntentStatus: paymentIntent.status,
          reason: paymentIntent.last_payment_error?.message || 'Card was declined',
        });
      }
    }

    res.json({ subscription });
  } catch (error: any) {
    console.error('Error creating subscription:', error);
    res.status(500).json({ error: 'Error creating subscription', message: error.message });
  }
};

// Cancel a Subscription
export const cancelStripeSubscription = async (req: Request, res: Response) => {
  const { subscriptionId } = req.body;

  try {
    const canceledSubscription = await stripe.subscriptions.cancel(subscriptionId);

    // Optionally, update the subscription status in your database
    await Subscription.findOneAndUpdate(
      { subscriptionId },
      { status: 'canceled' }
    );

    res.json({ message: 'Subscription has been canceled', canceledSubscription });
  } catch (error) {
    console.error('Error canceling subscription:', error);
    res.status(500).json({ error: 'Error canceling subscription' });
  }
};

// Handle Stripe Webhook
// export const handleStripeWebhook = async (req: Request, res: Response) => {
//   const sig = req.headers['stripe-signature'] as string;
//   let event: Stripe.Event;

//   try {
//     // Pass the raw body to Stripe's constructEvent function
//     event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
//   } catch (err) {
//     if (err instanceof Error) {
//       console.error(`⚠️  Webhook signature verification failed: ${err.message}`);
//     }
//     return res.sendStatus(400); // Bad Request
//   }

//   // Handle specific event types
//   if (event.type === 'invoice.payment_failed') {
//     const invoice = event.data.object as Stripe.Invoice;
//     const paymentIntentId = typeof invoice.payment_intent === 'string' ? invoice.payment_intent : invoice.payment_intent?.id;

//     // Log payment failure event
//     if (paymentIntentId) {
//       await Payment.findOneAndUpdate(
//         { transactionId: invoice.id },
//         { status: 'failed' }
//       );
//       console.log(`Payment failed for invoice: ${invoice.id}, paymentIntent: ${paymentIntentId}`);
//     }
//   }

//   res.json({ received: true });
// };
// Handle Stripe Webhook
// export const handleStripeWebhook = async (req: Request, res: Response) => {
//   const sig = req.headers['stripe-signature'] as string;
//   let event: Stripe.Event;

//   try {
//     // Pass the raw body to Stripe's constructEvent function
//     event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
//   } catch (err) {
//     if (err instanceof Error) {
//       console.error(`⚠️  Webhook signature verification failed: ${err.message}`);
//     }
//     return res.sendStatus(400); // Bad Request
//   }

//   // Handle specific event types
//   if (event.type === 'invoice.payment_failed') {
//     const invoice = event.data.object as Stripe.Invoice;
//     const paymentIntentId = typeof invoice.payment_intent === 'string' ? invoice.payment_intent : invoice.payment_intent?.id;

//     // Log payment failure event
//     if (paymentIntentId) {
//       await Payment.findOneAndUpdate(
//         { transactionId: invoice.id },
//         { status: 'failed' }
//       );
//       console.log(`Payment failed for invoice: ${invoice.id}, paymentIntent: ${paymentIntentId}`);
//     }
//   }

//   res.json({ received: true });
// };
// export const handleStripeWebhook = async (req: Request, res: Response) => {
//   const sig = req.headers['stripe-signature'] as string;
//   let event: Stripe.Event;

//   try {
//     // Pass the raw body to Stripe's constructEvent function
//     event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
//   } catch (err) {
//     if (err instanceof Error) {
//       console.error(`⚠️  Webhook signature verification failed: ${err.message}`);
//     }
//     return res.sendStatus(400); // Bad Request
//   }

//   // Handle specific event types
//   if (event.type === 'invoice.payment_failed') {
//     const invoice = event.data.object as Stripe.Invoice;

//     // Check if payment_intent is available and its type
//     const paymentIntentId = typeof invoice.payment_intent === 'string' ? invoice.payment_intent : invoice.payment_intent?.id;

//     // Log payment failure event
//     if (paymentIntentId) {
//       // Update payment status in your database
//       await Payment.findOneAndUpdate(
//         { transactionId: invoice.id },
//         { status: 'failed' }
//       );
//       console.log(`Payment failed for invoice: ${invoice.id}, paymentIntent: ${paymentIntentId}`);
//     }
//   }

//   res.json({ received: true });
// };

// Handle Stripe Webhook
export const handleStripeWebhook = async (req: Request, res: Response) => {
  // Temporarily bypassing signature check for Postman testing
  let event;
  if (process.env.NODE_ENV === 'development' && !req.headers['stripe-signature']) {
      console.log('Bypassing signature check in development mode');
      event = req.body; // Directly using the parsed body for testing
  } else {
      const sig = req.headers['stripe-signature'] as string;
      try {
        console.log("Stripe Webhook Secret:", process.env.STRIPE_WEBHOOK_SECRET);

          event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
      } catch (err) {
          if (err instanceof Error) {
              console.error(`⚠️  Webhook signature verification failed: ${err.message}`);
          }
          return res.sendStatus(400); // Bad Request
      }
  }

  // Proceed with your event handling logic
  console.log(`Received event type: ${event.type}`);
  res.json({ received: true });
};
