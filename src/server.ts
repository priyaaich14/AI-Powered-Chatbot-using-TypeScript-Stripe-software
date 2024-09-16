
// import express from 'express';
// import dotenv from 'dotenv';
// import cors from 'cors';
// import http from 'http';
// import { Server } from 'socket.io';
// import connectDB from './config/db';
// import { registerUser, loginUser } from './controllers/authController';
// import { chatWithBot, escalateToTechnician, getChatSession } from './controllers/chatController';  // Import the getChatSession controller
// import { createStripeSubscription } from './controllers/paymentController';
// import { authenticateToken, authorizeRoles } from './middlewares/auth';

// dotenv.config();
// connectDB();

// const app = express();
// app.use(express.json());
// app.use(cors());

// // HTTP and WebSocket server setup
// const server = http.createServer(app);
// const io = new Server(server, {
//   cors: { origin: '*' },
// });

// // WebSocket for real-time chat
// io.on('connection', (socket) => {
//   console.log('A user connected.');

//   socket.on('message', async (data) => {
//     const { message, sessionId } = data;

//     // Call the chatWithBot function for WebSocket
//     const botResponse = await chatWithBot(message, sessionId);  // Passing message and sessionId directly

//     // Emit the bot's reply back to the client
//     socket.emit('reply', botResponse);
//   });

//   socket.on('disconnect', () => {
//     console.log('A user disconnected.');
//   });
// });

// // User Authentication routes
// app.post('/auth/register', registerUser);
// app.post('/auth/login', loginUser);

// // Chat routes for HTTP requests
// app.post('/chat', authenticateToken, async (req, res) => {
//   const { message, sessionId } = req.body;
//   await chatWithBot(message, sessionId, req, res);  // Pass req and res for HTTP
// });

// app.post('/chat/escalate', authenticateToken, authorizeRoles(['admin']), escalateToTechnician);

// // New route: Get chat session by ID
// app.get('/chat/:chatId', authenticateToken, getChatSession);  // Added route to get chat session

// // Payment and Subscription routes
// app.post('/payment/stripe', authenticateToken, createStripeSubscription);

// // Start the server
// const PORT = process.env.PORT || 5000;
// server.listen(PORT, () => console.log(`Server running on port ${PORT}`));


import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import connectDB from './config/db';
import { registerUser, loginUser } from './controllers/authController';
import { chatWithBotHttp, chatWithBotWebSocket, escalateToTechnician, getChatSession } from './controllers/chatController';
import { createStripeSubscription } from './controllers/paymentController';
import { authenticateToken, authorizeRoles } from './middlewares/auth';
//import './types/express'
dotenv.config();
connectDB();

const app = express();
app.use(express.json());
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' },
});

// WebSocket for real-time chat
io.on('connection', (socket) => {
  console.log('A user connected.');

  socket.on('message', async (data) => {
    const { message, sessionId } = data;
    
    // Call chatWithBotWebSocket function for WebSocket messages
    const botResponse = await chatWithBotWebSocket(message, sessionId);
    socket.emit('reply', botResponse);
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected.');
  });
});

// HTTP routes
app.post('/auth/register', registerUser);
app.post('/auth/login', loginUser);

// Chat routes for HTTP requests
app.post('/chat', authenticateToken, chatWithBotHttp);

app.post('/chat/escalate', authenticateToken, authorizeRoles(['admin']), escalateToTechnician);

app.get('/chat/:chatId', authenticateToken, getChatSession);

app.post('/payment/stripe', authenticateToken, createStripeSubscription);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
