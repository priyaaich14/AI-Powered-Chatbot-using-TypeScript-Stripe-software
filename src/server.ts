
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import connectDB from './config/db';
import { registerUser, loginUser,forgotPassword,resetPassword,updatePassword,updateEmail,adminDeleteAccount,deleteOwnAccount,getAllUsers,getAllTechnicians } from './controllers/authController';
import { chatWithBotHttp, chatWithBotWebSocket, escalateToTechnician, getChatSession } from './controllers/chatController';
import { createStripeSubscription , cancelStripeSubscription} from './controllers/paymentController';
import { authenticateToken, authorizeRoles } from './middlewares/auth';
import bodyParser from 'body-parser';
import { handleStripeWebhook } from './controllers/paymentController';
import { createPaymentMethod } from './controllers/paymentController';

//import './types/express'
dotenv.config();
connectDB();


const app = express();

// Stripe webhook requires raw body parsing
app.post('/payment/stripe/webhook', express.raw({ type: 'application/json' }), handleStripeWebhook);

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

app.post('/auth/forgot-password', forgotPassword);
app.post('/auth/reset-password/:token', resetPassword);
app.put('/auth/update-password', authenticateToken, updatePassword);
app.put('/auth/update-email', authenticateToken, updateEmail);
app.delete('/auth/delete-account', authenticateToken, deleteOwnAccount);
app.delete('/auth/delete-user/:userId', authenticateToken, authorizeRoles(['admin']), adminDeleteAccount);
app.get('/auth/all-users', authenticateToken, authorizeRoles(['admin']), getAllUsers);
app.get('/auth/all-technicians', authenticateToken, authorizeRoles(['admin']), getAllTechnicians);

// Chat routes for HTTP requests
app.post('/chat', authenticateToken, chatWithBotHttp);
app.post('/chat/escalate', authenticateToken, authorizeRoles(['admin']), escalateToTechnician);
app.get('/chat/:chatId', authenticateToken, getChatSession);

// USING STRIPE_MOCK
// app.post('/payment/stripe', authenticateToken, createStripeSubscription);
// app.post('/payment/stripe/cancel', authenticateToken, cancelStripeSubscription);
// // Add the webhook route with raw body parser for Stripe webhook verification
// app.post('/payment/stripe/webhook', bodyParser.raw({ type: 'application/json' }), handleStripeWebhook);


app.post('/payment/method', createPaymentMethod);
// USING STRIPE_KEYS

app.post('/payment/stripe/create', createStripeSubscription);
app.post('/payment/stripe/cancel', cancelStripeSubscription);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
