import React, { useEffect, useState } from 'react';
import { promoteToTechnicianAPI, getAllUsers, getAllTechnicians, deleteUser } from '../features/auth/authAPI';
import { toast } from 'react-toastify'; // For displaying success/error messages

const AdminUserList = () => {
  const [users, setUsers] = useState([]);
  const [technicians, setTechnicians] = useState([]);

  // Fetch all users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await getAllUsers(); // Fetch users from API
        setUsers(response.data);
      } catch (error) {
        console.error('Error fetching users', error);
        toast.error('Failed to fetch users'); // Show error message
      }
    };

    // Fetch all technicians
    const fetchTechnicians = async () => {
      try {
        const response = await getAllTechnicians(); // Fetch technicians from API
        setTechnicians(response.data);
      } catch (error) {
        console.error('Error fetching technicians', error);
        toast.error('Failed to fetch technicians'); // Show error message
      }
    };

    fetchUsers(); // Call the fetch function for users
    fetchTechnicians(); // Call the fetch function for technicians
  }, []);

  // Handle promoting a user to technician
  const handlePromote = async (userId) => {
    if (window.confirm('Are you sure you want to promote this user to a technician?')) {
      try {
        await promoteToTechnicianAPI(userId); // Promote user via API
        setUsers(users.map(user => user._id === userId ? { ...user, role: 'technician' } : user)); // Update user role locally
        toast.success('User promoted to technician successfully'); // Show success message
      } catch (error) {
        console.error('Error promoting user', error);
        toast.error('Error promoting user'); // Show error message
      }
    }
  };

  // Handle deleting a user
  const handleDelete = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await deleteUser(userId); // Delete user via API
        setUsers(users.filter(user => user._id !== userId)); // Remove user from local state
        toast.success('User deleted successfully'); // Show success message
      } catch (error) {
        console.error('Error deleting user', error);
        toast.error('Error deleting user'); // Show error message
      }
    }
  };

  return (
    <div className="admin-user-list">
      <h2>All Users</h2>
      <ul>
        {users.map((user) => (
          <li key={user._id}>
            {user.name} ({user.email}) - {user.role}
            {/* Only show Promote button for users with the 'user' role */}
            {user.role === 'user' && (
              <button onClick={() => handlePromote(user._id)}>Promote to Technician</button>
            )}
            <button onClick={() => handleDelete(user._id)}>Delete</button>
          </li>
        ))}
      </ul>

      <h2>All Technicians</h2>
      <ul>
        {technicians.map((technician) => (
          <li key={technician._id}>
            {technician.name} ({technician.email}) - {technician.role}
            <button onClick={() => handleDelete(technician._id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminUserList;
