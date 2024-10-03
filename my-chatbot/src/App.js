import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import AdminDashboard from './pages/AdminDashboard';
import TechnicianDashboard from './pages/TechnicianDashboard';
import UserDashboard from './pages/UserDashboard';
import UnauthorizedPage from './pages/UnauthorizedPage';
import NotFoundPage from './pages/NotFoundPage';
import { isAdmin, isTechnician, isUser } from './utils/roleUtils';
import ProtectedRoute from './components/ProtectedRoute';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

        {/* Admin Route */}
        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute roleCheck={isAdmin}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Technician Route */}
        <Route
          path="/technician-dashboard"
          element={
            <ProtectedRoute roleCheck={isTechnician}>
              <TechnicianDashboard />
            </ProtectedRoute>
          }
        />

        {/* User Route */}
        <Route
          path="/user-dashboard"
          element={
            <ProtectedRoute roleCheck={isUser}>
              <UserDashboard />
            </ProtectedRoute>
          }
        />

        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
};

export default App;
