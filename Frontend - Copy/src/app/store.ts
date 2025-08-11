import { configureStore } from '@reduxjs/toolkit';
import authSlice from '../features/auth/AuthSlice';
import tripSlice from '../features/trips/TripSlice';
import profileSlice from '../features/profile/ProfileSlice';
import adminSlice from '../features/admin/AdminSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    trips: tripSlice,
    profile: profileSlice,
    admin: adminSlice
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST']
      }
    })
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;