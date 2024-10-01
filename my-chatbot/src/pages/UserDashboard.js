import React from 'react';
import ChatBox from '../components/ChatBox';
import ChatHistory from '../components/ChatHistory';
import { useDispatch } from 'react-redux';
import { logout } from '../features/auth/authSlice';
import { useNavigate } from 'react-router-dom';

const UserDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };
  return (
    <div>
      <h1>User Dashboard</h1>
      <button onClick={handleLogout}>Logout</button> {/* Logout button */}
      <ChatBox />
      <ChatHistory />
    </div>
  );
};

export default UserDashboard;
