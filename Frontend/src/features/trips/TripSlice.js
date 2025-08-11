// Importing createSlice from Redux Toolkit to create the slice
import { createSlice } from '@reduxjs/toolkit';

// Initial state for the trip slice
const initialState = {
  trips: [], // Array to store multiple trips
};

// Creating the trip slice with reducers for managing trip data
const tripSlice = createSlice({
  name: 'trips', // Slice name
  initialState,
  reducers: {
    // Reducer to add a new trip
    addTrip: (state, action) => {
      const { name, description, startDate, endDate } = action.payload;
      state.trips.push({
        id: Date.now(), // Unique ID using timestamp
        name,
        description,
        startDate,
        endDate,
        stops: [], // Initialize empty stops array for the trip
      });
    },

    // Reducer to add a stop to a specific trip
    addStop: (state, action) => {
      const { tripId, stopName, stopDate } = action.payload;
      const trip = state.trips.find((trip) => trip.id === tripId);
      if (trip) {
        trip.stops.push({
          id: Date.now(), // Unique ID for the stop
          name: stopName,
          date: stopDate,
          activities: [], // Initialize empty activities array for the stop
        });
      }
    },

    // Reducer to add an activity to a specific stop in a trip
    addActivity: (state, action) => {
      const { tripId, stopId, activityName, cost, details } = action.payload;
      const trip = state.trips.find((trip) => trip.id === tripId);
      if (trip) {
        const stop = trip.stops.find((stop) => stop.id === stopId);
        if (stop) {
          stop.activities.push({
            id: Date.now(), // Unique ID for the activity
            name: activityName,
            cost, // Cost of the activity
            details, // Additional details about the activity
          });
        }
      }
    },

    // Reducer to update a trip's details
    updateTrip: (state, action) => {
      const { tripId, name, description, startDate, endDate } = action.payload;
      const trip = state.trips.find((trip) => trip.id === tripId);
      if (trip) {
        trip.name = name || trip.name;
        trip.description = description || trip.description;
        trip.startDate = startDate || trip.startDate;
        trip.endDate = endDate || trip.endDate;
      }
    },

    // Reducer to delete a trip
    deleteTrip: (state, action) => {
      state.trips = state.trips.filter((trip) => trip.id !== action.payload);
    },

    // Reducer to delete a stop from a trip
    deleteStop: (state, action) => {
      const { tripId, stopId } = action.payload;
      const trip = state.trips.find((trip) => trip.id === tripId);
      if (trip) {
        trip.stops = trip.stops.filter((stop) => stop.id !== stopId);
      }
    },

    // Reducer to delete an activity from a stop
    deleteActivity: (state, action) => {
      const { tripId, stopId, activityId } = action.payload;
      const trip = state.trips.find((trip) => trip.id === tripId);
      if (trip) {
        const stop = trip.stops.find((stop) => stop.id === stopId);
        if (stop) {
          stop.activities = stop.activities.filter(
            (activity) => activity.id !== activityId
          );
        }
      }
    },
  },
});

// Exporting the actions for use in components
export const {
  addTrip,
  addStop,
  addActivity,
  updateTrip,
  deleteTrip,
  deleteStop,
  deleteActivity,
} = tripSlice.actions;

// Exporting the reducer to be used in the store
export default tripSlice.reducer;