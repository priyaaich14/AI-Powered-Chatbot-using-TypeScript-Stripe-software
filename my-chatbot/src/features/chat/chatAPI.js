import axios from '../../services/api';

// Send message to bot API request
export const sendMessageToBotAPI = async (messageData) => {
  return await axios.post('/chat', messageData);
};

// Escalate chat to technician API request
export const escalateChatAPI = async (sessionId) => {
  return await axios.post('/chat/escalate', { sessionId });
};

// Get user chat history API request
export const getUserChatHistoryAPI = async () => {
  return await axios.get('/my-chats');
};

// Get chat session API request
export const getChatSessionAPI = async (sessionId) => {
  return await axios.get(`/chat/${sessionId}`);
};

// Get all chat sessions API request
export const getAllChatSessionsAPI = async () => {
  return await axios.get('/chats');
};
