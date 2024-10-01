import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { sendMessageToBotAPI, escalateChatAPI } from './chatAPI';

// Thunk to send message to bot
export const sendMessageToBot = createAsyncThunk('chat/sendMessage', async (messageData, thunkAPI) => {
  try {
    const response = await sendMessageToBotAPI(messageData);
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data);
  }
});

// Thunk to escalate chat to technician
export const escalateChat = createAsyncThunk('chat/escalateChat', async (sessionId, thunkAPI) => {
  try {
    const response = await escalateChatAPI(sessionId);
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data);
  }
});

const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    messages: [],
    sessionId: null,
    status: 'idle',
  },
  reducers: {
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },
    setSessionId: (state, action) => {
      state.sessionId = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendMessageToBot.fulfilled, (state, action) => {
        state.messages.push({
          sender: 'DobbyBot',
          senderType: 'bot',
          message: action.payload.reply,
        });
      });
  },
});

export const { addMessage, setSessionId } = chatSlice.actions;
export default chatSlice.reducer;
