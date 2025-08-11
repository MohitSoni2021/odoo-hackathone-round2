import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import axiosInstance from '../api/axiosInstance';
import { API_ROUTES } from '../api/BACKENDROUTES';
import toast from 'react-hot-toast';

const CreateActivity = () => {
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl">
        <div className="p-8">
          <div className="uppercase tracking-wide text-sm text-indigo-500 font-semibold mb-1">Add New Activity</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Create Activities for Your Stop</h2>
          
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
              <div>
                <label htmlFor="stopSelect" className="block text-sm font-medium text-gray-700 mb-1">
                  Select Stop *
                </label>
                <select
                  id="stopSelect"
                  value={selectedStop?._id || ''}
                  onChange={handleStopSelect}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  required
                >
                  <option value="">Select a stop</option>
                  {stops.map((stop) => (
                    <option key={stop._id} value={stop._id}>
                      {stop.name || `${stop.city}, ${stop.country}`} ({new Date(stop.startDate).toLocaleDateString()} - {new Date(stop.endDate).toLocaleDateString()})
                    </option>
                  ))}
                </select>
              </div>
            )}
            
            {selectedStop && (
              <>
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                    Activity Title *
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                    Activity Type *
                  </label>
                  <select
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  >
                    <option value="sightseeing">Sightseeing</option>
                    <option value="transport">Transport</option>
                    <option value="stay">Stay</option>
                    <option value="food">Food</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="cost" className="block text-sm font-medium text-gray-700 mb-1">
                    Cost (Optional)
                  </label>
                  <input
                    type="number"
                    id="cost"
                    name="cost"
                    value={formData.cost}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
                    Duration (Optional)
                  </label>
                  <input
                    type="text"
                    id="duration"
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    placeholder="e.g., 2 hours, Half day"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                    Notes (Optional)
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="providerUrl" className="block text-sm font-medium text-gray-700 mb-1">
                    Provider URL (Optional)
                  </label>
                  <input
                    type="url"
                    id="providerUrl"
                    name="providerUrl"
                    value={formData.providerUrl}
                    onChange={handleInputChange}
                    placeholder="https://example.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                
                {submitError && (
                  <p className="text-sm text-red-600">{submitError}</p>
                )}
                
                <div className="flex space-x-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${isSubmitting ? 'bg-indigo-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'}`}
                  >
                    {isSubmitting ? 'Adding Activity...' : 'Add Activity'}
                  </button>
                  
                  <button
                    type="button"
                    onClick={handleFinish}
                    className="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Finish
                  </button>
                </div>
              </>
            )}
          </form>
          
          {/* Display added activities */}
          {activities.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Added Activities</h3>
              <ul className="divide-y divide-gray-200">
                {activities.map((activity, index) => (
                  <li key={index} className="py-4">
                    <div className="flex justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                        <p className="text-sm text-gray-500">{activity.type}</p>
                      </div>
                      <p className="text-sm font-medium text-gray-900">
                        {activity.cost ? `$${parseFloat(activity.cost).toFixed(2)}` : 'Free'}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateActivity;