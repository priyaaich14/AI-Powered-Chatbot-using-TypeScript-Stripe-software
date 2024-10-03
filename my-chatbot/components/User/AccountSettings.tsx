import React, { useState } from 'react';
import { updateEmail, updatePassword, deleteAccount } from '../../services/authService.ts';
import { toast } from 'react-toastify';

const AccountSettings: React.FC = () => {
  const [newEmail, setNewEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleEmailUpdate = async () => {
    try {
      await updateEmail(newEmail);
      toast.success('Email updated successfully!');
    } catch (error) {
      toast.error('Failed to update email');
    }
  };

  const handlePasswordUpdate = async () => {
    try {
      await updatePassword(currentPassword, newPassword);
      toast.success('Password updated successfully!');
    } catch (error) {
      toast.error('Failed to update password');
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await deleteAccount();
      toast.success('Account deleted successfully!');
    } catch (error) {
      toast.error('Failed to delete account');
    }
  };

  return (
    <div>
      <h3>Update Account</h3>
      <div>
        <label>New Email:</label>
        <input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
        <button onClick={handleEmailUpdate}>Update Email</button>
      </div>
      <div>
        <label>Current Password:</label>
        <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
        <label>New Password:</label>
        <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
        <button onClick={handlePasswordUpdate}>Update Password</button>
      </div>
      <div>
        <button onClick={handleDeleteAccount}>Delete Account</button>
      </div>
    </div>
  );
};

export default AccountSettings;
