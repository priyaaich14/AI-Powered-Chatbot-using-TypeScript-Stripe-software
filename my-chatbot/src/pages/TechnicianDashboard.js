import React from 'react';
import AllChats from '../components/AllChats'; // Only show escalated chats for the technician
import { useDispatch } from 'react-redux';
import { logout } from '../features/auth/authSlice';
import { useNavigate } from 'react-router-dom';

const TechnicianDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };
  return (
    <div>
      <h1>Technician Dashboard</h1>
      <button onClick={handleLogout}>Logout</button> {/* Logout button */}
      <AllChats /> {/* Show all escalated chats */}
    </div>
  );
};

export default TechnicianDashboard;
