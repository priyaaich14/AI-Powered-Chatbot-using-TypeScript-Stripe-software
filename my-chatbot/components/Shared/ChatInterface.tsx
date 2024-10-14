
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { sendMessageToBot, escalateChat, fetchUserChatHistory, fetchChatSession, setActiveChat, addMessage } from '../../redux/slices/chatSlice.ts';
import { AppDispatch, RootState } from '../../redux/store.ts';

const ChatInterface: React.FC<{ role: string }> = ({ role }) => {
  const [message, setMessage] = useState('');
  const dispatch: AppDispatch = useDispatch();
  const { currentChatMessages, loading, error, status } = useSelector((state: RootState) => state.chat);
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    dispatch(setActiveChat(true));
    dispatch(fetchUserChatHistory());
  }, [dispatch]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      const userMessage = { sender: 'User', message: message.trim() };
      dispatch(addMessage(userMessage));
      setMessage('');
      
      try {
        await dispatch(sendMessageToBot(userMessage.message)).unwrap();
      } catch (error) {
        console.error('Error sending message:', error);
      }
    }
  };

  const handleEscalate = async () => {
    try {
            const lastValidSession = currentChatMessages
              .slice()
              .reverse()
              .find(chat => chat.sessionId);
        
            if (lastValidSession && lastValidSession.sessionId) {
              const chatId = lastValidSession.sessionId;
              console.log('Escalating chat session:', chatId);
        
              await dispatch(fetchChatSession(chatId));
              await dispatch(escalateChat(chatId));
              dispatch(fetchUserChatHistory()); // Refresh chat history after escalation
            } else {
              console.error('No valid sessionId found to escalate.');
            }
          } catch (error) {
            console.error('Error escalating chat:', error);
          }
        
  }
  
  return (
    <div className="chat-interface">
      <h2>Chat with DobbyBot</h2>
      {error && <p className="error">{error}</p>}

      <div className="chat-history">
        {currentChatMessages.map((chat, index) => (
          <p key={index}>
            <strong>{chat.sender === 'User' && user ? user.name : chat.sender}:</strong> {chat.message}
          </p>
        ))}

        {status === 'escalated' && (
          <div className="escalated-message">
            <p>Conversation escalated to a technician. A technician will assist you shortly.</p>
          </div>
        )}
      </div>

      <form onSubmit={handleSendMessage}>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Waiting from Bot...' : 'Send'}
        </button>
      </form>

      {role === 'user' && (
        <button onClick={handleEscalate} disabled={!currentChatMessages.length || status !== 'open'}>
          Escalate to Technician
        </button>
      )}
    </div>
  );
};

export default ChatInterface;