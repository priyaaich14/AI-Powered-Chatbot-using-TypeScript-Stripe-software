
import axios from 'axios';

// Define the API base URL
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

// Send a message to the bot
export const sendMessageToBot = async (message: string) => {
  try {
    const response = await axios.post(`${API_URL}/chat`, { message });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Error sending message to bot');
  }
};

// Fetch the user's chat history
export const fetchUserChatHistory = async () => {
  try {
    const response = await axios.get(`${API_URL}/my-chats`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Error fetching chat history');
  }
};

// Escalate the chat to a technician
export const escalateChat = async (chatId: string) => {
  try {
    const response = await axios.post(`${API_URL}/chat/escalate`, { chatId });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Error escalating chat');
  }
};

// Fetch all chat sessions (Admin/Technician only)
export const fetchAllChatSessions = async () => {
  try {
    const response = await axios.get(`${API_URL}/chats`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Error fetching all chat sessions');
  }
};
// Fetch a specific chat session by session ID
export const fetchChatSession = async (chatId: string) => {
  try {
    const response = await axios.get(`${API_URL}/chat/${chatId}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Error fetching chat session');
  }
};
