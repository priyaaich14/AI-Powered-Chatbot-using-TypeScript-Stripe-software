// import { Request, Response } from 'express';
// import OpenAI from 'openai';
// import dialogflow from '@google-cloud/dialogflow';
// import dotenv from 'dotenv';
// import { Types } from 'mongoose';  // Import mongoose and Types for ObjectId
// import ChatSession, { IChatSession } from '../models/ChatSession';  // Import the ChatSession model
// import Technician, { ITechnician } from '../models/Technician';    // Import the Technician model

// dotenv.config();  // Load environment variables

// // Initialize the OpenAI client with the API key
// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,  // Use the OpenAI API key from the environment
// });

// // Initialize Dialogflow client
// const sessionClient = new dialogflow.SessionsClient();

// // Function to handle chat with the bot (OpenAI + Dialogflow)
// // This version can handle both HTTP (with req, res) and WebSocket (with message and sessionId directly)
// export const chatWithBot = async (message: string, sessionId: string, req?: Request, res?: Response) => {
//   try {
//     // OpenAI GPT-3.5 response
//     const aiResponse = await openai.chat.completions.create({
//       model: 'gpt-3.5-turbo',
//       messages: [{ role: 'user', content: message }],
//     });

//     const botReply = aiResponse.choices[0]?.message?.content?.trim();

//     // Dialogflow for simple intents
//     const sessionPath = sessionClient.projectAgentSessionPath(process.env.DIALOGFLOW_PROJECT_ID!, sessionId);
//     const dialogflowResponse = await sessionClient.detectIntent({
//       session: sessionPath,
//       queryInput: { text: { text: message, languageCode: 'en' } },
//     });
//     const dialogflowReply = dialogflowResponse[0]?.queryResult?.fulfillmentText;

//     const reply = botReply || dialogflowReply || 'I could not understand that.';

//     // If HTTP request, send response
//     if (req && res) {
//       res.json({ reply });
//     }

//     // For WebSocket, return the response
//     return reply;
//   } catch (error) {
//     if (res) {
//       res.status(500).json({ error: 'Error processing chat' });
//     } else {
//       console.error('Error processing chat:', error);
//     }
//     return 'Error processing chat';
//   }
// };

// // Function to escalate a chat to an available technician
// export const escalateToTechnician = async (req: Request, res: Response) => {
//   const { chatId } = req.body;

//   try {
//     // Find the chat session by ID
//     const chatSession: IChatSession | null = await ChatSession.findById(chatId);
//     if (!chatSession) return res.status(404).json({ message: 'Chat session not found' });

//     // Find an available technician
//     const availableTechnician: ITechnician | null = await Technician.findOne({ available: true });
//     if (!availableTechnician) return res.status(404).json({ message: 'No available technicians' });

//     // Escalate the chat to the technician
//     chatSession.status = 'escalated';
//     chatSession.escalatedTo = availableTechnician._id as Types.ObjectId;  // Cast `_id` to ObjectId
//     await chatSession.save();

//     // Set the technician as unavailable and add the chat session to their handled chats
//     availableTechnician.available = false;
//     availableTechnician.handledChats.push(chatSession._id as Types.ObjectId);  // Cast `_id` to ObjectId
//     await availableTechnician.save();

//     res.json({ message: 'Chat escalated to technician' });
//   } catch (error) {
//     res.status(500).json({ error: 'Error escalating chat' });
//   }
// };

// // Function to get the chat session and populate the escalated technician info
// export const getChatSession = async (req: Request, res: Response) => {
//   const { chatId } = req.params;

//   try {
//     // Find the chat session and populate the `escalatedTo` field with the technician info
//     const chatSession: IChatSession | null = await ChatSession.findById(chatId).populate<{
//       escalatedTo: ITechnician;
//     }>('escalatedTo');

//     if (!chatSession) {
//       return res.status(404).json({ message: 'Chat session not found' });
//     }

//     res.json(chatSession);
//   } catch (error) {
//     res.status(500).json({ error: 'Error fetching chat session' });
//   }
// };


// import { Request, Response } from 'express';
// import { v4 as uuidv4 } from 'uuid';
// import OpenAI from 'openai';
// import dialogflow from '@google-cloud/dialogflow';
// import dotenv from 'dotenv';
// import { Types } from 'mongoose';  // Import mongoose and Types for ObjectId
// import ChatSession, { IChatSession } from '../models/ChatSession';  // Import the ChatSession model
// import Technician from '../models/Technician';    // Import the Technician model

// dotenv.config();

// // Initialize the OpenAI client with the API key
// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// });

// // Initialize Dialogflow client
// const sessionClient = new dialogflow.SessionsClient();

// // Function to handle chat with the bot (OpenAI + Dialogflow)
// export const chatWithBot = async (req: Request, res: Response) => {
//   const { message, sessionId } = req.body;

//   try {
//     let chatSession;

//     // If no sessionId is provided, generate a new one
//     if (!sessionId) {
//       const newSessionId = uuidv4();  // Generate a new session ID
//       chatSession = new ChatSession({
//         sessionId: newSessionId,
//         userId: req.user._id,  // Assuming the user is authenticated, and req.user exists
//         messages: [{ sender: 'user', message, timestamp: new Date() }],
//       });
//     } else {
//       // Check if the session exists
//       chatSession = await ChatSession.findOne({ sessionId });
//       if (!chatSession) {
//         chatSession = new ChatSession({
//           sessionId,
//           userId: req.user._id,
//           messages: [{ sender: 'user', message, timestamp: new Date() }],
//         });
//       } else {
//         // Append the new message to the existing session
//         chatSession.messages.push({ sender: 'user', message, timestamp: new Date() });
//       }
//     }

//     await chatSession.save();

//     // Process bot response using OpenAI or Dialogflow
//     const aiResponse = await openai.chat.completions.create({
//       model: 'gpt-3.5-turbo',
//       messages: [{ role: 'user', content: message }],
//     });

//     const botReply = aiResponse.choices[0]?.message?.content?.trim();

//     // Dialogflow for simple intents
//     const sessionPath = sessionClient.projectAgentSessionPath(process.env.DIALOGFLOW_PROJECT_ID!, sessionId || chatSession.sessionId);
//     const dialogflowResponse = await sessionClient.detectIntent({
//       session: sessionPath,
//       queryInput: { text: { text: message, languageCode: 'en' } },
//     });
//     const dialogflowReply = dialogflowResponse[0]?.queryResult?.fulfillmentText;

//     const reply = botReply || dialogflowReply || 'I could not understand that.';

//     res.json({ reply, sessionId: chatSession.sessionId });
//   } catch (error) {
//     res.status(500).json({ error: 'Error processing chat' });
//   }
// };

// // Function to escalate a chat to an available technician
// export const escalateToTechnician = async (req: Request, res: Response) => {
//   const { chatId } = req.body;

//   try {
//     const chatSession = await ChatSession.findById(chatId);
//     if (!chatSession) return res.status(404).json({ message: 'Chat session not found' });

//     const availableTechnician = await Technician.findOne({ available: true });
//     if (!availableTechnician) return res.status(404).json({ message: 'No available technicians' });

//     chatSession.status = 'escalated';
//     chatSession.escalatedTo = availableTechnician._id as Types.ObjectId;
//     await chatSession.save();

//     availableTechnician.available = false;
//     availableTechnician.handledChats.push(chatSession._id);
//     await availableTechnician.save();

//     res.json({ message: 'Chat escalated to technician' });
//   } catch (error) {
//     res.status(500).json({ error: 'Error escalating chat' });
//   }
// };

// // Function to get the chat session and populate the escalated technician info
// export const getChatSession = async (req: Request, res: Response) => {
//   const { chatId } = req.params;

//   try {
//     const chatSession = await ChatSession.findById(chatId).populate('escalatedTo');

//     if (!chatSession) {
//       return res.status(404).json({ message: 'Chat session not found' });
//     }

//     res.json(chatSession);
//   } catch (error) {
//     res.status(500).json({ error: 'Error fetching chat session' });
//   }
// };


// import { Request, Response } from 'express';
// import { v4 as uuidv4 } from 'uuid';
// import OpenAI from 'openai';
// import dialogflow from '@google-cloud/dialogflow';
// import dotenv from 'dotenv';
// import mongoose from 'mongoose';
// import ChatSession, { IChatSession } from '../models/ChatSession';
// import Technician from '../models/Technician';

// dotenv.config();

// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// });

// const sessionClient = new dialogflow.SessionsClient();

// // Function to handle chat via HTTP (Express middleware)
// // export const chatWithBotHttp = async (req: Request, res: Response) => {
// //   try {
// //     const { message, sessionId } = req.body;
// //     const chatSession = await getOrCreateChatSession(sessionId, req.user?._id as mongoose.Types.ObjectId, message);
    
// //     const botReply = await processBotResponse(message, chatSession.sessionId);
// //     res.json({ reply: botReply, sessionId: chatSession.sessionId });
// //   } catch (error) {
// //     console.error('Error processing chat:', error);
// //     res.status(500).json({ error: 'Error processing chat' });
// //   }
// // };
// export const chatWithBotHttp = async (req: Request, res: Response) => {
//   try {
//     const { message, sessionId } = req.body;
//     const userId = req.user?._id;  // Get user ID from req.user

//     // Pass the userId to the getOrCreateChatSession function
//     const chatSession = await getOrCreateChatSession(sessionId, userId as mongoose.Types.ObjectId, message);
    
//     const botReply = await processBotResponse(message, chatSession.sessionId);
//     res.json({ reply: botReply, sessionId: chatSession.sessionId });
//   } catch (error) {
//     console.error('Error processing chat:', error);
//     res.status(500).json({ error: 'Error processing chat' });
//   }
// };

// // Function to handle chat via WebSocket
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
// // const getOrCreateChatSession = async (sessionId?: string, userId?: mongoose.Types.ObjectId, message?: string) => {
// //   let chatSession: IChatSession | null;

// //   const userSessionId = sessionId || uuidv4();  // Ensure sessionId is always a string

// //   if (!sessionId) {
// //     chatSession = new ChatSession({
// //       sessionId: userSessionId,
// //       userId: userId || null,
// //       messages: [{ sender: 'user', message: message || '', timestamp: new Date() }],  // Ensure message is a string
// //     });
// //   } else {
// //     chatSession = await ChatSession.findOne({ sessionId: userSessionId });
// //     if (!chatSession) {
// //       chatSession = new ChatSession({
// //         sessionId: userSessionId,
// //         userId: userId || null,
// //         messages: [{ sender: 'user', message: message || '', timestamp: new Date() }],  // Ensure message is a string
// //       });
// //     } else {
// //       chatSession.messages.push({ sender: 'user', message: message || '', timestamp: new Date() });  // Ensure message is a string
// //     }
// //   }
// //   await chatSession.save();
// //   return chatSession;
// // };
// const getOrCreateChatSession = async (sessionId?: string, userId?: mongoose.Types.ObjectId, message?: string) => {
//   let chatSession;

//   // If no sessionId is provided, generate a new one
//   if (!sessionId) {
//     const newSessionId = uuidv4();
//     chatSession = new ChatSession({
//       sessionId: newSessionId,
//       userId: userId || null,  // Ensure that userId is provided
//       messages: [{ sender: 'user', message: message || '', timestamp: new Date() }],
//     });
//   } else {
//     chatSession = await ChatSession.findOne({ sessionId });
//     if (!chatSession) {
//       chatSession = new ChatSession({
//         sessionId,
//         userId: userId || null,
//         messages: [{ sender: 'user', message: message || '', timestamp: new Date() }],
//       });
//     } else {
//       // Append the new message to the existing session
//       chatSession.messages.push({ sender: 'user', message: message || '', timestamp: new Date() });
//     }
//   }

//   // Validate that userId is present before saving
//   if (!chatSession.userId) {
//     throw new Error('User ID is required');
//   }

//   await chatSession.save();
//   return chatSession;
// };

// // Helper function to process the bot's response
// const processBotResponse = async (message: string, sessionId: string) => {
//   // OpenAI GPT-3.5 response
//   const aiResponse = await openai.chat.completions.create({
//     model: 'gpt-3.5-turbo',
//     messages: [{ role: 'user', content: message }],
//   });

//   const botReply = aiResponse.choices[0]?.message?.content?.trim();

//   // Dialogflow for simple intents
//   const sessionPath = sessionClient.projectAgentSessionPath(process.env.DIALOGFLOW_PROJECT_ID!, sessionId);
//   const dialogflowResponse = await sessionClient.detectIntent({
//     session: sessionPath,
//     queryInput: { text: { text: message, languageCode: 'en' } },
//   });

//   const dialogflowReply = dialogflowResponse[0]?.queryResult?.fulfillmentText;
//   return botReply || dialogflowReply || 'I could not understand that.';
// };



import { Request, Response } from 'express';
import { IAuthRequest } from '../middlewares/auth';  // Import the custom request type
import { v4 as uuidv4 } from 'uuid';
import OpenAI from 'openai';
import dialogflow from '@google-cloud/dialogflow';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import ChatSession, { IChatSession } from '../models/ChatSession';
import Technician from '../models/Technician';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const sessionClient = new dialogflow.SessionsClient();

// Function to handle chat via HTTP (Express middleware)
export const chatWithBotHttp = async (req: IAuthRequest, res: Response) => {
  try {
    const { message, sessionId } = req.body;
    const userId = req.user?._id as mongoose.Types.ObjectId;  // Use the custom IAuthRequest with user property

    const chatSession = await getOrCreateChatSession(sessionId, userId, message);
    const botReply = await processBotResponse(message, chatSession.sessionId);
    
    res.json({ reply: botReply, sessionId: chatSession.sessionId });
  } catch (error) {
    console.error('Error processing chat:', error);
    res.status(500).json({ error: 'Error processing chat' });
  }
};

// Function to handle chat via WebSocket (no user required)
export const chatWithBotWebSocket = async (message: string, sessionId: string) => {
  try {
    const chatSession = await getOrCreateChatSession(sessionId, undefined, message);
    return await processBotResponse(message, chatSession.sessionId);
  } catch (error) {
    console.error('Error processing chat:', error);
    return 'Error processing chat';
  }
};

// Helper function to create or retrieve a chat session
// const getOrCreateChatSession = async (sessionId?: string, userId?: mongoose.Types.ObjectId, message?: string) => {
//   let chatSession;

//   if (!sessionId) {
//     const newSessionId = uuidv4();
//     chatSession = new ChatSession({
//       sessionId: newSessionId,
//       userId: userId || null,
//       messages: [{ sender: 'user', message, timestamp: new Date() }],
//     });
//   } else {
//     chatSession = await ChatSession.findOne({ sessionId });
//     if (!chatSession) {
//       chatSession = new ChatSession({
//         sessionId,
//         userId: userId || null,
//         messages: [{ sender: 'user', message, timestamp: new Date() }],
//       });
//     } else {
//       chatSession.messages.push({ sender: 'user', message, timestamp: new Date() });
//     }
//   }

//   await chatSession.save();
//   return chatSession;
// };
const getOrCreateChatSession = async (sessionId?: string, userId?: mongoose.Types.ObjectId, message?: string) => {
  if (!message) {
    throw new Error('Message is required');  // Ensure that message is not undefined
  }

  let chatSession;

  if (!sessionId) {
    const newSessionId = uuidv4();
    chatSession = new ChatSession({
      sessionId: newSessionId,
      userId: userId || null,
      messages: [{ sender: 'user', message, timestamp: new Date() }],
    });
  } else {
    chatSession = await ChatSession.findOne({ sessionId });
    if (!chatSession) {
      chatSession = new ChatSession({
        sessionId,
        userId: userId || null,
        messages: [{ sender: 'user', message, timestamp: new Date() }],
      });
    } else {
      chatSession.messages.push({ sender: 'user', message, timestamp: new Date() });
    }
  }

  await chatSession.save();
  return chatSession;
};

// Helper function to process the bot's response
const processBotResponse = async (message: string, sessionId: string) => {
  const aiResponse = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: message }],
  });

  const botReply = aiResponse.choices[0]?.message?.content?.trim();

  const sessionPath = sessionClient.projectAgentSessionPath(process.env.DIALOGFLOW_PROJECT_ID!, sessionId);
  const dialogflowResponse = await sessionClient.detectIntent({
    session: sessionPath,
    queryInput: { text: { text: message, languageCode: 'en' } },
  });

  const dialogflowReply = dialogflowResponse[0]?.queryResult?.fulfillmentText;
  return botReply || dialogflowReply || 'I could not understand that.';
};

// Escalate chat to technician
export const escalateToTechnician = async (req: Request, res: Response) => {
  const { chatId } = req.body;

  try {
    const chatSession = await ChatSession.findById(chatId);
    if (!chatSession) return res.status(404).json({ message: 'Chat session not found' });

    const availableTechnician = await Technician.findOne({ available: true });
    if (!availableTechnician) return res.status(404).json({ message: 'No available technicians' });

    chatSession.status = 'escalated';
    chatSession.escalatedTo = availableTechnician._id as mongoose.Types.ObjectId;
    await chatSession.save();

    // Fix the handledChats.push method
    (availableTechnician.handledChats as mongoose.Types.ObjectId[]).push(chatSession._id as mongoose.Types.ObjectId);
    availableTechnician.available = false;
    await availableTechnician.save();

    res.json({ message: 'Chat escalated to technician' });
  } catch (error) {
    res.status(500).json({ error: 'Error escalating chat' });
  }
};

// Fetch chat session
export const getChatSession = async (req: Request, res: Response) => {
  const { chatId } = req.params;

  try {
    const chatSession = await ChatSession.findById(chatId).populate('escalatedTo');

    if (!chatSession) {
      return res.status(404).json({ message: 'Chat session not found' });
    }

    res.json(chatSession);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching chat session' });
  }
};
