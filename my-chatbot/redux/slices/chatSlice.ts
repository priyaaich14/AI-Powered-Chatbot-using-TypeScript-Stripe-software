
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import * as chatService from '../../services/chatService.ts';

// Clear chat state action to reset the chat history and messages for each user
export const clearChatState = createAsyncThunk(
  'chat/clearChatState',
  async (_, { dispatch }) => {
    localStorage.removeItem('chatState');  // Clear chat-related data from localStorage
    return {};  // Return empty object to reset state
  }
);

export const sendMessageToBot = createAsyncThunk('chat/sendMessage', async (message: string, { rejectWithValue }) => {
  try {
    const response = await chatService.sendMessageToBot(message);
    return response;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Error chatting with bot');
  }
});

export const fetchUserChatHistory = createAsyncThunk('chat/fetchHistory', async (_, { rejectWithValue }) => {
  try {
    const response = await chatService.fetchUserChatHistory();
    return response;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Error fetching chat history');
  }
});

export const escalateChat = createAsyncThunk('chat/escalate', async (chatId: string, { rejectWithValue }) => {
  try {
    const response = await chatService.escalateChat(chatId);
    return response;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Error escalating chat');
  }
});

export const fetchChatSession = createAsyncThunk('chat/fetchSession', async (chatId: string, { rejectWithValue }) => {
  try {
    const response = await chatService.fetchChatSession(chatId);
    return response;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Error fetching chat session');
  }
});

export const fetchAllChatSessions = createAsyncThunk('chat/fetchAllSessions', async (_, { rejectWithValue }) => {
  try {
    const response = await chatService.fetchAllChatSessions();
    return response;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Error fetching all chat sessions');
  }
});

interface ChatState {
  chatHistory: any[];
  chatSessions: any[];
  currentChatMessages: any[];
  botReply: string | null;
  loading: boolean;
  error: string | null;
  status: 'open' | 'closed' | 'escalated' | null;
  isActiveChat: boolean;
}

const loadState = (): ChatState => {
  try {
    const serializedState = localStorage.getItem('chatState');
    if (serializedState === null) {
      return {
        chatHistory: [],
        chatSessions: [],
        currentChatMessages: [],
        botReply: null,
        loading: false,
        error: null,
        status: 'open',
        isActiveChat: false,
      };
    }
    return JSON.parse(serializedState);
  } catch (err) {
    return {
      chatHistory: [],
      chatSessions: [],
      currentChatMessages: [],
      botReply: null,
      loading: false,
      error: null,
      status: 'open',
      isActiveChat: false,
    };
  }
};

const saveState = (state: ChatState) => {
  try {
    const serializedState = JSON.stringify({
      ...state,
      isActiveChat: state.isActiveChat,
    });
    localStorage.setItem('chatState', serializedState);
  } catch {
    // Ignore write errors
  }
};

const initialState: ChatState = loadState();

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setActiveChat: (state, action: PayloadAction<boolean>) => {
      state.isActiveChat = action.payload;
      saveState(state);
    },
    addMessage: (state, action: PayloadAction<{ sender: string; message: string }>) => {
      state.currentChatMessages.push(action.payload);
      saveState(state);
    },
    clearCurrentChat: (state) => {
      state.currentChatMessages = [];
      state.isActiveChat = false;
      saveState(state);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendMessageToBot.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendMessageToBot.fulfilled, (state, action) => {
        state.loading = false;
        state.currentChatMessages.push({ sender: 'DobbyBot', message: action.payload.reply });
        state.status = action.payload.status || 'open';
        state.isActiveChat = true;
        saveState(state);
      })
      .addCase(sendMessageToBot.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        saveState(state);
      })
      .addCase(fetchChatSession.fulfilled, (state, action) => {
        state.status = action.payload.status;
        saveState(state);
      })
      .addCase(fetchUserChatHistory.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUserChatHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.chatHistory = action.payload;
        state.status = action.payload.find(chat => chat.status === 'closed') ? 'closed' : 'open';
        saveState(state);
      })
      .addCase(fetchUserChatHistory.rejected, (state) => {
        state.loading = false;
        saveState(state);
      })
      .addCase(escalateChat.fulfilled, (state) => {
        state.currentChatMessages.push({ sender: 'System', message: 'Chat escalated to a technician' });
        state.status = 'escalated';
        saveState(state);
      })
      .addCase(fetchAllChatSessions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllChatSessions.fulfilled, (state, action) => {
        state.loading = false;
        state.chatSessions = action.payload;
        saveState(state);
      })
      .addCase(fetchAllChatSessions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        saveState(state);
      })
      .addCase(clearChatState.fulfilled, (state) => {
        state.chatHistory = [];
        state.currentChatMessages = [];
        state.isActiveChat = false;
        state.status = 'open';
        saveState(state);
      });
  },
});

export const { setActiveChat, addMessage, clearCurrentChat } = chatSlice.actions;
export default chatSlice.reducer;




