import React, { useState } from 'react';
import { updateEmail, updatePassword, deleteAccount } from '../features/auth/authAPI';
import { toast } from 'react-toastify';

const UserSettings = () => {
  const [newEmail, setNewEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Update Email Function
  const handleUpdateEmail = async () => {
    try {
      await updateEmail({ newEmail });
      toast.success('Email updated successfully');
    } catch (error) {
      toast.error('Error updating email');
    }
  };

  // Update Password Function
  const handleUpdatePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      await updatePassword({ currentPassword, newPassword });
      toast.success('Password updated successfully');
      setCurrentPassword(''); // Clear fields
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      toast.error('Error updating password');
    }
  };

  // Delete Account Function
  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account?')) {
      try {
        await deleteAccount();
        toast.success('Account deleted successfully');
      } catch (error) {
        toast.error('Error deleting account');
      }
    }
  };

  return (
    <div className="settings-container">
      <h2>User Settings</h2>

      {/* Update Email */}
      <div className="update-email">
        <input
          type="email"
          placeholder="New Email"
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
        />
        <button onClick={handleUpdateEmail}>Update Email</button>
      </div>

      {/* Update Password */}
      <div className="update-password">
        <h3>Update Password</h3>
        <input
          type="password"
          placeholder="Current Password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
        />
        <input
          type="password"
          placeholder="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <input
          type="password"
          placeholder="Confirm New Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        <button onClick={handleUpdatePassword}>Update Password</button>
      </div>

      {/* Delete Account */}
      <div className="delete-account">
        <button onClick={handleDeleteAccount}>Delete Account</button>
      </div>
    </div>
  );
};

export default UserSettings;
