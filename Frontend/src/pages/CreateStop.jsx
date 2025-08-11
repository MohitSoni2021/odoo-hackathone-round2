import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import axiosInstance from '../api/axiosInstance';
import { API_ROUTES } from '../api/BACKENDROUTES';
import toast from 'react-hot-toast';

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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl">
        <div className="p-8">
          <div className="uppercase tracking-wide text-sm text-indigo-500 font-semibold mb-1">Add New Stop</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Create a Stop for Your Trip</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="tripSelect" className="block text-sm font-medium text-gray-700 mb-1">
                Select Trip *
              </label>
              <select
                id="tripSelect"
                value={selectedTrip?._id || ''}
                onChange={handleTripSelect}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              >
                <option value="">Select a trip</option>
                {trips.map((trip) => (
                  <option key={trip._id} value={trip._id}>
                    {trip.title} ({new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()})
                  </option>
                ))}
              </select>
            </div>
            
            {selectedTrip && (
              <>
                <div>
                  <label htmlFor="stopName" className="block text-sm font-medium text-gray-700 mb-1">
                    Stop Name *
                  </label>
                  <input
                    type="text"
                    id="stopName"
                    name="stopName"
                    value={formData.stopName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                    Country *
                  </label>
                  <input
                    type="text"
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="stopDesc" className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    id="stopDesc"
                    name="stopDesc"
                    value={formData.stopDesc}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date *
                    </label>
                    <input
                      type="date"
                      id="startDate"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleInputChange}
                      min={selectedTrip ? new Date(selectedTrip.startDate).toISOString().split('T')[0] : ''}
                      max={selectedTrip ? new Date(selectedTrip.endDate).toISOString().split('T')[0] : ''}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                      End Date *
                    </label>
                    <input
                      type="date"
                      id="endDate"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleInputChange}
                      min={formData.startDate || (selectedTrip ? new Date(selectedTrip.startDate).toISOString().split('T')[0] : '')}
                      max={selectedTrip ? new Date(selectedTrip.endDate).toISOString().split('T')[0] : ''}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>
                </div>
                
                {dateError && (
                  <p className="text-sm text-red-600">{dateError}</p>
                )}
                
                {submitError && (
                  <p className="text-sm text-red-600">{submitError}</p>
                )}
                
                <div>
                  <button
                    type="submit"
                    disabled={isSubmitting || dateError}
                    className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${isSubmitting || dateError ? 'bg-indigo-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'}`}
                  >
                    {isSubmitting ? 'Adding Stop...' : 'Add Stop'}
                  </button>
                </div>
              </>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateStop;