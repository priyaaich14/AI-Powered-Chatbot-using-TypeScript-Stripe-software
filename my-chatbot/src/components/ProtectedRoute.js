import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux'; // Assuming you're using Redux to store auth state

const ProtectedRoute = ({ children, roleCheck }) => {
  const { user, isAuthenticated } = useSelector((state) => state.auth); // Getting auth state from Redux or a similar store

  // If the user is not authenticated, redirect to login page
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // If the role check fails, redirect to unauthorized page
  if (user && !roleCheck(user.role)) {
    return <Navigate to="/unauthorized" />;
  }

  // If authenticated and authorized, allow access to the page
  return children;
};

export default ProtectedRoute;
