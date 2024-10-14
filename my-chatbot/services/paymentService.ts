
import axios from 'axios';

// Set up your backend URL
const API_URL = 'http://localhost:5000/payment'; // Adjust according to your actual backend

// Get token from localStorage
const getToken = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user).token : null;
};

// Create a payment method (Only if you're manually creating one, but Stripe Checkout handles this)
const createPaymentMethod = async (paymentToken: string) => {
  const token = getToken();
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.post(`${API_URL}/method`, { paymentToken }, config);
  return response.data;
};

// Create a subscription manually (Used if not using Stripe Checkout)
const createSubscription = async (email: string, paymentMethodId: string, priceId: string, name: string, phone: string) => {
  const token = getToken();
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  try {
    const response = await axios.post(
      `${API_URL}/stripe/create`,
      {
        email,
        paymentMethodId,
        priceId,
        name,
        phone,
      },
      config
    );
    return response.data;
  } catch (error: any) {
    const message =
      (error.response && error.response.data && error.response.data.message) ||
      error.message ||
      'Error occurred while creating the subscription';
    throw new Error(message);
  }
};

// Cancel a subscription
const cancelSubscription = async (subscriptionId: string) => {
  const token = getToken();
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.post(`${API_URL}/stripe/cancel`, { subscriptionId }, config);
  return response.data;
};

// Handle payment intent confirmation (for 3D Secure or other confirmation)
const handlePaymentIntent = async (paymentIntentId: string) => {
  const token = getToken();
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.post(`${API_URL}/stripe/confirm`, { paymentIntentId }, config);
  return response.data;
};

// Get subscription details from backend using sessionId
const getSubscriptionDetails = async (sessionId: string) => {
  const token = getToken();
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  try {
    const response = await axios.get(`${API_URL}/subscription/${sessionId}`, config);
    return response.data;
  } catch (error: any) {
    throw new Error(
      (error.response && error.response.data && error.response.data.message) ||
      error.message ||
      'Error fetching subscription details'
    );
  }
};

// Get payment details
const getPaymentDetails = async (paymentId: string) => {
  const token = getToken();
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.get(`${API_URL}/${paymentId}`, config);
  return response.data;
};

// Create a checkout session for Stripe hosted page (Removed paymentMethodId)
const createCheckoutSession = async ({
  priceId,
  email,
  name,
  phone,
}: { priceId: string; email: string; name: string; phone: string }) => {
  
  const token = getToken(); // Retrieve the token from localStorage or session
  const config = {
    headers: {
      Authorization: `Bearer ${token}`, // Set authorization header
    },
  };

  // Make the API request to create a checkout session
  const response = await axios.post(
    `${API_URL}/stripe/create-checkout-session`,
    {
      priceId,
      email,
      name,
      phone,
    },
    config
  );

  // Return the response from backend
  return response.data;
};


// Export all payment services
const paymentService = {
  createPaymentMethod,
  createSubscription,
  cancelSubscription,
  handlePaymentIntent,
  getSubscriptionDetails,
  getPaymentDetails,
  createCheckoutSession,
};

export default paymentService;
