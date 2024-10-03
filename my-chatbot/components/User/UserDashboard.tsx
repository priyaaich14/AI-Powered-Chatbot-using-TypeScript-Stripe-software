// import React, { useState } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { useNavigate } from 'react-router-dom';
// import { AppDispatch } from '../../redux/store.ts';
// import { logout, updateEmail, updatePassword, deleteAccount, selectAuth } from '../../redux/slices/authSlice.ts';
// import { toast } from 'react-toastify';

// const UserDashboard: React.FC = () => {
//   const dispatch: AppDispatch = useDispatch();
//   const navigate = useNavigate();
//   const { user } = useSelector(selectAuth);

//   const [newEmail, setNewEmail] = useState('');
//   const [currentPassword, setCurrentPassword] = useState('');
//   const [newPassword, setNewPassword] = useState('');

//   const handleLogout = () => {
//     dispatch(logout());
//     navigate('/');
//   };

//   const handleUpdateEmail = async (e: React.FormEvent) => {
//     e.preventDefault();
//     try {
//       await dispatch(updateEmail(newEmail)).unwrap();
//       toast.success('Email updated successfully');
//       setNewEmail('');
//     } catch (error: any) {
//       toast.error(error.message || 'Failed to update email');
//     }
//   };

//   const handleUpdatePassword = async (e: React.FormEvent) => {
//     e.preventDefault();
//     try {
//       await dispatch(updatePassword({ oldPassword: currentPassword, newPassword })).unwrap();
//       toast.success('Password updated successfully');
//       setCurrentPassword('');
//       setNewPassword('');
//     } catch (error: any) {
//       toast.error(error.message || 'Failed to update password');
//     }
//   };

//   const handleDeleteAccount = async () => {
//     if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
//       try {
//         await dispatch(deleteAccount()).unwrap();
//         toast.success('Your account has been deleted');
//         navigate('/');
//       } catch (error: any) {
//         toast.error(error.message || 'Failed to delete account');
//       }
//     }
//   };

//   return (
//     <div className="user-dashboard">
//       <h2>Welcome, {user?.name}</h2>
//       <p>Email: {user?.email}</p>
//       <p>Role: {user?.role}</p>

//       <h3>Update Email</h3>
//       <form onSubmit={handleUpdateEmail}>
//         <input
//           type="email"
//           value={newEmail}
//           onChange={(e) => setNewEmail(e.target.value)}
//           placeholder="New Email"
//           required
//         />
//         <button type="submit">Update Email</button>
//       </form>

//       <h3>Update Password</h3>
//       <form onSubmit={handleUpdatePassword}>
//         <input
//           type="password"
//           value={currentPassword}
//           onChange={(e) => setCurrentPassword(e.target.value)}
//           placeholder="Current Password"
//           required
//         />
//         <input
//           type="password"
//           value={newPassword}
//           onChange={(e) => setNewPassword(e.target.value)}
//           placeholder="New Password"
//           required
//         />
//         <button type="submit">Update Password</button>
//       </form>

//       <button onClick={handleDeleteAccount}>Delete Account</button>
//       <button onClick={handleLogout}>Logout</button>
//     </div>
//   );
// };

// export default UserDashboard;


import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { AppDispatch } from '../../redux/store.ts';
import { logout, updateEmail, updatePassword, deleteAccount, selectAuth } from '../../redux/slices/authSlice.ts';
import { toast } from 'react-toastify';

const UserDashboard: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector(selectAuth);

  const [newEmail, setNewEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await dispatch(updateEmail(newEmail)).unwrap();
      toast.success('Email updated successfully');
      setNewEmail('');

      // Log out the user and redirect to login
      toast.info('Please log in again after updating your email');
      //dispatch(logout());
      navigate('/');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update email');
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await dispatch(updatePassword({ oldPassword: currentPassword, newPassword })).unwrap();
      toast.success('Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');

      // Log out the user and redirect to login
      toast.info('Please log in again after updating your password');
      //dispatch(logout());
      navigate('/');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update password');
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      try {
        await dispatch(deleteAccount()).unwrap();
        toast.success('Your account has been deleted');
        navigate('/');
      } catch (error: any) {
        toast.error(error.message || 'Failed to delete account');
      }
    }
  };

  return (
    <div className="user-dashboard">
      <h2>Welcome, {user?.name}</h2>
      <p>Email: {user?.email}</p>
      <p>Role: {user?.role}</p>

      <h3>Update Email</h3>
      <form onSubmit={handleUpdateEmail}>
        <input
          type="email"
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
          placeholder="New Email"
          required
        />
        <button type="submit">Update Email</button>
      </form>

      <h3>Update Password</h3>
      <form onSubmit={handleUpdatePassword}>
        <input
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          placeholder="Current Password"
          required
        />
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="New Password"
          required
        />
        <button type="submit">Update Password</button>
      </form>

      <button onClick={handleDeleteAccount}>Delete Account</button>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default UserDashboard;
