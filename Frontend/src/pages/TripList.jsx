import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_ROUTES } from '../api/BACKENDROUTES';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useAuth } from '../hooks/useAuth';
import { motion } from 'framer-motion';
import { FaCalendarAlt, FaMapMarkerAlt, FaPlus, FaEye, FaTrash } from 'react-icons/fa';

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
    <div className="max-w-7xl mx-auto p-6 bg-gradient-to-b  min-h-screen">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex justify-between items-center mb-8"
      >
        <h1 className="text-4xl font-bold text-gray-800 relative">
          My Trips
          <span className="absolute bottom-0 left-0 w-1/3 h-1 bg-blue-500 rounded-full"></span>
        </h1>
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/onboarding/newtrip')} 
          className="bg-gradient-to-r from-green-500 to-green-600 text-white px-5 py-2.5 rounded-lg shadow-md hover:shadow-lg flex items-center gap-2 transition-all"
        >
          <FaPlus /> Create New Trip
        </motion.button>
      </motion.div>

      {error && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-r mb-6 shadow-sm"
        >
          {error}
        </motion.div>
      )}

      {trips.length === 0 && !loading ? (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100"
        >
          <img 
            src="https://cdn-icons-png.flaticon.com/512/5720/5720434.png" 
            alt="No trips" 
            className="w-32 h-32 mx-auto mb-6 opacity-70"
          />
          <h2 className="text-2xl font-semibold text-gray-700 mb-3">No trips found</h2>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">Your adventure awaits! Start planning your next journey and create unforgettable memories.</p>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/onboarding/newtrip')} 
            className="bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-3 rounded-lg shadow-md hover:shadow-lg flex items-center gap-2 mx-auto"
          >
            <FaPlus /> Create Your First Trip
          </motion.button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {trips.map((trip, index) => (
            <motion.div 
              key={trip._id} 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100 group"
            >
              <div className="relative">
                {trip.coverImage ? (
                  <img 
                    src={trip.coverImage} 
                    alt={trip.title} 
                    className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-56 bg-gradient-to-r from-blue-100 to-indigo-100 flex items-center justify-center">
                    <span className="text-gray-500 font-medium">No cover image</span>
                  </div>
                )}
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium text-gray-700 shadow-sm">
                  {new Date(trip.startDate).toLocaleDateString('en-US', {month: 'short', day: 'numeric'})} - {new Date(trip.endDate).toLocaleDateString('en-US', {month: 'short', day: 'numeric'})}
                </div>
              </div>
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">{trip.title}</h2>
                <p className="text-gray-600 mb-5 line-clamp-2">{trip.description || 'No description provided'}</p>
                <div className="flex items-center text-sm text-gray-500 mb-5 space-x-4">
                  <div className="flex items-center">
                    <FaCalendarAlt className="mr-2 text-blue-500" />
                    <span>{Math.ceil((new Date(trip.endDate) - new Date(trip.startDate)) / (1000 * 60 * 60 * 24))} days</span>
                  </div>
                  <div className="flex items-center">
                    <FaMapMarkerAlt className="mr-2 text-red-500" />
                    <span>{trip.stops?.length || 0} stops</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleViewTrip(trip._id)} 
                    className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-all flex items-center gap-2"
                  >
                    <FaEye /> View Details
                  </motion.button>
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleDeleteTrip(trip._id)} 
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2 rounded-full transition-colors"
                  >
                    <FaTrash />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TripList;