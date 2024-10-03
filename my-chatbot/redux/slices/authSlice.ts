import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { loginAPI, registerAPI, updateEmail as updateEmailAPI, updatePassword as updatePasswordAPI, deleteAccount as deleteAccountAPI } from '../../services/authService.ts';
import { RootState } from '../store';

// Define the AuthState interface to handle the user's state
interface AuthState {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  } | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

// Initialize the auth state
const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('token'),  // Load token from localStorage if available
  loading: false,
  error: null,
};

// Login User Action
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async ({ email, password }: { email: string; password: string }, thunkAPI) => {
    try {
      const response = await loginAPI(email, password);
      return response;  // Return the API response containing user info and token
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
      const response = await registerAPI(name, email, password, role);
      return response;  // Return the API response containing user info and token
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
    },
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

      // Handle Password Update
      .addCase(updatePassword.fulfilled, (state) => {
        // Password updated successfully, no need to modify user state
      })

      // Handle Account Deletion
      .addCase(deleteAccount.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        localStorage.removeItem('token');  // Clear token from localStorage
      });
  },
});

// Export the logout action and selector to access auth state
export const { logout } = authSlice.actions;

// Selector to access the auth state
export const selectAuth = (state: RootState) => state.auth;

export default authSlice.reducer;
