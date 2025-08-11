import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';
import { API_ROUTES } from '../../api/BACKENDROUTES';
import { LOCAL_STORAGE_KEYS, API_STATUS } from '../../utils/constants';
import toast from 'react-hot-toast';

// Async thunks
export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(API_ROUTES.auth.login, {
        email,
        password
      });
      
      const { user, accessToken, refreshToken } = response.data;
      
      localStorage.setItem(LOCAL_STORAGE_KEYS.ACCESS_TOKEN, accessToken);
      localStorage.setItem(LOCAL_STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
      
      toast.success('Welcome back!');
      return { user, accessToken, refreshToken };
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
      return rejectWithValue(error.response?.data?.message || 'Login failed');
    }
  }
);

export const signupUser = createAsyncThunk(
  'auth/signup',
  async ({ name, email, password, phone, country, city }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(API_ROUTES.auth.signup, {
        name,
        email,
        password,
        ...(phone && { phone }),
        ...(country && { country }),
        ...(city && { city })
      });
      toast.success('Account created successfully! Please verify your email.');
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Signup failed');
      return rejectWithValue(error.response?.data?.message || 'Signup failed');
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await axiosInstance.post(API_ROUTES.auth.logout);
      localStorage.removeItem(LOCAL_STORAGE_KEYS.ACCESS_TOKEN);
      localStorage.removeItem(LOCAL_STORAGE_KEYS.REFRESH_TOKEN);
      toast.success('Logged out successfully');
      return null;
    } catch (error) {
      // Still clear local storage even if API call fails
      localStorage.removeItem(LOCAL_STORAGE_KEYS.ACCESS_TOKEN);
      localStorage.removeItem(LOCAL_STORAGE_KEYS.REFRESH_TOKEN);
      return null;
    }
  }
);

export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async ({ email }, { rejectWithValue }) => {
    try {
      await axiosInstance.post(API_ROUTES.auth.forgotPassword, { email });
      toast.success('Password reset email sent!');
      return null;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send reset email');
      return rejectWithValue(error.response?.data?.message || 'Failed to send reset email');
    }
  }
);

export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async ({ token, password }, { rejectWithValue }) => {
    try {
      await axiosInstance.post(API_ROUTES.auth.resetPassword, {
        token,
        password
      });
      toast.success('Password reset successfully!');
      return null;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Password reset failed');
      return rejectWithValue(error.response?.data?.message || 'Password reset failed');
    }
  }
);

export const verifyEmail = createAsyncThunk(
  'auth/verifyEmail',
  async ({ token }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(API_ROUTES.auth.verifyEmail, { token });
      toast.success('Email verified successfully!');
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Email verification failed');
      return rejectWithValue(error.response?.data?.message || 'Email verification failed');
    }
  }
);

export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(API_ROUTES.users.me);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get user');
    }
  }
);

const initialState = {
  user: null,
  accessToken: localStorage.getItem(LOCAL_STORAGE_KEYS.ACCESS_TOKEN),
  refreshToken: localStorage.getItem(LOCAL_STORAGE_KEYS.REFRESH_TOKEN),
  isAuthenticated: !!localStorage.getItem(LOCAL_STORAGE_KEYS.ACCESS_TOKEN),
  status: API_STATUS.IDLE,
  error: null
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCredentials: (state, action) => {
      const { user, accessToken, refreshToken } = action.payload;
      state.user = user;
      state.accessToken = accessToken;
      state.refreshToken = refreshToken;
      state.isAuthenticated = true;
    }
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.status = API_STATUS.LOADING;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = API_STATUS.SUCCESS;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = API_STATUS.ERROR;
        state.error = action.payload;
        state.isAuthenticated = false;
      })
      // Signup
      .addCase(signupUser.pending, (state) => {
        state.status = API_STATUS.LOADING;
        state.error = null;
      })
      .addCase(signupUser.fulfilled, (state) => {
        state.status = API_STATUS.SUCCESS;
        state.error = null;
      })
      .addCase(signupUser.rejected, (state, action) => {
        state.status = API_STATUS.ERROR;
        state.error = action.payload;
      })
      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        state.status = API_STATUS.IDLE;
        state.error = null;
      })
      // Forgot Password
      .addCase(forgotPassword.pending, (state) => {
        state.status = API_STATUS.LOADING;
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.status = API_STATUS.SUCCESS;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.status = API_STATUS.ERROR;
        state.error = action.payload;
      })
      // Reset Password
      .addCase(resetPassword.pending, (state) => {
        state.status = API_STATUS.LOADING;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.status = API_STATUS.SUCCESS;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.status = API_STATUS.ERROR;
        state.error = action.payload;
      })
      // Verify Email
      .addCase(verifyEmail.pending, (state) => {
        state.status = API_STATUS.LOADING;
        state.error = null;
      })
      .addCase(verifyEmail.fulfilled, (state) => {
        state.status = API_STATUS.SUCCESS;
      })
      .addCase(verifyEmail.rejected, (state, action) => {
        state.status = API_STATUS.ERROR;
        state.error = action.payload;
      })
      // Get Current User
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload;
      });
  }
});

export const { clearError, setCredentials } = authSlice.actions;
export default authSlice.reducer;