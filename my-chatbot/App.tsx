import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Login from './components/Auth/Login.tsx';
import Register from './components/Auth/Register.tsx';
import AdminDashboard from './components/Admin/AdminDashboard.tsx';
import TechnicianDashboard from './components/Technician/TechnicianDashboard.tsx';
import UserDashboard from './components/User/UserDashboard.tsx';
import PrivateRoute from './components/Shared/PrivateRoute.tsx';
import NotAuthorizedPage from './components/Shared/NotAuthorizedPage.tsx';
import ForgotPassword from './components/Auth/ForgotPassword.tsx';
import ResetPassword from './components/Auth/ResetPassword.tsx';
import NotFoundPage from './components/Shared/NotFoundPage.tsx';

const App: React.FC = () => {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          {/* Admin Route */}
          <Route path="/admin" element={<PrivateRoute role="admin" />}>
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>

          {/* Technician Route */}
          <Route path="/technician" element={<PrivateRoute role="technician" />}>
            <Route path="/technician" element={<TechnicianDashboard />} />
          </Route>

          {/* User Route */}
          <Route path="/user" element={<PrivateRoute role="user" />}>
            <Route path="/user" element={<UserDashboard />} />
          </Route>

          <Route path="/not-authorized" element={<NotAuthorizedPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        <ToastContainer />
      </div>
    </Router>
  );
};

export default App;
