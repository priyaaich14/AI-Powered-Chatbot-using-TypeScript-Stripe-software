import React, { useState } from 'react';
import { sendPasswordResetEmail } from '../../services/authService.ts';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await sendPasswordResetEmail(email);
      toast.success('Password reset link sent to your email');
      navigate('/');
    } catch (error) {
      toast.error('Failed to send password reset email');
    }
  };

  return (
    <div className="forgot-password">
      <h2>Forgot Password</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Email:</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <button type="submit">Send Reset Email</button>
      </form>
    </div>
  );
};

export default ForgotPassword;
