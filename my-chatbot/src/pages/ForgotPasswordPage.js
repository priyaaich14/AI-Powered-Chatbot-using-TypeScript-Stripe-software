import React, { useState } from 'react';
import { toast } from 'react-toastify';
import axios from '../services/api';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/auth/forgot-password', { email });
      toast.success('Password reset link sent to your email');
    } catch (error) {
      toast.error('Failed to send password reset link');
    }
  };

  return (
    <form onSubmit={handleForgotPassword}>
      <h2>Forgot Password</h2>
      <input
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button type="submit">Send Reset Link</button>
    </form>
  );
};

export default ForgotPasswordPage;
