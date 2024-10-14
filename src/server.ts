import express from 'express';
import './cron/subcriptionCron'; 
import dotenv from 'dotenv';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import connectDB from './config/db';
import { registerUser, loginUser,forgotPassword,resetPassword,updatePassword,updateEmail,adminDeleteAccount,deleteOwnAccount,getAllUsers,getAllTechnicians,addTechnician } from './controllers/authController';
import { chatWithBotHttp, escalateToTechnician, getChatSession, getAllChatSessions, chatWithBotWebSocket, getUserChatHistory } from './controllers/chatController';
import { createPaymentMethod, createStripeSubscription, cancelStripeSubscription, getPaymentDetails, getSubscriptionDetails, handlePaymentIntent,createCheckoutSession,handleSubscriptionSuccess} from './controllers/paymentController';
import { authenticateToken, authorizeRoles, authenticateTokenWebSocket } from './middlewares/auth';
import path from 'path';
import ChatSession from './models/ChatSession'; // Adjust the import path as necessary

dotenv.config();
connectDB();

const app = express();
app.use(express.json());
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' },
});

const INACTIVITY_TIMEOUT = 60 * 1000; // Set timeout duration (1 minute for testing)

const closeInactiveChats = async () => {
  const cutoffTime = new Date(Date.now() - INACTIVITY_TIMEOUT);

  const inactiveChats = await ChatSession.find({
    status: 'open',
    updatedAt: { $lt: cutoffTime } // Check for inactivity
  });

  for (const chat of inactiveChats) {
    chat.status = 'closed'; // Update status to closed
    await chat.save(); // Save changes
    console.log(`Chat session ${chat.sessionId} has been closed due to inactivity.`);
  }
};

// Call this function periodically (e.g., every minute)
setInterval(closeInactiveChats, 60 * 1000); // Check every minute

// Use the WebSocket JWT authentication middleware
io.use(authenticateTokenWebSocket);

// Handle WebSocket connection events
io.on('connection', (socket) => {
  console.log('A user connected:', (socket as any).user);  // Access the user object attached by the middleware

  socket.on('message', async (data) => {
    const { message, sessionId } = data;
    const userId = (socket as any).user._id;  // Access the user ID from the authenticated token

    // Call the chat function with WebSocket
    const botResponse = await chatWithBotWebSocket(io, socket, message, sessionId, userId);
    socket.emit('reply', botResponse);  // Send bot response to the client
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
app.get('/auth/all-users', authenticateToken, authorizeRoles(['admin','technician']), getAllUsers);
app.get('/auth/all-technicians', authenticateToken, authorizeRoles(['admin']), getAllTechnicians);
// Define the route for adding a technician (Admin only)
app.post('/technician/add', authenticateToken, authorizeRoles(['admin']), addTechnician);

// // Chat routes for HTTP requests
// app.post('/chat', authenticateToken, chatWithBotHttp);
// app.post('/chat/escalate', authenticateToken, authorizeRoles(['admin']), escalateToTechnician);
// app.get('/chat/:chatId', authenticateToken, getChatSession);

// Chat Routes using openapi
// app.post('/chat', authenticateToken, chatWithBotHttp);  // Start a chat session (Authenticated)
// app.post('/chat/escalate', authenticateToken, authorizeRoles(['admin', 'technician']), escalateToTechnician);  // Escalate chat (Authenticated with roles)
// app.get('/chat/:chatId', authenticateToken, getChatSession);  // Fetch a specific chat session (Authenticated)
// // New route: Fetch all chat sessions for admin/technicians
// app.get('/chats', authenticateToken, authorizeRoles(['admin', 'technician']), getAllChatSessions);  // Fetch all chats (Admins/Technicians only)

// using dialogflow
app.post('/chat', authenticateToken, chatWithBotHttp);  // Chat with bot using HTTP
app.post('/chat/escalate', authenticateToken, escalateToTechnician);  // Escalate chat to technician
app.get('/chat/:chatId', authenticateToken, getChatSession);  // Fetch specific chat session
app.get('/my-chats', authenticateToken, getUserChatHistory); // Fetch logged-in user's chat history
app.get('/chats', authenticateToken, authorizeRoles(['admin', 'technician']), getAllChatSessions);  // Fetch all chat sessions (admin/technician only)


// USING STRIPE_MOCK
// app.post('/payment/stripe', authenticateToken, createStripeSubscription);
// app.post('/payment/stripe/cancel', authenticateToken, cancelStripeSubscription);
// // Add the webhook route with raw body parser for Stripe webhook verification
// app.post('/payment/stripe/webhook', bodyParser.raw({ type: 'application/json' }), handleStripeWebhook);




//USING STRIPE_KEYS
app.post('/payment/method', createPaymentMethod);
//app.post('/payment/stripe/confirm', confirmPaymentIntent); 
app.post('/payment/stripe/create', authenticateToken,createStripeSubscription);
app.post('/payment/stripe/cancel',authenticateToken, cancelStripeSubscription);
app.post('/payment/stripe/confirm', authenticateToken, handlePaymentIntent);
// Get subscription details

app.get('/payment/subscription/:sessionId', authenticateToken, getSubscriptionDetails);

// Get payment details
app.get('/payment/:paymentId', authenticateToken, getPaymentDetails);

app.post('/payment/stripe/create-checkout-session',authenticateToken, createCheckoutSession);
app.get('/payment/subscription-success', authenticateToken, handleSubscriptionSuccess);

// Serve static assets if in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client', 'build')));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
} else {
  // Redirect non-API requests to React frontend in development
  app.get('*', (req, res) => {
    res.status(404).json({ message: 'API route not found' });
  });
}



const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
