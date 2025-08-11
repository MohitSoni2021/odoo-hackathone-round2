import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_ROUTES } from '../api/BACKENDROUTES';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useAuth } from '../hooks/useAuth';

const TripList = () => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { isAuthenticated, token } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchTrips = async () => {
      try {
        setLoading(true);
        const response = await axios.get(API_ROUTES.trips.getAll, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setTrips(response.data.trips);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch trips. Please try again.');
        setLoading(false);
      }
    };

    fetchTrips();
  }, [isAuthenticated, navigate, token]);

  const handleDeleteTrip = async (tripId) => {
    if (window.confirm('Are you sure you want to delete this trip?')) {
      try {
        await axios.delete(API_ROUTES.trips.delete(tripId), {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setTrips(trips.filter(trip => trip._id !== tripId));
      } catch (err) {
        setError('Failed to delete trip. Please try again.');
      }
    }
  };

  const handleViewTrip = (tripId) => {
    navigate(`/trips/${tripId}`);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">My Trips</h1>
        <button 
          onClick={() => navigate('/onboarding/newtrip')} 
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
        >
          Create New Trip
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {trips.length === 0 && !loading ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">No trips found</h2>
          <p className="text-gray-500 mb-6">Start planning your next adventure!</p>
          <button 
            onClick={() => navigate('/onboarding/newtrip')} 
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            Create Your First Trip
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trips.map((trip) => (
            <div key={trip._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              {trip.coverImage ? (
                <img 
                  src={trip.coverImage} 
                  alt={trip.title} 
                  className="w-full h-48 object-cover"
                />
              ) : (
                <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-400">No cover image</span>
                </div>
              )}
              <div className="p-5">
                <h2 className="text-xl font-semibold text-gray-800 mb-2">{trip.title}</h2>
                <p className="text-gray-600 mb-4 line-clamp-2">{trip.description || 'No description provided'}</p>
                <div className="flex items-center text-sm text-gray-500 mb-4">
                  <span className="mr-4">
                    <i className="far fa-calendar mr-1"></i>
                    {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}
                  </span>
                  <span>
                    <i className="fas fa-map-marker-alt mr-1"></i>
                    {trip.stops?.length || 0} stops
                  </span>
                </div>
                <div className="flex justify-between">
                  <button 
                    onClick={() => handleViewTrip(trip._id)} 
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                  >
                    View Details
                  </button>
                  <button 
                    onClick={() => handleDeleteTrip(trip._id)} 
                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TripList;