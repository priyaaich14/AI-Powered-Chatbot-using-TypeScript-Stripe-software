import React, { useEffect, useState } from 'react';
import { getUserChatHistoryAPI } from '../features/chat/chatAPI';

const ChatHistory = () => {
  const [chats, setChats] = useState([]);

  useEffect(() => {
    const fetchChatHistory = async () => {
      try {
        const response = await getUserChatHistoryAPI();
        setChats(response.data);
      } catch (error) {
        console.error('Error fetching chat history', error);
      }
    };

    fetchChatHistory();
  }, []);

  return (
    <div className="chat-history">
      <h2>Your Chat History</h2>
      <ul>
        {chats.map((chat) => (
          <li key={chat.sessionId}>
            Chat with {chat.messages[0].sender}: {chat.messages.length} messages
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ChatHistory;
