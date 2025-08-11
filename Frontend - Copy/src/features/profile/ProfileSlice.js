import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';
import { API_ROUTES } from '../../api/BACKENDROUTES';
import { API_STATUS } from '../../utils/constants';
import toast from 'react-hot-toast';

export const updateProfile = createAsyncThunk(
  'profile/updateProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(API_ROUTES.users.updateProfile, profileData);
      toast.success('Profile updated successfully!');
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
      return rejectWithValue(error.response?.data?.message || 'Failed to update profile');
    }
  }
);

export const uploadAvatar = createAsyncThunk(
  'profile/uploadAvatar',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(API_ROUTES.users.uploadAvatar, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      toast.success('Avatar updated successfully!');
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to upload avatar');
      return rejectWithValue(error.response?.data?.message || 'Failed to upload avatar');
    }
  }
);

const initialState = {
  status: API_STATUS.IDLE,
  uploadStatus: API_STATUS.IDLE,
  error: null
};

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Update profile
      .addCase(updateProfile.pending, (state) => {
        state.status = API_STATUS.LOADING;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state) => {
        state.status = API_STATUS.SUCCESS;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.status = API_STATUS.ERROR;
        state.error = action.payload;
      })
      // Upload avatar
      .addCase(uploadAvatar.pending, (state) => {
        state.uploadStatus = API_STATUS.LOADING;
        state.error = null;
      })
      .addCase(uploadAvatar.fulfilled, (state) => {
        state.uploadStatus = API_STATUS.SUCCESS;
      })
      .addCase(uploadAvatar.rejected, (state, action) => {
        state.uploadStatus = API_STATUS.ERROR;
        state.error = action.payload;
      });
  }
});

export const { clearError } = profileSlice.actions;
export default profileSlice.reducer;