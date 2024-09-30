
// //////////////////// TEST ///////////////////////////////////////////////////////////

// import { Request, Response } from 'express';
// import { IAuthRequest } from '../middlewares/auth';
// import { v4 as uuidv4 } from 'uuid';
// import OpenAI from 'openai';
// import dialogflow from '@google-cloud/dialogflow';
// import dotenv from 'dotenv';
// import mongoose from 'mongoose';
// import ChatSession, { IChatSession } from '../models/ChatSession';
// import Technician from '../models/Technician';
// import User, { IUser } from '../models/User';

// dotenv.config();

// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// });

// const sessionClient = new dialogflow.SessionsClient();


// export const chatWithBotHttp = async (req: IAuthRequest, res: Response) => {
//   console.log('Authenticated User:', req.user);
//   try {
//     const { message, sessionId } = req.body;
//     const userId = req.user?._id; // Make sure userId is extracted properly from the authenticated request

//     if (!userId) {
//       return res.status(400).json({ error: 'UserId is required for chat' });
//     }

//     // Fetch user details to reflect user name in the chat
//     const user = await User.findById(userId);

//     const chatSession = await getOrCreateChatSession(
//       sessionId,
//       userId,
//       message,
//       user?.name || 'Anonymous User' // Use user's name or anonymous if not found
//     );
//     const botReply = await processBotResponse(message, chatSession.sessionId);

//     res.json({ reply: botReply, sessionId: chatSession.sessionId });
//   } catch (error) {
//     console.error('Error processing chat:', error);
//     res.status(500).json({ error: 'Error processing chat' });
//   }
// };


// // Function to handle chat via WebSocket (no user required)
// export const chatWithBotWebSocket = async (message: string, sessionId: string) => {
//   try {
//     const chatSession = await getOrCreateChatSession(sessionId, undefined, message);
//     return await processBotResponse(message, chatSession.sessionId);
//   } catch (error) {
//     console.error('Error processing chat:', error);
//     return 'Error processing chat';
//   }
// };

// // Helper function to create or retrieve a chat session
// const getOrCreateChatSession = async (
//   sessionId?: string,
//   userId?: mongoose.Types.ObjectId,
//   message?: string,
//   userName?: string
// ): Promise<IChatSession> => {
//   if (!message) {
//     throw new Error('Message is required');
//   }

//   // Ensure userId is passed and valid
//   if (!userId) {
//     throw new Error('UserId is required');
//   }
//   let chatSession;
//   if (!sessionId) {
//     const newSessionId = uuidv4();
//     chatSession = new ChatSession({
//       sessionId: newSessionId,
//       userId: userId,  // Ensure userId is set
//       messages: [{ sender: userName || 'user', message, timestamp: new Date() }],
//     });
//   } else {
//     chatSession = await ChatSession.findOne({ sessionId });
//     if (!chatSession) {
//       chatSession = new ChatSession({
//         sessionId,
//         userId: userId,  // Ensure userId is set
//         messages: [{ sender: userName || 'user', message, timestamp: new Date() }],
//       });
//     } else {
//       chatSession.messages.push({ sender: userName || 'user', message, timestamp: new Date() });
//     }
//   }

//   await chatSession.save();
//   return chatSession;
// };

// // Helper function to process the bot's response
// const processBotResponse = async (message: string, sessionId: string) => {
//   try {
//     // Making the OpenAI API request
//     const aiResponse = await openai.chat.completions.create({
//       model: 'gpt-3.5-turbo',
//       messages: [{ role: 'user', content: message }],
//     });

//     // Extracting the bot's reply
//     const botReply = aiResponse.choices[0]?.message?.content?.trim();

//     const sessionPath = sessionClient.projectAgentSessionPath(process.env.DIALOGFLOW_PROJECT_ID!, sessionId);
//     const dialogflowResponse = await sessionClient.detectIntent({
//       session: sessionPath,
//       queryInput: { text: { text: message, languageCode: 'en' } },
//     });

//     const dialogflowReply = dialogflowResponse[0]?.queryResult?.fulfillmentText;
//     return botReply || dialogflowReply || 'I could not understand that.';
    
//   } catch (error: any) {
//     // Check if the error is related to quota exceeded
//     if (error.code === 'insufficient_quota') {
//       console.error('Insufficient quota for OpenAI API:', error.message);
//       throw new Error('You have exceeded your OpenAI API quota. Please try again later or check your subscription.');
//     } else {
//       console.error('Error processing OpenAI request:', error);
//       throw new Error('Error processing chat with OpenAI');
//     }
//   }
// };
// // Escalate chat to technician
// export const escalateToTechnician = async (req: Request, res: Response) => {
//   const { chatId } = req.body;

//   try {
//     const chatSession = await ChatSession.findById(chatId);
//     if (!chatSession) return res.status(404).json({ message: 'Chat session not found' });

//     // Populate the userId field with the full user document
//     const availableTechnician = await Technician.findOne({ available: true }).populate('userId');
//     if (!availableTechnician) return res.status(404).json({ message: 'No available technicians' });

//     const technicianName = (availableTechnician.userId as IUser).name; // Explicitly cast userId as IUser

//     chatSession.status = 'escalated';
//     chatSession.escalatedTo = availableTechnician._id as mongoose.Types.ObjectId;  // Cast _id to ObjectId
//     chatSession.messages.push({
//       sender: technicianName,
//       message: `Your chat has been escalated to technician: ${technicianName}`,
//       timestamp: new Date(),
//     });

//     await chatSession.save();

//     // Update the technician's handled chats
//     (availableTechnician.handledChats as mongoose.Types.ObjectId[]).push(chatSession._id as mongoose.Types.ObjectId); // Cast _id to ObjectId
//     availableTechnician.available = false;
//     await availableTechnician.save();

//     res.json({ message: `Chat escalated to technician ${technicianName}` });
//   } catch (error) {
//     res.status(500).json({ error: 'Error escalating chat' });
//   }
// };

// // Fetch chat session
// export const getChatSession = async (req: IAuthRequest, res: Response) => {
//   const { chatId } = req.params;

//   try {
//     const chatSession = await ChatSession.findById(chatId)
//       .populate('escalatedTo', 'name')  // Populate technician's name
//       .populate('userId', 'name')  // Populate user's name
//       .exec();

//     if (!chatSession) {
//       return res.status(404).json({ message: 'Chat session not found' });
//     }

//     // Check if the user is either the owner of the chat or has the role of admin or technician
//     const isAdminOrTechnician = req.user.role === 'admin' || req.user.role === 'technician';
//     const isOwner = chatSession.userId && chatSession.userId.equals(req.user._id);

//     if (!isAdminOrTechnician && !isOwner) {
//       return res.status(403).json({ message: 'Access denied: You can only view your own chats.' });
//     }

//     // Include technician and user names in the response
//     const technician = chatSession.escalatedTo as IUser;
//     const user = chatSession.userId as IUser;

//     res.json({
//       chatSession,
//       userName: user ? user.name : 'Anonymous User',
//       technicianName: technician ? technician.name : 'Technician',
//     });
//   } catch (error) {
//     res.status(500).json({ error: 'Error fetching chat session' });
//   }
// };
// // Fetch all chat sessions (Admin and Technician only)
// export const getAllChatSessions = async (req: IAuthRequest, res: Response) => {
//   try {
//     // Ensure the user is either an admin or a technician
//     const isAdminOrTechnician = req.user.role === 'admin' || req.user.role === 'technician';

//     if (!isAdminOrTechnician) {
//       return res.status(403).json({ message: 'Access denied: Only admins and technicians can view all chats.' });
//     }

//     // Fetch all chat sessions
//     const chatSessions = await ChatSession.find()
//       .populate('escalatedTo', 'name')  // Populate technician names
//       .populate('userId', 'name')  // Populate user names
//       .exec();

//     res.json(chatSessions);
//   } catch (error) {
//     res.status(500).json({ error: 'Error fetching all chat sessions' });
//   }
// };


//////////only dialogflow/////////////////

import { Request, Response } from 'express';
import { IAuthRequest } from '../middlewares/auth';
import { v4 as uuidv4 } from 'uuid';
import dialogflow from '@google-cloud/dialogflow';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import ChatSession, { IChatSession } from '../models/ChatSession';
import Technician from '../models/Technician';
import User, { IUser } from '../models/User';
import { Socket } from 'socket.io';

dotenv.config();

const sessionClient = new dialogflow.SessionsClient();



// Function to handle chat via HTTP (Dialogflow only)
export const chatWithBotHttp = async (req: IAuthRequest, res: Response) => {
  console.log('Authenticated User:', req.user);

  try {
    const { message, sessionId } = req.body;
    const userId = req.user?._id; // Ensure user authentication middleware populates this

    if (!userId) {
      return res.status(400).json({ error: 'UserId is required for chat' });
    }

    // Find the user by ID in your DB
    const user = await User.findById(userId);

    // Get existing or create new chat session
    const chatSession = await getOrCreateChatSession(
      sessionId,
      userId,
      message,
      user?.name || 'Anonymous User'
    );

    // Get the bot's response using Dialogflow
    const botReply = await processBotResponseWithDialogflow(message, chatSession.sessionId);

    // Add the bot's reply to the chat session
    chatSession.messages.push({
      sender: 'DobbyBot', // Use the bot's name as the sender
      senderType: 'Bot',  // Add senderType for technician message
      message: botReply,
      timestamp: new Date()
    });

    // Save the updated chat session with both user and bot messages
    await chatSession.save();

    // Return the bot's reply along with the session ID
    res.json({ reply: botReply, sessionId: chatSession.sessionId });

  } catch (error) {
    console.error('Error processing chat:', error);
    res.status(500).json({ error: 'Error processing chat' });
  }
};

// Helper function to create or retrieve a chat session

const getOrCreateChatSession = async (
  sessionId?: string,
  userId?: mongoose.Types.ObjectId,
  message?: string,
  userName?: string
): Promise<IChatSession> => {
  if (!message) throw new Error('Message is required');
  if (!userId) throw new Error('UserId is required');

  let chatSession;

  if (!sessionId) {
    const newSessionId = uuidv4();
    chatSession = new ChatSession({
      sessionId: newSessionId,
      userId,
      messages: [{ sender: userName || 'user', senderType: 'user', message, timestamp: new Date() }],
      updatedAt: new Date(), // Set updatedAt on creation
    });
  } else {
    chatSession = await ChatSession.findOne({ sessionId });

    if (!chatSession) {
      chatSession = new ChatSession({
        sessionId,
        userId,
        messages: [{ sender: userName || 'user', senderType: 'user', message, timestamp: new Date() }],
        updatedAt: new Date(), // Set updatedAt on creation
      });
    } else {
      chatSession.messages.push({ sender: userName || 'user', senderType: 'user', message, timestamp: new Date() });
      chatSession.updatedAt = new Date(); // Update timestamp on message addition
    }
  }

  await chatSession.save();
  return chatSession;
};
// Helper function to process the bot's response using Dialogflow
const processBotResponseWithDialogflow = async (message: string, sessionId: string) => {
  try {
    const sessionPath = sessionClient.projectAgentSessionPath(process.env.DIALOGFLOW_PROJECT_ID!, sessionId);
    const dialogflowResponse = await sessionClient.detectIntent({
      session: sessionPath,
      queryInput: { text: { text: message, languageCode: 'en' } },
    });

    const dialogflowReply = dialogflowResponse[0]?.queryResult?.fulfillmentText;
    //return dialogflowReply || 'I could not understand that.';
    const namedReply = `DobbyBot: ${dialogflowReply || 'I could not understand that.'}`;

    return namedReply;
  } catch (error) {
    console.error('Error processing Dialogflow request:', error);
    throw new Error('Error processing chat with Dialogflow');
  }
};

// Escalate chat to technician (No change here)

export const escalateToTechnician = async (req: Request, res: Response) => {
  const { chatId } = req.body; // This is now sessionId, not _id

  try {
    // Find chat session by sessionId instead of _id
    const chatSession = await ChatSession.findOne({ sessionId: chatId });
    if (!chatSession) return res.status(404).json({ message: 'Chat session not found' });

    const availableTechnician = await Technician.findOne({ available: true }).populate('userId');
    if (!availableTechnician) return res.status(404).json({ message: 'No available technicians' });

    const technicianName = (availableTechnician.userId as IUser).name;

    chatSession.status = 'escalated';
    chatSession.escalatedTo = availableTechnician._id as mongoose.Types.ObjectId;
    chatSession.messages.push({
      sender: technicianName,
      senderType: 'technician',  // Add senderType for technician message
      message: `Your chat has been escalated to technician: ${technicianName}`,
      timestamp: new Date(),
    });

    await chatSession.save();
    availableTechnician.handledChats.push(chatSession._id as mongoose.Types.ObjectId);
    availableTechnician.available = false;
    await availableTechnician.save();

    res.json({ message: `Chat escalated to technician ${technicianName}` });
  } catch (error) {
    res.status(500).json({ error: 'Error escalating chat' });
  }
};


// Fetch chat session
export const getChatSession = async (req: IAuthRequest, res: Response) => {
  const { chatId } = req.params;

  try {
    // Use `sessionId` instead of `_id`
    const chatSession = await ChatSession.findOne({ sessionId: chatId })
      .populate('escalatedTo', 'name')
      .populate('userId', 'name')
      .exec();

    if (!chatSession) {
      return res.status(404).json({ message: 'Chat session not found' });
    }

    const isAdminOrTechnician = req.user.role === 'admin' || req.user.role === 'technician';
    const isOwner = chatSession.userId && chatSession.userId.equals(req.user._id);

    if (!isAdminOrTechnician && !isOwner) {
      return res.status(403).json({ message: 'Access denied: You can only view your own chats.' });
    }

    const technician = chatSession.escalatedTo as IUser;
    const user = chatSession.userId as IUser;

    res.json({
      chatSession,
      userName: user ? user.name : 'Anonymous User',
      technicianName: technician ? technician.name : 'Technician',
    });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching chat session' });
  }
};


// Fetch all chat sessions (Admin and Technician only)
export const getAllChatSessions = async (req: IAuthRequest, res: Response) => {
  try {
    const isAdminOrTechnician = req.user.role === 'admin' || req.user.role === 'technician';
    if (!isAdminOrTechnician) {
      return res.status(403).json({ message: 'Access denied: Only admins and technicians can view all chats.' });
    }

    const chatSessions = await ChatSession.find()
      .populate('escalatedTo', 'name')
      .populate('userId', 'name')
      .exec();

    res.json(chatSessions);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching all chat sessions' });
  }
};



export const getUserChatHistory = async (req: IAuthRequest, res: Response) => {
  const userId = req.user?._id; // Get the authenticated user's ID

  try {
    // Fetch all chat sessions where userId matches the authenticated user's ID
    const userChats = await ChatSession.find({ userId })
      .populate('escalatedTo', 'name') // Optionally populate technician details
      .populate('userId', 'name') // Optionally populate user details
      .exec();

    if (!userChats.length) {
      return res.status(404).json({ message: 'No chat history found for this user.' });
    }

    res.json(userChats); // Return the user's chat history
  } catch (error) {
    console.error('Error fetching user chat history:', error);
    res.status(500).json({ error: 'Error fetching chat history' });
  }
};


// Real-time chat handler with WebSocket (Socket.IO)
export const chatWithBotWebSocket = async (
  io: any, 
  socket: Socket, 
  message: string, 
  sessionId: string, 
  userId: string
) => {
  try {
    const chatSession = await getOrCreateChatSession(sessionId, new mongoose.Types.ObjectId(userId), message, 'Anonymous User');
    const botReply = await processBotResponseWithDialogflow(message, chatSession.sessionId);
    
    // Emit the bot response back to the client
    socket.emit('botReply', { sessionId: chatSession.sessionId, reply: botReply });
  } catch (error) {
    console.error('Error processing chat via WebSocket:', error);
    socket.emit('botError', 'Error processing chat.');
  }
};