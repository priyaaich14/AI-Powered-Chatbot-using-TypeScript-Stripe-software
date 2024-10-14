// src/redux/store.ts
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice.ts'; // import your slice reducers here

export const store = configureStore({
  reducer: {
    auth: authReducer, // add other reducers as needed
  },
});

// Define the RootState type, which includes all the slices in your store
export type RootState = ReturnType<typeof store.getState>;

// Export AppDispatch for usage in other components (if needed)
export type AppDispatch = typeof store.dispatch;
