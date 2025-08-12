import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import axiosInstance from '../api/axiosInstance';
import { API_ROUTES } from '../api/BACKENDROUTES';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { MapPin, Calendar, Clock, Info, CheckCircle, AlertCircle, Globe } from 'lucide-react';

const CreateStop = () => {
  const [trips, setTrips] = useState([]);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [formData, setFormData] = useState({
    stopName: '',
    stopDesc: '',
    city: '',
    country: '',
    startDate: '',
    endDate: ''
  });
  const [dateError, setDateError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
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
    
    // Validate dates
    if (name === 'startDate' || name === 'endDate') {
      validateDates(name, value);
    }
  };
  
  const validateDates = (fieldName, value) => {
    setDateError('');
    
    if (fieldName === 'startDate') {
      const startDate = new Date(value);
      const endDate = formData.endDate ? new Date(formData.endDate) : null;
      
      // Check if selected trip exists
      if (selectedTrip) {
        const tripStartDate = new Date(selectedTrip.startDate);
        const tripEndDate = new Date(selectedTrip.endDate);
        
        // Validate that stop start date is within trip dates
        if (startDate < tripStartDate) {
          setDateError('Stop start date cannot be before trip start date');
          return;
        }
        
        if (startDate > tripEndDate) {
          setDateError('Stop start date cannot be after trip end date');
          return;
        }
        
        // Check if end date is already set and valid
        if (endDate && endDate <= startDate) {
          setDateError('End date must be after start date');
          return;
        }
      }
    }
    
    if (fieldName === 'endDate') {
      const startDate = formData.startDate ? new Date(formData.startDate) : null;
      const endDate = new Date(value);
      
      if (startDate && endDate <= startDate) {
        setDateError('End date must be after start date');
        return;
      }
      
      // Check if selected trip exists
      if (selectedTrip) {
        const tripEndDate = new Date(selectedTrip.endDate);
        
        // Validate that stop end date is within trip dates
        if (endDate > tripEndDate) {
          setDateError('Stop end date cannot be after trip end date');
          return;
        }
      }
    }
  };
  
  const handleTripSelect = (e) => {
    const tripId = e.target.value;
    if (!tripId) {
      setSelectedTrip(null);
      return;
    }
    
    const trip = trips.find(t => t._id === tripId);
    setSelectedTrip(trip);
    
    // Reset dates when trip changes
    setFormData({
      ...formData,
      startDate: '',
      endDate: ''
    });
    setDateError('');
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!selectedTrip) {
      toast.error('Please select a trip');
      return;
    }
    
    if (!formData.stopName || !formData.city || !formData.country || !formData.startDate || !formData.endDate) {
      toast.error('Please fill all required fields');
      return;
    }
    
    if (dateError) {
      toast.error(dateError);
      return;
    }
    
    setIsSubmitting(true);
    setSubmitError('');
    
    try {
      const response = await axiosInstance.post(API_ROUTES.trips.addStop(selectedTrip._id), {
        city: formData.city,
        country: formData.country,
        startDate: formData.startDate,
        endDate: formData.endDate,
        description: formData.stopDesc,
        name: formData.stopName
      });
      
      toast.success('Stop added successfully!');
      // Redirect to trip details page
      navigate(`/trips/${selectedTrip._id}`);
    } catch (error) {
      console.error('Error adding stop:', error);
      setSubmitError(error.response?.data?.message || 'Failed to add stop. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
        stiffness: 100
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"
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
        className="max-w-md mx-auto bg-white rounded-xl shadow-lg overflow-hidden md:max-w-2xl border border-indigo-100"
        variants={itemVariants}
      >
        <div className="p-8">
          <div className="flex items-center space-x-2 mb-2">
            <MapPin className="h-5 w-5 text-indigo-500" />
            <div className="uppercase tracking-wide text-sm text-indigo-500 font-semibold">Add New Stop</div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Create a Stop for Your Trip</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="tripSelect" className="flex items-center text-sm font-medium text-gray-700 mb-1">
                <Calendar className="h-4 w-4 mr-1 text-indigo-500" />
                Select Trip <span className="text-red-500 ml-1">*</span>
              </label>
              <motion.select
                id="tripSelect"
                value={selectedTrip?._id || ''}
                onChange={handleTripSelect}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 hover:border-indigo-300"
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
            </div>
            
            {selectedTrip && (
              <>
                <div>
                  <label htmlFor="stopName" className="flex items-center text-sm font-medium text-gray-700 mb-1">
                    <Info className="h-4 w-4 mr-1 text-indigo-500" />
                    Stop Name <span className="text-red-500 ml-1">*</span>
                  </label>
                  <motion.input
                    type="text"
                    id="stopName"
                    name="stopName"
                    value={formData.stopName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 hover:border-indigo-300"
                    required
                    whileFocus={{ scale: 1.01 }}
                  />
                </div>
                
                <div>
                  <label htmlFor="city" className="flex items-center text-sm font-medium text-gray-700 mb-1">
                    <MapPin className="h-4 w-4 mr-1 text-indigo-500" />
                    City <span className="text-red-500 ml-1">*</span>
                  </label>
                  <motion.input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 hover:border-indigo-300"
                    required
                    whileFocus={{ scale: 1.01 }}
                  />
                </div>
                
                <div>
                  <label htmlFor="country" className="flex items-center text-sm font-medium text-gray-700 mb-1">
                    <Globe className="h-4 w-4 mr-1 text-indigo-500" />
                    Country <span className="text-red-500 ml-1">*</span>
                  </label>
                  <motion.input
                    type="text"
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 hover:border-indigo-300"
                    required
                    whileFocus={{ scale: 1.01 }}
                  />
                </div>
                
                <div>
                  <label htmlFor="stopDesc" className="flex items-center text-sm font-medium text-gray-700 mb-1">
                    <Info className="h-4 w-4 mr-1 text-indigo-500" />
                    Description
                  </label>
                  <motion.textarea
                    id="stopDesc"
                    name="stopDesc"
                    value={formData.stopDesc}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 hover:border-indigo-300"
                    whileFocus={{ scale: 1.01 }}
                  />
                </div>
                
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="startDate" className="flex items-center text-sm font-medium text-gray-700 mb-1">
                      <Calendar className="h-4 w-4 mr-1 text-indigo-500" />
                      Start Date <span className="text-red-500 ml-1">*</span>
                    </label>
                    <motion.input
                      type="date"
                      id="startDate"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleInputChange}
                      min={selectedTrip ? new Date(selectedTrip.startDate).toISOString().split('T')[0] : ''}
                      max={selectedTrip ? new Date(selectedTrip.endDate).toISOString().split('T')[0] : ''}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 hover:border-indigo-300"
                      required
                      whileFocus={{ scale: 1.01 }}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="endDate" className="flex items-center text-sm font-medium text-gray-700 mb-1">
                      <Clock className="h-4 w-4 mr-1 text-indigo-500" />
                      End Date <span className="text-red-500 ml-1">*</span>
                    </label>
                    <motion.input
                      type="date"
                      id="endDate"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleInputChange}
                      min={formData.startDate || (selectedTrip ? new Date(selectedTrip.startDate).toISOString().split('T')[0] : '')}
                      max={selectedTrip ? new Date(selectedTrip.endDate).toISOString().split('T')[0] : ''}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 hover:border-indigo-300"
                      required
                      whileFocus={{ scale: 1.01 }}
                    />
                  </div>
                </div>
                
                {dateError && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start space-x-2 mt-2 p-2 bg-red-50 border border-red-200 rounded-md"
                  >
                    <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-600">{dateError}</p>
                  </motion.div>
                )}
                
                {submitError && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start space-x-2 mt-2 p-2 bg-red-50 border border-red-200 rounded-md"
                  >
                    <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-600">{submitError}</p>
                  </motion.div>
                )}
                
                <div>
                  <motion.button
                    type="submit"
                    disabled={isSubmitting || dateError}
                    className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-md text-sm font-medium text-white ${isSubmitting || dateError ? 'bg-indigo-300 cursor-not-allowed' : 'bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'}`}
                    whileHover={!isSubmitting && !dateError ? { scale: 1.02, boxShadow: "0 5px 15px rgba(0, 0, 0, 0.1)" } : {}}
                    whileTap={!isSubmitting && !dateError ? { scale: 0.98 } : {}}
                  >
                    {isSubmitting ? (
                      <>
                        <motion.div 
                          className="mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        />
                        Adding Stop...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="mr-2 h-5 w-5" />
                        Add Stop
                      </>
                    )}
                  </motion.button>
                </div>
              </>
            )}
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default CreateStop;