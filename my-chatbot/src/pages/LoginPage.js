import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { loginUser } from '../features/auth/authSlice'; // Assuming Redux for state management
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const userData = await dispatch(loginUser({ email, password })); // Dispatch login action
      const { role } = userData.payload;

      // Redirect based on role after login
      if (role === 'admin') {
        navigate('/admin-dashboard');
      } else if (role === 'technician') {
        navigate('/technician-dashboard');
      } else {
        navigate('/user-dashboard');
      }
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  // Navigate to Forgot Password page
  const handleForgotPasswordClick = () => {
    navigate('/forgot-password');
  };

  return (
    <form onSubmit={handleLogin}>
      <h2>Login</h2>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button type="submit">Login</button>

      {/* Forgot Password Link */}
      <p>
        <button
          type="button"
          onClick={handleForgotPasswordClick}
          style={{ background: 'none', border: 'none', color: 'blue', textDecoration: 'underline', cursor: 'pointer' }}
        >
          Forgot Password?
        </button>
      </p>
    </form>
  );
};

export default LoginPage;
