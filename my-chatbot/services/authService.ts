
import axios from 'axios';

const API_URL = 'http://localhost:5000';


// Set up axios interceptor to include the token in all requests
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const loginAPI = async (email: string, password: string) => {
  const response = await axios.post(`${API_URL}/auth/login`, { email, password });
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
  }
  return response.data;
};

export const registerAPI = async (name: string, email: string, password: string, role: string) => {
  const response = await axios.post(`${API_URL}/auth/register`, { name, email, password, role });
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
  }
  return response.data;
};
export const updateEmail = async (newEmail: string) => {
  return axios.put(`${API_URL}/auth/update-email`, { newEmail });
};

export const updatePassword = async (currentPassword: string, newPassword: string) => {
  return axios.put(`${API_URL}/auth/update-password`, { oldPassword: currentPassword, newPassword });
};

export const deleteAccount = async () => {
  return axios.delete(`${API_URL}/auth/delete-account`);
};

export const getAllUsers = async () => {
  return axios.get(`${API_URL}/auth/all-users`);
};

export const getAllTechnicians = async () => {
  return axios.get(`${API_URL}/auth/all-technicians`);
};

export const promoteToTechnician = async (userId: string) => {
  return axios.post(`${API_URL}/technician/add`, { userId });
};

export const deleteAccountByAdmin = async (userId: string) => {
  return axios.delete(`${API_URL}/auth/delete-user/${userId}`);
};

export const resetPasswordAPI = async (token: string, newPassword: string) => {
  return axios.post(`${API_URL}/auth/reset-password/${token}`, { newPassword });
};

export const sendPasswordResetEmail = async (email: string) => {
  return axios.post(`${API_URL}/auth/forgot-password`, { email });
};

export const logoutAPI = () => {
  localStorage.removeItem('token');
};