
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FaSignOutAlt, FaUsers, FaComments } from 'react-icons/fa';
import { selectAuth, logout } from '../../redux/slices/authSlice.ts';
import { getAllUsers } from '../../services/authService.ts';
import { fetchAllChatSessions } from '../../redux/slices/chatSlice.ts';
import { toast } from 'react-toastify';
import { AppDispatch, RootState } from '../../redux/store.ts';

interface User {
  _id: string;
  name: string;
  role: string;
}

// Save the currently visible section in localStorage
const saveVisibleSection = (section: 'welcome' | 'users' | 'chatSessions') => {
  localStorage.setItem('technicianDashboardSection', JSON.stringify(section));
};

// Load the last visible section from localStorage
const loadVisibleSection = (): 'welcome' | 'users' | 'chatSessions' => {
  const saved = localStorage.getItem('technicianDashboardSection');
  return saved ? JSON.parse(saved) : 'welcome';
};

// Group chat sessions by user to display them together
const groupChatsByUser = (chatSessions: any[]) => {
  const grouped = chatSessions.reduce((acc: any, session: any) => {
    const userName = session.userId?.name || 'Deleted User';
    if (!acc[userName]) {
      acc[userName] = [];
    }
    acc[userName].push(session);
    return acc;
  }, {});
  return grouped;
};

const TechnicianDashboard: React.FC = () => {
  const { user } = useSelector(selectAuth);
  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [visibleSection, setVisibleSection] = useState<'welcome' | 'users' | 'chatSessions'>(() => loadVisibleSection());
  const [isLoading, setIsLoading] = useState(true);

  const { chatSessions,  error: chatError } = useSelector((state: RootState) => state.chat);

  // Fetch data based on the active section (users or chat sessions)
  useEffect(() => {
    const initializeDashboard = async () => {
      try {
        if (visibleSection === 'users') {
          const { data } = await getAllUsers();
          setUsers(data);
        } else if (visibleSection === 'chatSessions') {
          await dispatch(fetchAllChatSessions()).unwrap();
        }
      } catch (error) {
        toast.error('Error initializing dashboard');
      } finally {
        setIsLoading(false);
      }
    };

    if (visibleSection !== 'welcome') {
      initializeDashboard();
    }
  }, [dispatch, visibleSection]);

  // Save the section in localStorage whenever it changes
  useEffect(() => {
    saveVisibleSection(visibleSection);
  }, [visibleSection]);

  // Handle logout
  const handleLogout = () => {
    dispatch(logout());
    saveVisibleSection('welcome');
    navigate('/');
  };

  const renderSkeleton = () => (
    <div className="skeleton-loader">
      <div className="skeleton-line"></div>
      <div className="skeleton-line"></div>
      <div className="skeleton-line"></div>
    </div>
  );

  const groupedChatSessions = groupChatsByUser(chatSessions);

  return (
    <div className="technician-dashboard">
      <h2>Welcome, {user?.name} (Technician)</h2>

      <div className="dashboard-icons">
        <FaUsers className="users-icon" onClick={() => setVisibleSection('users')} />
        <FaComments className="chat-icon" onClick={() => setVisibleSection('chatSessions')} />
        <FaSignOutAlt className="logout-icon" onClick={handleLogout} />
      </div>

      {/* Welcome Page */}
      {visibleSection === 'welcome' && (
        <div className="welcome-section">
          <h3>Welcome to the Technician Dashboard, {user?.name}!</h3>
          <p>Select a section from the above icons to view Users or Chat Sessions.</p>
        </div>
      )}

      {/* Users Section */}
      {visibleSection === 'users' && (
        <div className="user-list">
          <h3>List of Users</h3>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Role</th>
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? Array(5).fill(0).map((_, index) => (
                    <tr key={index}>
                      <td>{renderSkeleton()}</td>
                      <td>{renderSkeleton()}</td>
                    </tr>
                  ))
                : users.map((user) => (
                    <tr key={user._id}>
                      <td>{user.name}</td>
                      <td>{user.role}</td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Chat Sessions Section */}
      {visibleSection === 'chatSessions' && (
        <div className="chat-session-list">
          <h3>Assigned Chat Sessions</h3>
          {chatError && <p>{chatError}</p>}
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Session Number</th>
                <th>Messages</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(groupedChatSessions).length === 0 ? (
                <tr><td colSpan={3}>No chat sessions found.</td></tr>
              ) : (
                Object.keys(groupedChatSessions).map((userName) => (
                  groupedChatSessions[userName].map((session: any, index: number) => (
                    <tr key={session.sessionId}>
                      {/* Filter out Deleted User */}
                      {userName !== 'Deleted User' && (
                        <>
                          <td>{userName}</td>
                          <td>Session {session.sessionNumber || index + 1}</td>  {/* Show correct session number */}
                          <td>
                            {session.messages.length > 0 ? (
                              session.messages.map((message: any, msgIndex: number) => (
                                <div key={msgIndex}>
                                  <p>
                                    <strong>{message.sender}:</strong> {message.message} <br />
                                    <small>{new Date(message.timestamp).toLocaleString()}</small>
                                  </p>
                                </div>
                              ))
                            ) : (
                              <p>No messages available.</p>
                            )}
                          </td>
                        </>
                      )}
                    </tr>
                  ))
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TechnicianDashboard;
