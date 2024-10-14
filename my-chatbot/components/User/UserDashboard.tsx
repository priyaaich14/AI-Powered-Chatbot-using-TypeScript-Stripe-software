
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { AppDispatch, RootState } from '../../redux/store.ts';
import { logout, updateEmail, updatePassword, deleteAccount, selectAuth } from '../../redux/slices/authSlice.ts';
import { toast } from 'react-toastify';
import { FiSettings, FiLogOut, FiClock, FiCreditCard } from 'react-icons/fi';
import ChatInterface from '../Shared/ChatInterface.tsx';
import SubscriptionPage from '../Subscription/SubscriptionPage.tsx';
import { fetchUserChatHistory, setActiveChat, clearCurrentChat } from '../../redux/slices/chatSlice.ts';
import { IconContext } from 'react-icons';

// Utility function to check if the section is valid
const isValidSection = (section: string | null): section is 'chat' | 'welcome' | 'settings' | 'history' | 'subscribe' => {
  return ['chat', 'welcome', 'settings', 'history', 'subscribe'].includes(section as any);
};

const UserDashboard: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector(selectAuth);
  const { chatHistory } = useSelector((state: RootState) => state.chat);

  // Load active section from localStorage on component mount
  const [activeSection, setActiveSection] = useState<'welcome' | 'settings' | 'chat' | 'history' | 'subscribe'>(() => {
    const storedSection = localStorage.getItem('activeSection');
    return isValidSection(storedSection) ? storedSection : 'welcome';
  });

  const [newEmail, setNewEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // Save the active section to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('activeSection', activeSection);
  }, [activeSection]);

  // Check if a user is logged in and set the default section
  useEffect(() => {
    if (!localStorage.getItem('token')) {
      setActiveSection('welcome');
      localStorage.setItem('activeSection', 'welcome');
    } else {
      const storedSection = localStorage.getItem('activeSection');
      setActiveSection(isValidSection(storedSection) ? storedSection : 'welcome');
    }
  }, [user]);

  const handleLogout = () => {
    dispatch(clearCurrentChat());
    dispatch(logout());
    navigate('/');
  };

  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await dispatch(updateEmail(newEmail)).unwrap();
      toast.success('Email updated successfully');
      setNewEmail('');
      toast.info('Please log in again after updating your email');
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
      toast.info('Please log in again after updating your password');
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

  const handleStartChat = () => {
    dispatch(setActiveChat(true));
    setActiveSection('chat');
  };

  const handleViewHistory = () => {
    dispatch(fetchUserChatHistory());
    setActiveSection('history');
  };

  const toggleSettings = () => {
    setActiveSection('settings');
  };

  const handleBackToDashboard = () => {
    dispatch(clearCurrentChat());
    setActiveSection('welcome');
  };

  const handleSubscriptionClick = () => {
    setActiveSection('subscribe');
  };

  return (
    <div className="user-dashboard">
      <h2>Welcome, {user?.name}</h2>
      <IconContext.Provider value={{ size: '24' }}>
        <div className="dashboard-icons">
          <div className="icon-wrapper" onClick={toggleSettings}>
            <FiSettings />
          </div>
          <div className="icon-wrapper" onClick={handleViewHistory}>
            <FiClock />
          </div>
          <div className="icon-wrapper" onClick={handleSubscriptionClick}>
            <FiCreditCard />
          </div>
          <div className="icon-wrapper" onClick={handleLogout}>
            <FiLogOut />
          </div>
        </div>
      </IconContext.Provider>

      {/* Welcome Page */}
      {activeSection === 'welcome' && (
        <div className="welcome-section">
          <br />
          <button onClick={handleStartChat}>Start Chat</button>
        </div>
      )}

      {/* Chat Interface */}
      {activeSection === 'chat' && (
        <div className="chat-section">
          <ChatInterface role="user" />
          <button onClick={handleBackToDashboard}>Back to Dashboard</button>
        </div>
      )}

      {/* Settings Section */}
      {activeSection === 'settings' && (
        <div className="settings-section">
          <p>Email: {user?.email}</p>
          <p>Role: {user?.role}</p>

          <h4>Update Email</h4>
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

          <h4>Update Password</h4>
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
          <br />
          <button onClick={handleDeleteAccount}>Delete Account</button>
          <br />
          <button onClick={handleBackToDashboard}>Back to Dashboard</button>
        </div>
      )}

      {/* Chat History Section */}
      {activeSection === 'history' && (
        <div className="chat-history">
          <h3>Your Chat History</h3>
          <button onClick={handleBackToDashboard}>Back to Dashboard</button>
          {chatHistory.length === 0 ? (
            <p>No chat history available</p>
          ) : (
            <ul>
              {chatHistory.map((session, index) => (
                <li key={index}>
                  <h4>Session {index + 1} - {session.status}</h4>
                  <ul>
                    {session.messages.map((msg, msgIndex) => (
                      <li key={msgIndex}>
                        <strong>{msg.sender}:</strong> {msg.message}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Subscription Section */}
      {activeSection === 'subscribe' && (
        <div className="subscription-section">
          <SubscriptionPage />
          <button onClick={handleBackToDashboard}>Back to Dashboard</button>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
