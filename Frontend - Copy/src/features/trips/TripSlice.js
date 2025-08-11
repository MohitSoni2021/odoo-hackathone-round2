import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';
import { API_ROUTES } from '../../api/BACKENDROUTES';
import { API_STATUS } from '../../utils/constants';
import toast from 'react-hot-toast';

// Async thunks
export const fetchTrips = createAsyncThunk(
  'trips/fetchTrips',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(API_ROUTES.trips.getAll);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch trips');
    }
  }
);

export const fetchTripById = createAsyncThunk(
  'trips/fetchTripById',
  async (tripId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(API_ROUTES.trips.getById(tripId));
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch trip');
    }
  }
);

export const createTrip = createAsyncThunk(
  'trips/createTrip',
  async (tripData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(API_ROUTES.trips.create, tripData);
      toast.success('Trip created successfully!');
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create trip');
      return rejectWithValue(error.response?.data?.message || 'Failed to create trip');
    }
  }
);

export const updateTrip = createAsyncThunk(
  'trips/updateTrip',
  async ({ tripId, tripData }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(API_ROUTES.trips.update(tripId), tripData);
      toast.success('Trip updated successfully!');
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update trip');
      return rejectWithValue(error.response?.data?.message || 'Failed to update trip');
    }
  }
);

export const deleteTrip = createAsyncThunk(
  'trips/deleteTrip',
  async (tripId, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(API_ROUTES.trips.delete(tripId));
      toast.success('Trip deleted successfully!');
      return tripId;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete trip');
      return rejectWithValue(error.response?.data?.message || 'Failed to delete trip');
    }
  }
);

export const addStop = createAsyncThunk(
  'trips/addStop',
  async ({ tripId, stopData }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(API_ROUTES.trips.addStop(tripId), stopData);
      toast.success('Stop added successfully!');
      return { tripId, stop: response.data };
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add stop');
      return rejectWithValue(error.response?.data?.message || 'Failed to add stop');
    }
  }
);

export const updateStop = createAsyncThunk(
  'trips/updateStop',
  async ({ tripId, stopId, stopData }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(API_ROUTES.trips.updateStop(tripId, stopId), stopData);
      toast.success('Stop updated successfully!');
      return { tripId, stopId, stop: response.data };
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update stop');
      return rejectWithValue(error.response?.data?.message || 'Failed to update stop');
    }
  }
);

export const deleteStop = createAsyncThunk(
  'trips/deleteStop',
  async ({ tripId, stopId }, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(API_ROUTES.trips.deleteStop(tripId, stopId));
      toast.success('Stop deleted successfully!');
      return { tripId, stopId };
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete stop');
      return rejectWithValue(error.response?.data?.message || 'Failed to delete stop');
    }
  }
);

export const addActivity = createAsyncThunk(
  'trips/addActivity',
  async ({ tripId, stopId, activityData }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        API_ROUTES.trips.addActivity(tripId, stopId),
        activityData
      );
      toast.success('Activity added successfully!');
      return { tripId, stopId, activity: response.data };
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add activity');
      return rejectWithValue(error.response?.data?.message || 'Failed to add activity');
    }
  }
);

export const shareTrip = createAsyncThunk(
  'trips/shareTrip',
  async (tripId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(API_ROUTES.trips.share(tripId));
      toast.success('Trip share link generated!');
      return { tripId, shareData: response.data };
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to share trip');
      return rejectWithValue(error.response?.data?.message || 'Failed to share trip');
    }
  }
);

export const fetchPublicTrip = createAsyncThunk(
  'trips/fetchPublicTrip',
  async (publicId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(API_ROUTES.public.view(publicId));
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch public trip');
    }
  }
);

const initialState = {
  trips: [],
  currentTrip: null,
  publicTrip: null,
  status: API_STATUS.IDLE,
  createStatus: API_STATUS.IDLE,
  deleteStatus: API_STATUS.IDLE,
  shareStatus: API_STATUS.IDLE,
  error: null
};

const tripSlice = createSlice({
  name: 'trips',
  initialState,
  reducers: {
    clearCurrentTrip: (state) => {
      state.currentTrip = null;
    },
    clearPublicTrip: (state) => {
      state.publicTrip = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    setCurrentTrip: (state, action) => {
      state.currentTrip = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch trips
      .addCase(fetchTrips.pending, (state) => {
        state.status = API_STATUS.LOADING;
      })
      .addCase(fetchTrips.fulfilled, (state, action) => {
        state.status = API_STATUS.SUCCESS;
        state.trips = action.payload;
        state.error = null;
      })
      .addCase(fetchTrips.rejected, (state, action) => {
        state.status = API_STATUS.ERROR;
        state.error = action.payload;
      })
      // Fetch trip by ID
      .addCase(fetchTripById.pending, (state) => {
        state.status = API_STATUS.LOADING;
      })
      .addCase(fetchTripById.fulfilled, (state, action) => {
        state.status = API_STATUS.SUCCESS;
        state.currentTrip = action.payload;
        state.error = null;
      })
      .addCase(fetchTripById.rejected, (state, action) => {
        state.status = API_STATUS.ERROR;
        state.error = action.payload;
      })
      // Create trip
      .addCase(createTrip.pending, (state) => {
        state.createStatus = API_STATUS.LOADING;
      })
      .addCase(createTrip.fulfilled, (state, action) => {
        state.createStatus = API_STATUS.SUCCESS;
        state.trips.push(action.payload);
        state.currentTrip = action.payload;
        state.error = null;
      })
      .addCase(createTrip.rejected, (state, action) => {
        state.createStatus = API_STATUS.ERROR;
        state.error = action.payload;
      })
      // Update trip
      .addCase(updateTrip.fulfilled, (state, action) => {
        const index = state.trips.findIndex(trip => trip.id === action.payload.id);
        if (index !== -1) {
          state.trips[index] = action.payload;
        }
        if (state.currentTrip?.id === action.payload.id) {
          state.currentTrip = action.payload;
        }
      })
      // Delete trip
      .addCase(deleteTrip.pending, (state) => {
        state.deleteStatus = API_STATUS.LOADING;
      })
      .addCase(deleteTrip.fulfilled, (state, action) => {
        state.deleteStatus = API_STATUS.SUCCESS;
        state.trips = state.trips.filter(trip => trip.id !== action.payload);
        if (state.currentTrip?.id === action.payload) {
          state.currentTrip = null;
        }
      })
      .addCase(deleteTrip.rejected, (state, action) => {
        state.deleteStatus = API_STATUS.ERROR;
        state.error = action.payload;
      })
      // Share trip
      .addCase(shareTrip.pending, (state) => {
        state.shareStatus = API_STATUS.LOADING;
      })
      .addCase(shareTrip.fulfilled, (state, action) => {
        state.shareStatus = API_STATUS.SUCCESS;
        const { tripId, shareData } = action.payload;
        const tripIndex = state.trips.findIndex(trip => trip.id === tripId);
        if (tripIndex !== -1) {
          state.trips[tripIndex] = { ...state.trips[tripIndex], ...shareData };
        }
        if (state.currentTrip?.id === tripId) {
          state.currentTrip = { ...state.currentTrip, ...shareData };
        }
      })
      .addCase(shareTrip.rejected, (state, action) => {
        state.shareStatus = API_STATUS.ERROR;
        state.error = action.payload;
      })
      // Fetch public trip
      .addCase(fetchPublicTrip.pending, (state) => {
        state.status = API_STATUS.LOADING;
      })
      .addCase(fetchPublicTrip.fulfilled, (state, action) => {
        state.status = API_STATUS.SUCCESS;
        state.publicTrip = action.payload;
      })
      .addCase(fetchPublicTrip.rejected, (state, action) => {
        state.status = API_STATUS.ERROR;
        state.error = action.payload;
      });
  }
});

export const { clearCurrentTrip, clearPublicTrip, clearError, setCurrentTrip } = tripSlice.actions;
export default tripSlice.reducer;