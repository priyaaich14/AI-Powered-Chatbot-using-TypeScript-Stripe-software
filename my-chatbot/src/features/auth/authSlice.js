// // import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
// // import { loginUser, registerUser, promoteToTechnicianAPI, deleteAccount, updateEmail } from './authAPI';
// // import { toast } from 'react-toastify';

// // // Thunk to handle login
// // export const login = createAsyncThunk('auth/login', async (credentials, thunkAPI) => {
// //   try {
// //     const response = await loginUser(credentials);
// //     toast.success(`Welcome back, ${response.data.name}`);
// //     return response.data;
// //   } catch (error) {
// //     toast.error(error.response?.data?.message || 'Login failed');
// //     return thunkAPI.rejectWithValue(error.response?.data);
// //   }
// // });

// // // Thunk to handle registration
// // export const register = createAsyncThunk('auth/register', async (data, thunkAPI) => {
// //   try {
// //     const response = await registerUser(data);
// //     toast.success('Registration successful');
// //     return response.data;
// //   } catch (error) {
// //     toast.error(error.response?.data?.message || 'Registration failed');
// //     return thunkAPI.rejectWithValue(error.response?.data);
// //   }
// // });

// // // Thunk to promote user to technician (Admin only)
// // export const promoteToTechnician = createAsyncThunk('auth/promoteToTechnician', async (userId, thunkAPI) => {
// //   try {
// //     const response = await promoteToTechnicianAPI(userId);
// //     toast.success('User promoted to technician successfully');
// //     return response.data;
// //   } catch (error) {
// //     toast.error('Failed to promote user to technician');
// //     return thunkAPI.rejectWithValue(error.response?.data);
// //   }
// // });

// // const authSlice = createSlice({
// //   name: 'auth',
// //   initialState: {
// //     user: null,
// //     token: null,
// //     role: null,
// //     status: 'idle',
// //   },
// //   reducers: {
// //     logout: (state) => {
// //       state.user = null;
// //       state.token = null;
// //       state.role = null;
// //     },
// //   },
// //   extraReducers: (builder) => {
// //     builder
// //       .addCase(login.fulfilled, (state, action) => {
// //         state.user = action.payload.user;
// //         state.token = action.payload.token;
// //         state.role = action.payload.role;
// //       })
// //       .addCase(register.fulfilled, (state, action) => {
// //         state.user = action.payload.user;
// //         state.token = action.payload.token;
// //         state.role = action.payload.role;
// //       });
// //   },
// // });

// // export const { logout } = authSlice.actions;
// // export default authSlice.reducer;


// import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
// import { loginUserAPI, registerUserAPI } from '../api/authAPI';

// // Async thunk for login
// export const loginUser = createAsyncThunk(
//   'auth/loginUser',
//   async (credentials, thunkAPI) => {
//     try {
//       const response = await loginUserAPI(credentials); // Call login API
//       const { token, user } = response.data;

//       // Store the token in localStorage for persistence
//       localStorage.setItem('token', token);
//       localStorage.setItem('user', JSON.stringify(user)); // Store the user's info
//       return user; // Return user data as the fulfilled result
//     } catch (error) {
//       return thunkAPI.rejectWithValue(error.response.data); // Return error as rejected result
//     }
//   }
// );

// // Async thunk for registering a user
// export const registerUser = createAsyncThunk(
//   'auth/registerUser',
//   async (userData, thunkAPI) => {
//     try {
//       const response = await registerUserAPI(userData); // Call register API
//       return response.data; // Return the result of registration
//     } catch (error) {
//       return thunkAPI.rejectWithValue(error.response.data); // Handle error
//     }
//   }
// );

// // Slice for authentication
// const authSlice = createSlice({
//   name: 'auth',
//   initialState: {
//     user: JSON.parse(localStorage.getItem('user')) || null, // Initial state based on localStorage
//     token: localStorage.getItem('token') || null,
//     isAuthenticated: !!localStorage.getItem('token'), // Check if the user is already logged in
//     loading: false,
//     error: null,
//   },
//   reducers: {
//     logout: (state) => {
//       state.user = null;
//       state.token = null;
//       state.isAuthenticated = false;
//       localStorage.removeItem('token'); // Remove token from localStorage
//       localStorage.removeItem('user'); // Remove user data from localStorage
//     },
//   },
//   extraReducers: (builder) => {
//     // Handle login
//     builder
//       .addCase(loginUser.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(loginUser.fulfilled, (state, action) => {
//         state.loading = false;
//         state.user = action.payload; // Store user info in the state
//         state.isAuthenticated = true;
//       })
//       .addCase(loginUser.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       });

//     // Handle register
//     builder
//       .addCase(registerUser.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(registerUser.fulfilled, (state, action) => {
//         state.loading = false;
//       })
//       .addCase(registerUser.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       });
//   },
// });

// export const { logout } = authSlice.actions;
// export default authSlice.reducer;


import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { loginUserAPI, registerUserAPI } from '../api/authAPI';

// Async thunk for login
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials, thunkAPI) => {
    try {
      const response = await loginUserAPI(credentials); // Call login API
      const { token, user } = response.data;

      // Store the token and user in localStorage for persistence
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      return user; // Return user data to update state
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data);
    }
  }
);

// Async thunk for register
export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (userData, thunkAPI) => {
    try {
      const response = await registerUserAPI(userData); // Call register API
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data);
    }
  }
);

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: JSON.parse(localStorage.getItem('user')) || null, // Persist user from localStorage
    token: localStorage.getItem('token') || null, // Persist token from localStorage
    isAuthenticated: !!localStorage.getItem('token'), // Boolean check for authentication
    loading: false,
    error: null,
  },
  reducers: {
    logout: (state) => {
      // Clear user data and token from Redux state
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;

      // Remove user data and token from localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true; // Set authenticated to true on success
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload; // Handle error
      })
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logout } = authSlice.actions; // Export the logout action
export default authSlice.reducer;
