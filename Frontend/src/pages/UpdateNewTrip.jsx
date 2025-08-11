import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addTrip, addStop, addActivity } from '../features/trips/TripSlice';
// import { addTrip, addStop, addActivity } from './tripSlice';

// Component for creating and managing trip data
const TripForm = () => {
  const dispatch = useDispatch();
  const trips = useSelector((state) => state.trips.trips);

  // State for trip form inputs
  const [tripName, setTripName] = useState('');
  const [tripDescription, setTripDescription] = useState('');
  const [tripStartDate, setTripStartDate] = useState('');
  const [tripEndDate, setTripEndDate] = useState('');

  // State for stop form inputs
  const [selectedTripId, setSelectedTripId] = useState('');
  const [stopName, setStopName] = useState('');
  const [stopDate, setStopDate] = useState('');

  // State for activity form inputs
  const [selectedStopId, setSelectedStopId] = useState('');
  const [activityName, setActivityName] = useState('');
  const [activityCost, setActivityCost] = useState('');
  const [activityDetails, setActivityDetails] = useState('');

  // Handle trip form submission
  const handleAddTrip = (e) => {
    e.preventDefault();
    if (tripName && tripDescription && tripStartDate && tripEndDate) {
      dispatch(addTrip({
        name: tripName,
        description: tripDescription,
        startDate: tripStartDate,
        endDate: tripEndDate,
      }));
      // Reset form
      setTripName('');
      setTripDescription('');
      setTripStartDate('');
      setTripEndDate('');
    }
  };

  // Handle stop form submission
  const handleAddStop = (e) => {
    e.preventDefault();
    if (selectedTripId && stopName && stopDate) {
      dispatch(addStop({
        tripId: Number(selectedTripId),
        stopName,
        stopDate,
      }));
      // Reset form
      setStopName('');
      setStopDate('');
    }
  };

  // Handle activity form submission
  const handleAddActivity = (e) => {
    e.preventDefault();
    if (selectedTripId && selectedStopId && activityName && activityCost) {
      dispatch(addActivity({
        tripId: Number(selectedTripId),
        stopId: Number(selectedStopId),
        activityName,
        cost: Number(activityCost),
        details: activityDetails,
      }));
      // Reset form
      setActivityName('');
      setActivityCost('');
      setActivityDetails('');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-center mb-8">Plan Your Trip</h1>

      {/* Trip Form */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4">Add New Trip</h2>
        <div className="space-y-4">
          <input
            type="text"
            value={tripName}
            onChange={(e) => setTripName(e.target.value)}
            placeholder="Trip Name"
            className="w-full p-2 border rounded-md"
          />
          <textarea
            value={tripDescription}
            onChange={(e) => setTripDescription(e.target.value)}
            placeholder="Trip Description"
            className="w-full p-2 border rounded-md"
          />
          <input
            type="date"
            value={tripStartDate}
            onChange={(e) => setTripStartDate(e.target.value)}
            className="w-full p-2 border rounded-md"
          />
          <input
            type="date"
            value={tripEndDate}
            onChange={(e) => setTripEndDate(e.target.value)}
            className="w-full p-2 border rounded-md"
          />
          <button
            onClick={handleAddTrip}
            className="w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600"
          >
            Add Trip
          </button>
        </div>
      </div>

      {/* Stop Form */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4">Add Stop to Trip</h2>
        <div className="space-y-4">
          <select
            value={selectedTripId}
            onChange={(e) => setSelectedTripId(e.target.value)}
            className="w-full p-2 border rounded-md"
          >
            <option value="">Select a Trip</option>
            {trips.map((trip) => (
              <option key={trip.id} value={trip.id}>
                {trip.name}
              </option>
            ))}
          </select>
          <input
            type="text"
            value={stopName}
            onChange={(e) => setStopName(e.target.value)}
            placeholder="Stop Name"
            className="w-full p-2 border rounded-md"
          />
          <input
            type="date"
            value={stopDate}
            onChange={(e) => setStopDate(e.target.value)}
            className="w-full p-2 border rounded-md"
          />
          <button
            onClick={handleAddStop}
            className="w-full bg-green-500 text-white p-2 rounded-md hover:bg-green-600"
          >
            Add Stop
          </button>
        </div>
      </div>

      {/* Activity Form */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Add Activity to Stop</h2>
        <div className="space-y-4">
          <select
            value={selectedTripId}
            onChange={(e) => {
              setSelectedTripId(e.target.value);
              setSelectedStopId(''); // Reset stop selection when trip changes
            }}
            className="w-full p-2 border rounded-md"
          >
            <option value="">Select a Trip</option>
            {trips.map((trip) => (
              <option key={trip.id} value={trip.id}>
                {trip.name}
              </option>
            ))}
          </select>
          <select
            value={selectedStopId}
            onChange={(e) => setSelectedStopId(e.target.value)}
            className="w-full p-2 border rounded-md"
            disabled={!selectedTripId}
          >
            <option value="">Select a Stop</option>
            {selectedTripId &&
              trips
                .find((trip) => trip.id === Number(selectedTripId))
                ?.stops.map((stop) => (
                  <option key={stop.id} value={stop.id}>
                    {stop.name}
                  </option>
                ))}
          </select>
          <input
            type="text"
            value={activityName}
            onChange={(e) => setActivityName(e.target.value)}
            placeholder="Activity Name"
            className="w-full p-2 border rounded-md"
          />
          <input
            type="number"
            value={activityCost}
            onChange={(e) => setActivityCost(e.target.value)}
            placeholder="Activity Cost"
            className="w-full p-2 border rounded-md"
          />
          <textarea
            value={activityDetails}
            onChange={(e) => setActivityDetails(e.target.value)}
            placeholder="Activity Details"
            className="w-full p-2 border rounded-md"
          />
          <button
            onClick={handleAddActivity}
            className="w-full bg-purple-500 text-white p-2 rounded-md hover:bg-purple-600"
          >
            Add Activity
          </button>
        </div>
      </div>
    </div>
  );
};

export default TripForm;