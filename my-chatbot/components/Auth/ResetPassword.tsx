// src/components/Auth/ResetPassword.tsx
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { resetPasswordAPI } from '../../services/authService.ts'; // Import the function
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
const ResetPassword: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [newPassword, setNewPassword] = useState('');
  const navigate = useNavigate();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await resetPasswordAPI(token!, newPassword); // Call the API to reset password
      toast.success('Password has been reset successfully!');
      navigate('/');
    } catch (error) {
      toast.error('Failed to reset password');
    }
  };

  return (
    <div className="reset-password">
      <h2>Reset Password</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>New Password:</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Reset Password</button>
      </form>
    </div>
  );
};

export default ResetPassword;
