import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { sendMessageToBot, escalateChat } from '../features/chat/chatSlice';

const ChatBox = () => {
  const [message, setMessage] = useState('');
  const dispatch = useDispatch();
  const { sessionId, messages } = useSelector((state) => state.chat);

  const handleSendMessage = async () => {
    if (message.trim()) {
      try {
        await dispatch(sendMessageToBot({ message, sessionId }));
        setMessage('');
      } catch (error) {
        console.error('Error sending message:', error);
      }
    }
  };

  const handleEscalateChat = async () => {
    try {
      await dispatch(escalateChat(sessionId));
      alert('Chat escalated to a technician');
    } catch (error) {
      console.error('Error escalating chat:', error);
    }
  };

  return (
    <div className="chat-box">
      <div className="message-list">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.senderType}`}>
            <strong>{msg.sender}:</strong> {msg.message}
          </div>
        ))}
      </div>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type a message"
      />
      <button onClick={handleSendMessage}>Send</button>
      <button onClick={handleEscalateChat}>Escalate to Technician</button>
    </div>
  );
};

export default ChatBox;
