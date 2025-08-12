import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import axiosInstance from '../api/axiosInstance';
import { API_ROUTES } from '../api/BACKENDROUTES';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Clock, Tag, DollarSign, FileText, Link as LinkIcon, PlusCircle, CheckCircle } from 'lucide-react';

const CreateActivity = () => {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10
      }
    }
  };
  const [trips, setTrips] = useState([]);
  const [stops, setStops] = useState([]);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [selectedStop, setSelectedStop] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    type: 'sightseeing',
    cost: '',
    duration: '',
    notes: '',
    providerUrl: 'http://example.com'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [activities, setActivities] = useState([]);
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Redirect if not authenticated
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    // Fetch user's trips
    const fetchTrips = async () => {
      try {
        const response = await axiosInstance.get(API_ROUTES.trips.getAll);
        setTrips(response.data.trips);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching trips:', error);
        toast.error('Failed to load trips. Please try again.');
        setIsLoading(false);
      }
    };
    
    fetchTrips();
  }, [isAuthenticated, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleTripSelect = async (e) => {
    const tripId = e.target.value;
    if (!tripId) {
      setSelectedTrip(null);
      setSelectedStop(null);
      setStops([]);
      return;
    }
    
    const trip = trips.find(t => t._id === tripId);
    setSelectedTrip(trip);
    
    // Fetch stops for this trip
    try {
      const response = await axiosInstance.get(API_ROUTES.trips.getById(tripId));
      setStops(response.data.trip.stops || []);
    } catch (error) {
      console.error('Error fetching stops:', error);
      toast.error('Failed to load stops. Please try again.');
    }
  };

  const handleStopSelect = (e) => {
    const stopId = e.target.value;
    if (!stopId) {
      setSelectedStop(null);
      return;
    }
    
    const stop = stops.find(s => s._id === stopId);
    setSelectedStop(stop);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!selectedTrip) {
      toast.error('Please select a trip');
      return;
    }
    
    if (!selectedStop) {
      toast.error('Please select a stop');
      return;
    }
    
    if (!formData.title || !formData.type) {
      toast.error('Please fill all required fields');
      return;
    }
    
    // Note: providerUrl is optional and doesn't need validation
    
    setIsSubmitting(true);
    setSubmitError('');
    
    try {
      const response = await axiosInstance.post(
        API_ROUTES.trips.addActivity(selectedTrip._id, selectedStop._id), 
        {
          title: formData.title,
          type: formData.type,
          cost: formData.cost ? parseFloat(formData.cost) : 0,
          duration: formData.duration,
          notes: formData.notes,
          providerUrl: formData.providerUrl
        }
      );
      
      // Add the new activity to the list
      setActivities([...activities, response.data.activity]);
      
      // Reset form for next activity
      setFormData({
        title: '',
        type: 'sightseeing',
        cost: '',
        duration: '',
        notes: '',
        providerUrl: ''
      });
      
      toast.success('Activity added successfully!');
    } catch (error) {
      console.error('Error adding activity:', error);
      setSubmitError(error.response?.data?.message || 'Failed to add activity. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFinish = () => {
    // Redirect to trip details page
    navigate(`/trips/${selectedTrip._id}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <motion.div 
          className="rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  }

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.div 
        className="max-w-md mx-auto bg-white rounded-xl shadow-lg overflow-hidden md:max-w-2xl border border-blue-100"
        variants={itemVariants}
      >
        <div className="p-8">
          <motion.div 
            className="flex items-center space-x-2 mb-2"
            variants={itemVariants}
          >
            <PlusCircle className="h-5 w-5 text-indigo-500" />
            <div className="uppercase tracking-wide text-sm text-indigo-500 font-semibold">Add New Activity</div>
          </motion.div>
          <motion.h2 
            className="text-2xl font-bold text-gray-900 mb-6 bg-gradient-to-r from-indigo-600 to-blue-500 bg-clip-text text-transparent"
            variants={itemVariants}
          >
            Create Activities for Your Stop
          </motion.h2>
          
          <motion.form 
            onSubmit={handleSubmit} 
            className="space-y-6"
            variants={containerVariants}
          >
            <motion.div variants={itemVariants}>
              <label htmlFor="tripSelect" className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <Calendar className="h-4 w-4 mr-2 text-indigo-500" />
                Select Trip <span className="text-red-500 ml-1">*</span>
              </label>
              <motion.select
                id="tripSelect"
                value={selectedTrip?._id || ''}
                onChange={handleTripSelect}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 hover:border-indigo-300"
                required
                whileFocus={{ scale: 1.01 }}
              >
                <option value="">Select a trip</option>
                {trips.map((trip) => (
                  <option key={trip._id} value={trip._id}>
                    {trip.title} ({new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()})
                  </option>
                ))}
              </motion.select>
            </motion.div>
            
            {selectedTrip && (
              <motion.div 
                variants={itemVariants}
                initial="hidden"
                animate="visible"
              >
                <label htmlFor="stopSelect" className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="h-4 w-4 mr-2 text-indigo-500" />
                  Select Stop <span className="text-red-500 ml-1">*</span>
                </label>
                <motion.select
                  id="stopSelect"
                  value={selectedStop?._id || ''}
                  onChange={handleStopSelect}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 hover:border-indigo-300"
                  required
                  whileFocus={{ scale: 1.01 }}
                >
                  <option value="">Select a stop</option>
                  {stops.map((stop) => (
                    <option key={stop._id} value={stop._id}>
                      {stop.name || `${stop.city}, ${stop.country}`} ({new Date(stop.startDate).toLocaleDateString()} - {new Date(stop.endDate).toLocaleDateString()})
                    </option>
                  ))}
                </motion.select>
              </motion.div>
            )}
            
            {selectedStop && (
              <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-6"
              >
                <motion.div variants={itemVariants}>
                  <label htmlFor="title" className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    <Tag className="h-4 w-4 mr-2 text-indigo-500" />
                    Activity Title <span className="text-red-500 ml-1">*</span>
                  </label>
                  <motion.input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                    required
                    whileFocus={{ scale: 1.01 }}
                  />
                </motion.div>
                
                <motion.div variants={itemVariants}>
                  <label htmlFor="type" className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    <Tag className="h-4 w-4 mr-2 text-indigo-500" />
                    Activity Type <span className="text-red-500 ml-1">*</span>
                  </label>
                  <motion.select
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 hover:border-indigo-300"
                    required
                    whileFocus={{ scale: 1.01 }}
                  >
                    <option value="sightseeing">Sightseeing</option>
                    <option value="transport">Transport</option>
                    <option value="stay">Stay</option>
                    <option value="food">Food</option>
                    <option value="other">Other</option>
                  </motion.select>
                </motion.div>
                
                <motion.div variants={itemVariants}>
                  <label htmlFor="cost" className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    <DollarSign className="h-4 w-4 mr-2 text-indigo-500" />
                    Cost (Optional)
                  </label>
                  <motion.input
                    type="number"
                    id="cost"
                    name="cost"
                    value={formData.cost}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                    whileFocus={{ scale: 1.01 }}
                  />
                </motion.div>
                
                <motion.div variants={itemVariants}>
                  <label htmlFor="duration" className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    <Clock className="h-4 w-4 mr-2 text-indigo-500" />
                    Duration (Optional)
                  </label>
                  <motion.input
                    type="text"
                    id="duration"
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    placeholder="e.g., 2 hours, Half day"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                    whileFocus={{ scale: 1.01 }}
                  />
                </motion.div>
                
                <motion.div variants={itemVariants}>
                  <label htmlFor="notes" className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    <FileText className="h-4 w-4 mr-2 text-indigo-500" />
                    Notes (Optional)
                  </label>
                  <motion.textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                    whileFocus={{ scale: 1.01 }}
                  />
                </motion.div>
                
                <motion.div variants={itemVariants}>
                  <label htmlFor="providerUrl" className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    <LinkIcon className="h-4 w-4 mr-2 text-indigo-500" />
                    Provider URL (Optional)
                  </label>
                  <motion.input
                    type="url"
                    id="providerUrl"
                    name="providerUrl"
                    value={formData.providerUrl}
                    onChange={handleInputChange}
                    placeholder="https://example.com"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                    whileFocus={{ scale: 1.01 }}
                  />
                </motion.div>
                
                {submitError && (
                  <motion.p 
                    className="text-sm text-red-600 p-3 bg-red-50 border border-red-100 rounded-lg flex items-center"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {submitError}
                  </motion.p>
                )}
                
                <motion.div className="flex space-x-4" variants={itemVariants}>
                  <motion.button
                    type="submit"
                    disabled={isSubmitting}
                    className={`flex-1 py-3 px-4 border border-transparent rounded-lg shadow-md text-sm font-medium text-white flex items-center justify-center space-x-2 ${isSubmitting ? 'bg-indigo-300 cursor-not-allowed' : 'bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-700 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'}`}
                    whileHover={!isSubmitting ? { scale: 1.03, transition: { duration: 0.2 } } : {}}
                    whileTap={!isSubmitting ? { scale: 0.97 } : {}}
                  >
                    {isSubmitting ? (
                      <>
                        <motion.div 
                          className="h-4 w-4 border-2 border-white border-t-transparent rounded-full"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        />
                        <span>Adding Activity...</span>
                      </>
                    ) : (
                      <>
                        <PlusCircle className="h-4 w-4" />
                        <span>Add Activity</span>
                      </>
                    )}
                  </motion.button>
                  
                  <motion.button
                    type="button"
                    onClick={handleFinish}
                    className="flex-1 py-3 px-4 border border-gray-300 rounded-lg shadow-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center justify-center space-x-2"
                    whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <CheckCircle className="h-4 w-4" />
                    <span>Finish</span>
                  </motion.button>
                </motion.div>
              </motion.div>
            )}
          </motion.form>
          
          {/* Display added activities */}
          {activities.length > 0 && (
            <motion.div 
              className="mt-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <motion.div className="flex items-center space-x-2 mb-4">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <h3 className="text-lg font-medium text-gray-900">Added Activities</h3>
              </motion.div>
              
              <ul className="space-y-3">
                {activities.map((activity, index) => (
                  <motion.li 
                    key={index} 
                    className="p-4 bg-white border border-gray-100 rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-base font-medium text-gray-900">{activity.title}</p>
                        <div className="flex items-center mt-1">
                          <Tag className="h-3 w-3 text-indigo-500 mr-1" />
                          <p className="text-sm text-gray-500">{activity.type}</p>
                        </div>
                        {activity.duration && (
                          <div className="flex items-center mt-1">
                            <Clock className="h-3 w-3 text-gray-400 mr-1" />
                            <p className="text-xs text-gray-500">{activity.duration}</p>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col items-end">
                        <p className={`text-sm font-medium ${activity.cost ? 'text-indigo-600' : 'text-green-500'} bg-gray-50 px-3 py-1 rounded-full`}>
                          {activity.cost ? `Rs.${parseFloat(activity.cost).toFixed(2)}` : 'Free'}
                        </p>
                      </div>
                    </div>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default CreateActivity;