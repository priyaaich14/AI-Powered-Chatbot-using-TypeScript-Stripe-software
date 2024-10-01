import React, { useEffect, useState } from 'react';
import { getAllChatSessionsAPI } from '../features/chat/chatAPI';

const AllChats = () => {
  const [chats, setChats] = useState([]);

  useEffect(() => {
    const fetchAllChats = async () => {
      try {
        const response = await getAllChatSessionsAPI();
        setChats(response.data);
      } catch (error) {
        console.error('Error fetching all chats', error);
      }
    };

    fetchAllChats();
  }, []);

  return (
    <div className="all-chats">
      <h2>All User Chats</h2>
      <ul>
        {chats.map((chat) => (
          <li key={chat.sessionId}>
            Chat with {chat.userId.name} ({chat.messages.length} messages)
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AllChats;
