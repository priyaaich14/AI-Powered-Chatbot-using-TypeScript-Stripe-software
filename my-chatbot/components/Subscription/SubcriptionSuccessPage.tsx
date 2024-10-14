import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { getSubscriptionDetails } from '../../redux/slices/paymentSlice.ts';
import { RootState, AppDispatch } from '../../redux/store.ts';
import { toast } from 'react-toastify';

const SubscriptionSuccessPage: React.FC = () => {
  const location = useLocation();
  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();

  // Extract sessionId from URL (e.g., "?session_id=cs_test_1234")
  const sessionId = new URLSearchParams(location.search).get('session_id'); 

  const { subscription, isLoading, errorMessage, customer } = useSelector((state: RootState) => state.payment);

  useEffect(() => {
    if (sessionId) {
      console.log('Rendering SubscriptionSuccessPage...');
  console.log('Session ID:', sessionId);
      // Dispatch the action to fetch subscription details using sessionId
      dispatch(getSubscriptionDetails(sessionId))
        .unwrap()

        .then(() => {
          toast.success('Payment successful! You are now subscribed.');
        })
        .catch(() => {
          toast.error('Failed to retrieve subscription details.');
        });
    }
  }, [dispatch, sessionId]);

  const handleBackToDashboard = () => {
    navigate('/user');
  };

  if (isLoading) return <p>Loading subscription details...</p>;

  return (
    <div className="subscription-success-page">
      <h2>Subscription Successful!</h2>
      {subscription ? (
        <div>
          <p>Subscription ID: {subscription.id}</p>
          <p>Status: {subscription.status}</p>
          <p>Renewal Date: {subscription.currentPeriodEnd ? new Date(subscription.currentPeriodEnd * 1000).toLocaleDateString() : 'N/A'}</p>

          {/* Display customer details */}
          {customer && (
            <div>
              <p>Name: {customer.name}</p>
              <p>Email: {customer.email}</p>
            </div>
          )}
        </div>
      ) : (
        <p>{errorMessage ? `Error: ${errorMessage}` : 'No subscription details available.'}</p>
      )}
      <button onClick={handleBackToDashboard}>Back to Dashboard</button>
    </div>
  );
};
export default SubscriptionSuccessPage;
