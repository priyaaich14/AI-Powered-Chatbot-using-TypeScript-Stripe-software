import api from '../../services/api'; // Use the axios instance from api.js

// Login user API request
export const loginUser = async (credentials) => {
  return await api.post('/auth/login', credentials); // Using api instance
};

// Register user API request
export const registerUser = async (data) => {
  return await api.post('/auth/register', data); // Using api instance
};

// Get all users (admin only)
export const getAllUsers = async () => {
  return await api.get('/auth/all-users'); // Using api instance
};

// Get all technicians (admin only)
export const getAllTechnicians = async () => {
  return await api.get('/auth/all-technicians'); // Using api instance
};

// Promote user to technician API request
export const promoteToTechnicianAPI = async (userId) => {
  return await api.post('/technician/add', { userId }); // Using api instance
};

// Update email
export const updateEmail = async (newEmail) => {
  return await api.put('/auth/update-email', { newEmail }); // Using api instance
};

// Delete a specific user (admin only)
export const deleteUser = async (userId) => {
  return await api.delete(`/auth/delete-user/${userId}`); // Using api instance
};

// Delete own account (for regular user)
export const deleteAccount = async () => {
  return await api.delete('/auth/delete-account'); // Using api instance
};
