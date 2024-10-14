
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { AppDispatch } from '../../redux/store.ts';
import { loginUser } from '../../redux/slices/authSlice.ts';
import { toast } from 'react-toastify';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await dispatch(loginUser({ email, password })).unwrap();
      toast.success('Login successful!');
      
      // Redirect based on the user's role
      if (result.user.role === 'user') {
        navigate('/user');
      } else if (result.user.role === 'technician') {
        navigate('/technician');
      } else if (result.user.role === 'admin') {
        navigate('/admin');
      }
    } catch (error: any) {
      toast.error(error.message || 'Invalid credentials');
    }
  };

  return (
    <div className="login">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Login</button>
      </form>
      <div>
        <a href="/forgot-password">Forgot Password?</a>
      </div>
      <div>
        <a href="/register">Don't have an account? Register here.</a>
      </div>
    </div>
  );
};

export default Login;
