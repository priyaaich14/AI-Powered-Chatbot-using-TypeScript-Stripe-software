import React, { useEffect, useState } from 'react';
import { getChatSessionAPI } from '../features/chat/chatAPI';
import { useParams } from 'react-router-dom';

const ChatDetails = () => {
  const { sessionId } = useParams();
  const [chat, setChat] = useState(null);

  useEffect(() => {
    const fetchChatDetails = async () => {
      try {
        const response = await getChatSessionAPI(sessionId);
        setChat(response.data.chatSession);
      } catch (error) {
        console.error('Error fetching chat details', error);
      }
    };

    fetchChatDetails();
  }, [sessionId]);

  if (!chat) return <div>Loading...</div>;

  return (
    <div className="chat-details">
      <h2>Chat with {chat.userName}</h2>
      <ul>
        {chat.messages.map((msg, idx) => (
          <li key={idx}>
            <strong>{msg.sender}</strong>: {msg.message}
          </li>
        ))}
        {chat.escalatedTo && (
          <div>
            <strong>Escalated to Technician:</strong> {chat.escalatedTo.name}
          </div>
        )}
      </ul>
    </div>
  );
};

export default ChatDetails;
