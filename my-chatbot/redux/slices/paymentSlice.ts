
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import paymentService from '../../services/paymentService.ts';

// Define types for the state
interface PaymentState {
  paymentMethod: string | null;
  subscription: any | null;
  customer: any | null;
  paymentDetails: any | null;
  sessionId: string | null;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  errorMessage: string | null;
}

// Initial state
const initialState: PaymentState = {
  paymentMethod: null,
  subscription: null,
  customer: null,
  paymentDetails: null,
  sessionId: null,
  isLoading: false,
  isSuccess: false,
  isError: false,
  errorMessage: null,
};

// Create Payment Method
export const createPaymentMethod = createAsyncThunk(
  'payment/createPaymentMethod',
  async (paymentToken: string, thunkAPI) => {
    try {
      const response = await paymentService.createPaymentMethod(paymentToken);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Create Subscription
export const createSubscription = createAsyncThunk(
  'payment/createSubscription',
  async (
    { email, paymentMethodId, priceId, name, phone }: 
    { email: string; paymentMethodId: string; priceId: string; name: string; phone: string }, 
    thunkAPI
  ) => {
    try {
      const response = await paymentService.createSubscription(email, paymentMethodId, priceId, name, phone);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Cancel Subscription
export const cancelSubscription = createAsyncThunk(
  'payment/cancelSubscription',
  async (subscriptionId: string, thunkAPI) => {
    try {
      const response = await paymentService.cancelSubscription(subscriptionId);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const getSubscriptionDetails = createAsyncThunk<
  { subscription: any; customer: any },  // On success
  string,                                // Input (sessionId)
  { rejectValue: string }                // Rejected case type
>(
  'payment/getSubscriptionDetails',
  async (sessionId: string, thunkAPI) => {
    try {
      const response = await paymentService.getSubscriptionDetails(sessionId);
      return {
        subscription: response.subscription,
        customer: response.customer,
      };
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);  // Return rejectWithValue with a proper type
    }
  }
);


// Create Checkout Session
export const createCheckoutSession = createAsyncThunk(
  'payment/createCheckoutSession',
  async (
    { priceId, email, name, phone }: 
    { priceId: string; email: string; name: string; phone: string },
    thunkAPI
  ) => {
    try {
      const response = await paymentService.createCheckoutSession({
        priceId,
        email,
        name,
        phone,
      });

      if (!response || !response.sessionId) {
        throw new Error('Invalid sessionId received from backend');
      }

      return response;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Payment Slice
const paymentSlice = createSlice({
  name: 'payment',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.errorMessage = null;
      state.paymentMethod = null;
      state.subscription = null;
      state.customer = null;
      state.paymentDetails = null;
      state.sessionId = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createPaymentMethod.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createPaymentMethod.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.paymentMethod = action.payload.paymentMethodId;
      })
      .addCase(createPaymentMethod.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMessage = action.payload as string;
      })
      .addCase(createSubscription.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createSubscription.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.subscription = action.payload;
      })
      .addCase(createSubscription.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMessage = action.payload as string;
      })
      .addCase(cancelSubscription.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(cancelSubscription.fulfilled, (state) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.subscription = null;
      })
      .addCase(cancelSubscription.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMessage = action.payload as string;
      })
      .addCase(getSubscriptionDetails.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getSubscriptionDetails.fulfilled, (state, action) => {
        console.log(action.payload); 
        state.isLoading = false;
        state.isSuccess = true;
        state.subscription = action.payload.subscription;
        state.customer = action.payload.customer;
      })
      .addCase(getSubscriptionDetails.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMessage = action.payload as string;
      });
  },
});

export const { reset } = paymentSlice.actions;
export default paymentSlice.reducer;
