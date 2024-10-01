import React from 'react';
import AdminUserList from '../components/AdminUserList';
import AllChats from '../components/AllChats';
import { useDispatch } from 'react-redux';
import { logout } from '../features/auth/authSlice';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Handle logout and navigate to login page
  const handleLogout = () => {
    dispatch(logout()); // Dispatch the logout action
    navigate('/login'); // Redirect to the login page after logging out
  };
  return (
    <div>
      <h1>Admin Dashboard</h1>
      <button onClick={handleLogout}>Logout</button> {/* Logout button */}
      <AdminUserList />
      <AllChats />
    </div>
  );
};

export default AdminDashboard;
