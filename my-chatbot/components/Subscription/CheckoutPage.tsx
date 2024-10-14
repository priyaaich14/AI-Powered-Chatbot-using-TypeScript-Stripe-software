
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { RootState, AppDispatch } from '../../redux/store.ts';
import { createCheckoutSession } from '../../redux/slices/paymentSlice.ts';
import { loadStripe } from '@stripe/stripe-js';

// Load your Stripe publishable key
const stripePromise = loadStripe('pk_test_51K8SLdSCl2fLeg6XelnITJ2kURTlfFdQA9ksTcF3XXguGIhyb9TPSy7kjj2W79Tcz0qscoijWNJ09vMI81VwJs9e00oIiXsMtn'); 

const CheckoutPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const [phone, setPhone] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Utility function to validate phone number (basic validation for demo purposes)
  const validatePhoneNumber = (phoneNumber: string) => {
    const phoneRegex = /^[0-9]{10}$/; // Simple regex for 10-digit numbers
    return phoneRegex.test(phoneNumber);
  };

  // Function to handle the checkout session creation
  const handleCheckout = async () => {
    if (!user) {
      toast.error('Please log in to continue.');
      navigate('/login');
      return;
    }

    if (!phone) {
      toast.error('Please provide your phone number.');
      return;
    }

    if (!validatePhoneNumber(phone)) {
      toast.error('Please provide a valid 10-digit phone number.');
      return;
    }

    setIsProcessing(true);

    try {
      // Dispatch the action to create a checkout session
      const resultAction = await dispatch(
        createCheckoutSession({
          priceId: 'price_1Q0gdMSCl2fLeg6Xo6jFRpfK', // Replace with your Stripe price ID
          email: user.email,
          name: user.name,
          phone,
        })
      ).unwrap();

      // Load Stripe and redirect to Checkout page
      const stripe = await stripePromise;
      if (stripe && resultAction.sessionId) {
        const { error } = await stripe.redirectToCheckout({ sessionId: resultAction.sessionId });

        if (error) {
          toast.error(`Checkout failed: ${error.message}`);
        }
      }
    } catch (error) {
      toast.error('Failed to initiate payment.');
      console.error('Checkout error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="checkout-page">
      <h2>Checkout Page</h2>

      <div>
        <label>Phone Number</label>
        <input
          type="text"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Enter your 10-digit phone number"
        />
      </div>

      <button onClick={handleCheckout} disabled={isProcessing}>
        {isProcessing ? 'Processing...' : 'Proceed to Payment'}
      </button>
    </div>
  );
};

export default CheckoutPage;
