
import React, { useEffect, useState } from 'react';
import { FaSignOutAlt, FaUsers, FaWrench, FaComments } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import { AppDispatch, RootState } from '../../redux/store';
import { logout, selectAuth } from '../../redux/slices/authSlice.ts';
import { fetchAllChatSessions } from '../../redux/slices/chatSlice.ts';
import { promoteToTechnician, deleteAccountByAdmin, getAllUsers, getAllTechnicians } from '../../services/authService.ts';

interface User {
  _id: string;
  name: string;
  role: string;
}

const AdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [technicians, setTechnicians] = useState<User[]>([]);
  const [visibleSection, setVisibleSection] = useState<string | null>(() => {
    return localStorage.getItem('adminDashboardSection') || null;
  });
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({
    users: false,
    technicians: false,
    chatSessions: false,
  });

  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { user: admin } = useSelector(selectAuth);
  const { chatSessions,  error: chatError } = useSelector((state: RootState) => state.chat);

  useEffect(() => {
    const fetchData = async () => {
      if (visibleSection === 'users' && !users.length) {
        setIsLoading((prev) => ({ ...prev, users: true }));
        try {
          const { data } = await getAllUsers();
          setUsers(data);
        } catch (error) {
          toast.error('Error fetching users');
        }
        setIsLoading((prev) => ({ ...prev, users: false }));
      } else if (visibleSection === 'technicians' && !technicians.length) {
        setIsLoading((prev) => ({ ...prev, technicians: true }));
        try {
          const { data } = await getAllTechnicians();
          setTechnicians(data);
        } catch (error) {
          toast.error('Error fetching technicians');
        }
        setIsLoading((prev) => ({ ...prev, technicians: false }));
      } else if (visibleSection === 'chatSessions') {
        setIsLoading((prev) => ({ ...prev, chatSessions: true }));
        await dispatch(fetchAllChatSessions());
        setIsLoading((prev) => ({ ...prev, chatSessions: false }));
      }
    };

    fetchData();
  }, [visibleSection, dispatch, users.length, technicians.length]);

  useEffect(() => {
    localStorage.setItem('adminDashboardSection', visibleSection || '');
  }, [visibleSection]);

  const handlePromote = async (userId: string) => {
    try {
      await promoteToTechnician(userId);
      toast.success('User promoted to Technician');
      const [{ data: usersData }, { data: techniciansData }] = await Promise.all([getAllUsers(), getAllTechnicians()]);
      setUsers(usersData);
      setTechnicians(techniciansData);
    } catch (error) {
      toast.error('Error promoting user');
    }
  };

  const handleDelete = async (userId: string) => {
    try {
      await deleteAccountByAdmin(userId);
      toast.success('Account deleted');
      setUsers(users.filter((user) => user._id !== userId));
      setTechnicians(technicians.filter((technician) => technician._id !== userId));
    } catch (error) {
      toast.error('Error deleting account');
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem('adminDashboardSection');
    navigate('/');
  };

  const toggleSection = (section: string) => {
    setVisibleSection((prev) => (prev === section ? null : section));
  };

  const renderSkeleton = () => (
    <div className="skeleton-loader">
      <div className="skeleton-line"></div>
      <div className="skeleton-line"></div>
      <div className="skeleton-line"></div>
    </div>
  );

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

  const groupedChatSessions = groupChatsByUser(chatSessions);

  return (
    <div className="admin-dashboard">
      <h2 className="dashboard-title">Admin Dashboard</h2>

      <div className="dashboard-header">
        <div className="icon-column">
          <FaUsers className="toggle-icon" onClick={() => toggleSection('users')} />
          <FaWrench className="toggle-icon" onClick={() => toggleSection('technicians')} />
          <FaComments className="toggle-icon" onClick={() => toggleSection('chatSessions')} />
        </div>

        <div className="center-title">
          <h3>Welcome, {admin?.name} (Admin)</h3>
        </div>

        <FaSignOutAlt className="logout-icon" onClick={handleLogout} />
      </div>

      {/* Users Section */}
      {visibleSection === 'users' && (
        <div className="user-list">
          <h3>All Users</h3>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading.users
                ? Array(5)
                    .fill(0)
                    .map((_, index) => (
                      <tr key={index}>
                        <td>{renderSkeleton()}</td>
                        <td>{renderSkeleton()}</td>
                        <td>{renderSkeleton()}</td>
                      </tr>
                    ))
                : users.map((user) => (
                    <tr key={user._id}>
                      <td>{user.name}</td>
                      <td>{user.role}</td>
                      <td>
                        <button onClick={() => handlePromote(user._id)}>Promote to Technician</button>
                        <button onClick={() => handleDelete(user._id)}>Delete</button>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Technicians Section */}
      {visibleSection === 'technicians' && (
        <div className="technician-list">
          <h3>All Technicians</h3>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading.technicians
                ? Array(5)
                    .fill(0)
                    .map((_, index) => (
                      <tr key={index}>
                        <td>{renderSkeleton()}</td>
                        <td>{renderSkeleton()}</td>
                        <td>{renderSkeleton()}</td>
                      </tr>
                    ))
                : technicians.map((technician) => (
                    <tr key={technician._id}>
                      <td>{technician.name}</td>
                      <td>{technician.role}</td>
                      <td>
                        <button onClick={() => handleDelete(technician._id)}>Delete</button>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Chat Sessions Section */}
      {visibleSection === 'chatSessions' && (
        <div className="chat-session-list">
          <h3>All Chat Sessions</h3>
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
              {Object.keys(groupedChatSessions).length === 0 && <tr><td colSpan={3}>No chat sessions found.</td></tr>}
              {Object.keys(groupedChatSessions).map((userName) => (
                <React.Fragment key={userName}>
                  {groupedChatSessions[userName].map((session: any, index: number) => (
                    <tr key={session.sessionId}>
                      {userName !== 'Deleted User' && (
                        <>
                          <td>{userName}</td>
                          <td>Session {session.sessionNumber || index + 1}</td>
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
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
