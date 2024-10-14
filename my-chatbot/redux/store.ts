import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // Defaults to localStorage for web
import authReducer from './slices/authSlice.ts';
import chatReducer from './slices/chatSlice.ts';
import paymentReducer from './slices/paymentSlice.ts';

// Redux Persist Configuration
const persistConfig = {
  key: 'root',
  storage,
};

// Persisted Reducers
const persistedAuthReducer = persistReducer(persistConfig, authReducer);
const persistedPaymentReducer = persistReducer(persistConfig, paymentReducer);

// Store Configuration
export const store = configureStore({
  reducer: {
    auth: persistedAuthReducer, // Persisted auth reducer
    chat: chatReducer,
    payment: persistedPaymentReducer, // Persisted payment reducer
  },
});

export const persistor = persistStore(store);

// Define the RootState type
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
