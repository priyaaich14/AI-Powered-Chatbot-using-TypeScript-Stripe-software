
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState, AppDispatch } from '../../redux/store.ts';
import { getSubscriptionDetails, cancelSubscription } from '../../redux/slices/paymentSlice.ts';
import { toast } from 'react-toastify';
import { selectAuth, updateUserSubscriptionStatus } from '../../redux/slices/authSlice.ts';

const SubscriptionPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch: AppDispatch = useDispatch();
  const { subscription, customer, isLoading } = useSelector((state: RootState) => state.payment);
  const { user } = useSelector(selectAuth);
  
  useEffect(() => {
    if (!subscription && user?.subscriptionId) {
      console.log("Fetching subscription details with ID:", user.subscriptionId);
      dispatch(getSubscriptionDetails(user.subscriptionId)).then((result) => {
        if (getSubscriptionDetails.fulfilled.match(result) && result.payload) {
          const { subscription } = result.payload;
          if (subscription?.status) {
            // Dispatch action to update user's subscription status
            dispatch(updateUserSubscriptionStatus(subscription.status));
          }
        } else if (getSubscriptionDetails.rejected.match(result)) {
          // Handle rejection case, log an error, or show a message
          console.error('Failed to fetch subscription details:', result.payload);
        }
      });
    }
  }, [dispatch, subscription, user]);
  

  const handleCancelSubscription = async () => {
    if (subscription && subscription.id) {
      try {
        await dispatch(cancelSubscription(subscription.id)).unwrap();
        toast.success('Subscription has been canceled.');
      } catch (error: any) {
        toast.error(error.message || 'Failed to cancel subscription.');
      }
    }
  };

  if (isLoading) {
    return <p>Loading subscription details...</p>;
  }

  return (
    <div className="subscription-page">
      {/* <h2>Welcome, {customer?.name || user?.name}</h2> */}

      {subscription ? (
        <div className="subscription-details">
          <h4>Subscription Details:</h4>
          <p><strong>Subscription ID:</strong> {subscription.id}</p>
          <p><strong>Status:</strong> {subscription.status}</p>
          <p>Renewal Date: {subscription.currentPeriodEnd ? new Date(subscription.currentPeriodEnd * 1000).toLocaleDateString() : 'N/A'}</p>
          <h4>Customer Details:</h4>
          {customer && (
            <>
              <p><strong>Name:</strong> {customer.name}</p>
              <p><strong>Email:</strong> {customer.email}</p>
            </>
          )}
          <button onClick={handleCancelSubscription} className="cancel-button">
            Cancel Subscription
          </button>
        </div>
      ) : (
        <>
          <p>Subscribe to Our Premium Service</p>
          <p>Get access to exclusive features and more with our premium subscription!</p>

          <div className="plan-details">
            <h3>Subscription Plan</h3>
            <p><strong>Price:</strong> ₹2,000/month</p>
            <p><strong>Features:</strong> Unlimited access, premium support, and more.</p>
          </div>
          <button onClick={() => navigate('/user/checkout')} className="subscribe-button">
            Proceed to Payment
          </button>
        </>
      )}
    </div>
  );
};

export default SubscriptionPage;
