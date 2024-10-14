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
import User,{IUser} from '../models/User'

const stripe = new Stripe('sk_test_51K8SLdSCl2fLeg6X0IxSZAlzhIQ33wNVRwtwisxgFMDoSNqIDQtP0okJrxRKWLJ3bcBQUYmOL9QKj2IMBcsXOcqG00Qaxdk5AS', {
  apiVersion: '2020-08-27' as any, // Use the version shown in your Stripe dashboard
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


export const createStripeSubscription = async (req: Request, res: Response) => {
  const { email, paymentMethodId, priceId, name, phone } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Prevent multiple subscriptions if already subscribed
    if (user.subscriptionId) {
      const existingSubscription = await stripe.subscriptions.retrieve(user.subscriptionId);
      if (['active', 'incomplete'].includes(existingSubscription.status)) {
        return res.status(400).json({ error: 'User is already subscribed' });
      }
    }

    let customerId = user.stripeCustomerId;

    // Reuse existing customer or create a new one
    if (!customerId) {
      const customer = await stripe.customers.create({
        email,
        name,
        phone,
        payment_method: paymentMethodId,
        invoice_settings: { default_payment_method: paymentMethodId },
      });

      customerId = customer.id;
      user.stripeCustomerId = customerId;
      await user.save(); // Save customerId to MongoDB
    }

    // Create subscription
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      expand: ['latest_invoice.payment_intent'],
      payment_behavior: 'default_incomplete',
      payment_settings: {
        payment_method_options: { card: { request_three_d_secure: 'automatic' } },
      },
    });

    // Save subscription details to MongoDB
    user.subscriptionId = subscription.id;
    user.subscriptionStatus = subscription.status as IUser['subscriptionStatus'];;
    await user.save();

    const latestInvoice = subscription.latest_invoice as Stripe.Invoice;
    const paymentIntent = latestInvoice.payment_intent as Stripe.PaymentIntent;

    if (paymentIntent && paymentIntent.status === 'requires_action') {
      return res.status(400).json({
        error: 'Payment requires further authentication.',
        paymentIntentClientSecret: paymentIntent.client_secret,
        nextAction: paymentIntent.next_action,
      });
    }

    res.status(200).json({
      message: 'Subscription created successfully',
      subscription,
    });
  } catch (error) {
          console.error('Error creating subscription:', (error as Error).message);
         res.status(500).json({ error:'Error creating subscription', message:(error as Error).message});
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

export const getSubscriptionDetails = async (req: Request, res: Response) => {
  const { sessionId } = req.params;

  try {
    // Case 1: Check if it's a Checkout Session (for new users who just completed the checkout)
    if (sessionId.startsWith('cs_')) {  // Stripe checkout session IDs start with 'cs_'
      const session = await stripe.checkout.sessions.retrieve(sessionId, {
        expand: ['subscription'],
      });

      if (!session.subscription) {
        return res.status(400).json({
          error: 'No subscription found in the session',
          message: 'The checkout process has not been completed yet.',
        });
      }

      const subscription = session.subscription as Stripe.Subscription;

      // Fetch customer details
      const customerId = subscription.customer as string;
      const customer = await stripe.customers.retrieve(customerId);

      res.status(200).json({
        subscription: {
          id: subscription.id,
          status: subscription.status,
          currentPeriodEnd: subscription.current_period_end,
        },
        customer: {
          email: (customer as Stripe.Customer).email,
          name: (customer as Stripe.Customer).name,
        },
      });
    }
    // Case 2: Check if it's a Subscription ID (for returning users)
    else if (sessionId.startsWith('sub_')) {  // Stripe subscription IDs start with 'sub_'
      const subscription = await stripe.subscriptions.retrieve(sessionId);

      if (!subscription) {
        return res.status(404).json({
          error: 'Subscription not found',
          message: 'The subscription does not exist.',
        });
      }

      // Fetch customer details using the customer ID from the subscription
      const customerId = subscription.customer as string;
      const customer = await stripe.customers.retrieve(customerId);

      res.status(200).json({
        subscription: {
          id: subscription.id,
          status: subscription.status,
          currentPeriodEnd: subscription.current_period_end,
        },
        customer: {
          email: (customer as Stripe.Customer).email,
          name: (customer as Stripe.Customer).name,
        },
      });
    }
    // If neither a checkout session ID nor a subscription ID, return an error
    else {
      return res.status(400).json({
        error: 'Invalid session or subscription ID',
        message: 'The provided ID is not a valid checkout session or subscription ID.',
      });
    }
  } catch (error) {
    console.error('Error retrieving subscription details:', error);
    res.status(500).json({ error: 'Error retrieving subscription details' });
  }
};


export const handlePaymentIntent = async (req: IAuthRequest, res: Response) => {
  const { paymentIntentId, paymentMethodId } = req.body;

  try {
    // Retrieve the payment intent
    let paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    // Attach the payment method to the payment intent
    paymentIntent = await stripe.paymentIntents.update(paymentIntentId, {
      payment_method: paymentMethodId,
    });

    // Confirm the payment intent
    const confirmedIntent = await stripe.paymentIntents.confirm(paymentIntentId);

    // Handle the different statuses of the confirmed payment intent
    switch (confirmedIntent.status) {
      case 'succeeded':
        return res.status(200).json({ message: 'Payment successful', paymentIntent: confirmedIntent });
      case 'requires_action':
        return res.status(200).json({
          requiresAction: true,
          clientSecret: confirmedIntent.client_secret,
          nextAction: confirmedIntent.next_action,
        });
      case 'requires_payment_method':
        return res.status(400).json({ error: 'Payment failed, please try again with a different payment method' });
      case 'canceled':
        return res.status(400).json({ error: 'Payment canceled' });
      default:
        return res.status(500).json({ error: 'Payment failed, unknown error' });
    }
  } catch (error) {
    const err = error as Error;
    console.error('Error handling payment intent:', err.message);
    res.status(500).json({ error: 'Error handling payment intent', details: err.message });
  }
};


export const createCheckoutSession = async (req: Request, res: Response) => {
  const { priceId, email, name, phone, address } = req.body;

  try {
    // Find the user by email in MongoDB
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Use existing Stripe customer if available
    let customerId = user.stripeCustomerId;

    if (!customerId) {
      // If no Stripe customer exists, create a new one
      const customer = await stripe.customers.create({
        email: user.email,
        name: name, // Use 'name' from req.body to comply with regulations
        phone: phone,
        address: address, // Add address to comply with export regulations
      });
      customerId = customer.id;

      // Save the new stripeCustomerId in MongoDB
      user.stripeCustomerId = customerId;
      await user.save();
    }

    // Create the checkout session using the existing or newly created customer
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      customer: customerId, // Use the existing or newly created customer ID
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      billing_address_collection: 'required', // Ensure billing address is collected
      // Success and cancel URLs
      success_url: `${process.env.FRONTEND_URL}/user/subscription/success?session_id={CHECKOUT_SESSION_ID}`, // New success URL that points to your frontend
      cancel_url: `${process.env.FRONTEND_URL}/user/subscription/cancel`, // Frontend cancel URL
    });

    console.log('Stripe session ID:', session.id);
    res.status(200).json({ sessionId: session.id });
  } catch (error: any) {
    console.error('Error creating Stripe Checkout session:', error.message);
    res.status(500).json({ error: 'Failed to create session', message: error.message });
  }
};

export const handleSubscriptionSuccess = async (req: Request, res: Response) => {
  const { session_id } = req.query;

  try {
    // Retrieve the checkout session from Stripe using the session ID
    const session = await stripe.checkout.sessions.retrieve(session_id as string, {
      expand: ['subscription'],
    });

    const subscription = session.subscription;

    if (!subscription) {
      return res.status(400).json({ error: 'No subscription found' });
    }

    // Get the subscription ID and status
    const subscriptionId = (subscription as any).id;
    const subscriptionStatus = (subscription as any).status;

    // Find the user in MongoDB by email
    const user = await User.findOne({ email: session.customer_email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update the user's subscriptionId and subscriptionStatus in MongoDB
    user.subscriptionId = subscriptionId;
    user.subscriptionStatus = subscriptionStatus;
    await user.save();

    res.status(200).json({
      message: 'Subscription details updated successfully',
      subscriptionId,
      subscriptionStatus,
    });
  } catch (error: any) {
    console.error('Error handling subscription success:', error.message);
    res.status(500).json({ error: 'Error handling subscription success', message: error.message });
  }
};


// export const stripeWebhookHandler = async (req: Request, res: Response) => {
//   const sig = req.headers['stripe-signature'];
//   const stripeWebhookSecret = 'whsec_TP92wCFGB2iYWVpgNJIMAftFZ1DwMoCp1';

//   if (!stripeWebhookSecret) {
//     console.error('Stripe Webhook Secret is missing or undefined.');
//     return res.status(500).send('Webhook secret not configured.');
//   }

//   let event;

//   try {
//     event = stripe.webhooks.constructEvent(req.body, sig!, stripeWebhookSecret);

//     // Listen for checkout.session.completed event
//     if (event.type === 'checkout.session.completed') {
//       const session = event.data.object as Stripe.Checkout.Session;
//       const subscriptionId = session.subscription as string;  // Get the subscription ID
//       const customerId = session.customer as string;  // Get customer ID

//       console.log(`Subscription created: ${subscriptionId}, Customer: ${customerId}`);

//       // Find the user associated with this Stripe customer ID
//       const user = await User.findOne({ stripeCustomerId: customerId });

//       if (user) {
//         // Update user's subscription information
//         user.subscriptionId = subscriptionId;
//         user.subscriptionStatus = 'active'; // Mark subscription as active
//         await user.save();

//         console.log(`User subscription updated: ${user.email}`);
//       } else {
//         console.error('User with this customer ID not found');
//       }

//       res.status(200).json({ subscriptionId });
//     }

//     res.json({ received: true });
//   } catch (err) {
//     console.error(`Webhook error: ${err}`);
//     res.status(400).send('Webhook Error');
//   }
// };