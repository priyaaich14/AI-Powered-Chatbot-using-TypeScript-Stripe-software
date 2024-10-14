import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { loginAPI, registerAPI, updateEmail as updateEmailAPI, updatePassword as updatePasswordAPI, deleteAccount as deleteAccountAPI } from '../../services/authService.ts';
import { getSubscriptionDetails } from '../slices/paymentSlice.ts';  
import { RootState } from '../store.ts';
import { clearChatState } from './chatSlice.ts';
import { reset as resetPayment } from './paymentSlice.ts';  

// Define the AuthState interface to handle the user's state
interface AuthState {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    subscriptionId?: string;
    subscriptionStatus?: string; // Add subscriptionStatus to persist status
  } | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

// Load user details and token from localStorage if available
const storedUser = localStorage.getItem('user');
let parsedUser = null;

if (storedUser) {
  try {
    parsedUser = JSON.parse(storedUser);
  } catch (e) {
    console.error('Error parsing stored user:', e);
  }
}

const storedToken = localStorage.getItem('token') || null;

const initialState: AuthState = {
  user: parsedUser,
  token: storedToken,
  loading: false,
  error: null,
};
// Login User Action
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async ({ email, password }: { email: string; password: string }, thunkAPI) => {
    try {
      // Reset the payment state to clear previous subscription details
      thunkAPI.dispatch(resetPayment());

      const response = await loginAPI(email, password);
      
      // Clear chat state when a new user logs in
      thunkAPI.dispatch(clearChatState());

      // Fetch subscription details after login and store them in Redux
      if (response.user.subscriptionId) {
        const subscriptionDetails = await thunkAPI.dispatch(getSubscriptionDetails(response.user.subscriptionId)).unwrap();
        
        // Merge subscription details into the user object
        response.user.subscriptionStatus = subscriptionDetails.subscription.status;
      }

      // Persist user details and token in localStorage
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));

      return response;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Invalid login credentials');
    }
  }
);

// Register User Action
export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async ({ name, email, password, role }: { name: string; email: string; password: string; role: string }, thunkAPI) => {
    try {
      // Reset the payment state to clear previous subscription details
      thunkAPI.dispatch(resetPayment());

      const response = await registerAPI(name, email, password, role);
      
      // Clear chat state when a new user registers
      thunkAPI.dispatch(clearChatState());

      // Fetch subscription details after registration if applicable
      if (response.user.subscriptionId) {
        const subscriptionDetails = await thunkAPI.dispatch(getSubscriptionDetails(response.user.subscriptionId)).unwrap();
        
        // Merge subscription details into the user object
        response.user.subscriptionStatus = subscriptionDetails.subscription.status;
      }

      // Persist user details and token in localStorage
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));

      return response;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Registration error');
    }
  }
);

// Update Email Action
export const updateEmail = createAsyncThunk(
  'auth/updateEmail',
  async (newEmail: string, thunkAPI) => {
    try {
      const response = await updateEmailAPI(newEmail);
      return response.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Error updating email');
    }
  }
);

// Update Password Action
export const updatePassword = createAsyncThunk(
  'auth/updatePassword',
  async ({ oldPassword, newPassword }: { oldPassword: string; newPassword: string }, thunkAPI) => {
    try {
      const response = await updatePasswordAPI(oldPassword, newPassword);
      return response.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Error updating password');
    }
  }
);

// Delete Account Action
export const deleteAccount = createAsyncThunk(
  'auth/deleteAccount',
  async (_, thunkAPI) => {
    try {
      await deleteAccountAPI();

      // Clear both chat and payment state on account deletion
      thunkAPI.dispatch(clearChatState());
      thunkAPI.dispatch(resetPayment());

      return null;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Error deleting account');
    }
  }
);

// Create the auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Logout action: clear user and token from state and localStorage
    logout: (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('chatState');  // Clear chat state from localStorage
    },
    // Action to update subscription status
    updateUserSubscriptionStatus: (state, action) => {
      if (state.user) {
        state.user.subscriptionStatus = action.payload; // Update the user's subscription status
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Handle Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;  // Store user data from the response
        state.token = action.payload.token;  // Store token from the response
        localStorage.setItem('token', action.payload.token);  // Save token in localStorage
        localStorage.setItem('user', JSON.stringify(action.payload.user));  // Save user in localStorage
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Handle Registration
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;  // Store user data after registration
        state.token = action.payload.token;  // Store token
        localStorage.setItem('token', action.payload.token);  // Save token in localStorage
        localStorage.setItem('user', JSON.stringify(action.payload.user));  // Save user in localStorage
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Handle Email Update
      .addCase(updateEmail.fulfilled, (state, action) => {
        if (state.user) {
          state.user.email = action.payload.email;
        }
      })

      // Handle Account Deletion
      .addCase(deleteAccount.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('chatState');
      });
  },
});

// Export the logout action and selector to access auth state
export const { logout, updateUserSubscriptionStatus } = authSlice.actions;

// Selector to access the auth state
export const selectAuth = (state: RootState) => state.auth;

export default authSlice.reducer;
