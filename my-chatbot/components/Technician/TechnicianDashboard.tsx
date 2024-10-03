
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { selectAuth, logout } from '../../redux/slices/authSlice.ts';
import { getAllUsers } from '../../services/authService.ts';  // Import the service to fetch all users
import { toast } from 'react-toastify';
import { AppDispatch } from '../../redux/store.ts';

interface User {
  _id: string;
  name: string;
  role: string;
}

const TechnicianDashboard: React.FC = () => {
  const { user } = useSelector(selectAuth);
  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]); // Store the list of users

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await getAllUsers();
        setUsers(data); // Populate the users list
      } catch (error) {
        toast.error('Error fetching users');
      }
    };
    fetchUsers(); // Fetch users on component load
  }, []);

  const handleLogout = () => {
    dispatch(logout()); // Dispatch logout action
    navigate('/'); // Redirect to login page
  };

  return (
    <div>
      <h2>Welcome, {user?.name} (Technician)</h2>
      
      {/* Display List of Users */}
      <h3>List of Users</h3>
      <ul>
        {users.map((user) => (
          <li key={user._id}>
            {user.name} ({user.role})
          </li>
        ))}
      </ul>

      {/* Logout Button */}
      <button onClick={handleLogout} className="logout-btn">
        Logout
      </button>
    </div>
  );
};

export default TechnicianDashboard;
