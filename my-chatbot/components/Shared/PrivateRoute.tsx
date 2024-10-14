
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectAuth } from '../../redux/slices/authSlice.ts';

interface PrivateRouteProps {
  role: string;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ role }) => {
  const { user } = useSelector(selectAuth);

  // If no user or token, redirect to login
  if (!user || !user.role) {
    return <Navigate to="/login" />;
  }

  // If user role doesn't match the required role, redirect to not authorized page
  if (user.role !== role) {
    return <Navigate to="/not-authorized" />;
  }

  // Otherwise, render the requested component (Outlet)
  return <Outlet />;
};

export default PrivateRoute;
