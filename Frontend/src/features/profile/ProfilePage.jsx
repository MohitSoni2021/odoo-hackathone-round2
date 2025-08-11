import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { User, Mail, Phone, MapPin, Calendar, Edit, Upload, X, Check, Clock, TrendingUp, Map, DollarSign } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { updateProfile, uploadAvatar } from './ProfileSlice';
import { API_STATUS } from '../../utils/constants';
import axiosInstance from '../../api/axiosInstance';
import { API_ROUTES } from '../../api/BACKENDROUTES';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Card from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const schema = yup.object({
  name: yup.string().required('Name is required'),
  phone: yup.string().notRequired(),
  country: yup.string().notRequired(),
  city: yup.string().notRequired(),
});

const ProfilePage = () => {
  const { user, isAuthenticated, updateUserData } = useAuth();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { status, uploadStatus, error: profileError } = useSelector((state) => state.profile);
  
  const [isEditing, setIsEditing] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [upcomingTrips, setUpcomingTrips] = useState([]);
  const [pastTrips, setPastTrips] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [tripsLoading, setTripsLoading] = useState(true);
  const [connectionError, setConnectionError] = useState(false);

  // Remove debug logging in production code

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: user?.name || '',
      phone: user?.phone || '',
      country: user?.country || '',
      city: user?.city || '',
    },
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // Reset form with user data when user changes
    if (user) {
      reset({
        name: user.name || '',
        phone: user.phone || '',
        country: user.country || '',
        city: user.city || '',
      });
      
      // Only fetch data when user is available
      fetchUserStats();
      fetchUserTrips();
    }
  }, [isAuthenticated, navigate, reset, user]);

  const fetchUserStats = async () => {
    try {
      setStatsLoading(true);
      setConnectionError(false);
      
      // Make sure the API endpoint is properly defined
      const statsEndpoint = API_ROUTES.users?.stats || '/api/v1/users/stats';
      
      const response = await axiosInstance.get(statsEndpoint);
      
      // Check if response data has the expected structure
      if (response.data && response.data.stats) {
        setUserStats(response.data.stats);
      } else if (response.data) {
        // Handle case where stats might be directly in the response data
        setUserStats(response.data);
      } else {
        throw new Error('Unexpected response format');
      }
    } catch (error) {
      console.error('Error fetching user stats:', error);
      // Don't show toast on page load to avoid overwhelming the user
      if (!statsLoading) {
        toast.error('Failed to load user statistics');
      }
      setConnectionError(true);
      
      // Provide fallback data when the API fails
      setUserStats({
        totalTrips: 0,
        totalStops: 0,
        totalCountries: 0,
        totalCities: 0,
        totalBudget: 0,
        avgTripDuration: 0
      });
    } finally {
      setStatsLoading(false);
      setIsLoading(false);
    }
  };

  const fetchUserTrips = async () => {
    try {
      setTripsLoading(true);
      setConnectionError(false);
      
      // Make sure the API endpoint is properly defined
      const tripsEndpoint = API_ROUTES.trips?.getAll || '/api/v1/trips';
      
      const response = await axiosInstance.get(tripsEndpoint);
      
      // Check if response data exists
      if (!response.data) {
        throw new Error('Unexpected response format');
      }
      
      // Handle different response structures
      const allTrips = response.data.trips || response.data || [];
      const today = new Date();
      
      // Split trips into upcoming and past
      const upcoming = allTrips.filter(trip => new Date(trip.startDate) > today);
      const past = allTrips.filter(trip => new Date(trip.endDate) < today);
      
      // Sort upcoming trips by start date (ascending)
      upcoming.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
      
      // Sort past trips by end date (descending)
      past.sort((a, b) => new Date(b.endDate) - new Date(a.endDate));
      
      setUpcomingTrips(upcoming);
      setPastTrips(past);
    } catch (error) {
      console.error('Error fetching user trips:', error);
      // Don't show toast on page load to avoid overwhelming the user
      if (!tripsLoading) {
        toast.error('Failed to load trip history');
      }
      setConnectionError(true);
      
      // Set empty arrays as fallback
      setUpcomingTrips([]);
      setPastTrips([]);
    } finally {
      setTripsLoading(false);
      setIsLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      const result = await dispatch(updateProfile(data));
      if (!result.error) {
        setIsEditing(false);
        // Update user data in auth context
        updateUserData({
          ...user,
          ...data
        });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile) return;

    const formData = new FormData();
    formData.append('avatar', avatarFile);

    try {
      const result = await dispatch(uploadAvatar(formData));
      if (!result.error) {
        // Update user data with new avatar URL
        // Handle different response structures
        const avatarUrl = result.payload?.user?.avatarUrl || result.payload?.avatarUrl;
        if (avatarUrl) {
          updateUserData({
            ...user,
            avatarUrl
          });
        }
        setAvatarFile(null);
        setAvatarPreview(null);
      }
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error('Failed to upload avatar');
    }
  };

  const cancelAvatarUpload = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
      const options = { year: 'numeric', month: 'short', day: 'numeric' };
      return new Date(dateString).toLocaleDateString(undefined, options);
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Profile Settings</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Information */}
        <div className="lg:col-span-1">
          <Card className="mb-8">
            <div className="flex flex-col items-center pb-6">
              <div className="relative mb-4">
                {avatarPreview || user?.avatarUrl ? (
                  <img
                    src={avatarPreview || user?.avatarUrl}
                    alt={user?.name || 'User'}
                    className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-md"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-blue-100 flex items-center justify-center">
                    <User size={48} className="text-blue-500" />
                  </div>
                )}
                
                {!avatarFile && (
                  <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 bg-blue-500 p-2 rounded-full cursor-pointer hover:bg-blue-600 transition-colors">
                    <Upload size={16} className="text-white" />
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarChange}
                    />
                  </label>
                )}
              </div>
              
              {avatarFile && (
                <div className="flex space-x-2 mt-2">
                  <Button
                    size="sm"
                    variant="success"
                    onClick={handleAvatarUpload}
                    loading={uploadStatus === API_STATUS.LOADING}
                    icon={<Check size={16} />}
                  >
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={cancelAvatarUpload}
                    icon={<X size={16} />}
                  >
                    Cancel
                  </Button>
                </div>
              )}
              
              <h2 className="text-2xl font-semibold mt-4">{user?.name || 'User'}</h2>
              <p className="text-gray-600">{user?.email || 'No email available'}</p>
              
              {user?.phone && (
                <div className="flex items-center mt-2 text-gray-600">
                  <Phone size={16} className="mr-2" />
                  <span>{user.phone}</span>
                </div>
              )}
              
              {(user?.city || user?.country) && (
                <div className="flex items-center mt-2 text-gray-600">
                  <MapPin size={16} className="mr-2" />
                  <span>{[user.city, user.country].filter(Boolean).join(', ')}</span>
                </div>
              )}
            </div>
            
            {!isEditing ? (
              <Button
                variant="outline"
                className="w-full mt-4"
                onClick={() => setIsEditing(true)}
                icon={<Edit size={16} />}
              >
                Edit Profile
              </Button>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="mt-6">
                <div className="space-y-4">
                  <Input
                    label="Full Name"
                    {...register('name')}
                    error={errors.name?.message}
                    icon={<User size={18} />}
                  />
                  
                  <Input
                    label="Phone Number"
                    {...register('phone')}
                    error={errors.phone?.message}
                    icon={<Phone size={18} />}
                  />
                  
                  <Input
                    label="Country"
                    {...register('country')}
                    error={errors.country?.message}
                    icon={<MapPin size={18} />}
                  />
                  
                  <Input
                    label="City"
                    {...register('city')}
                    error={errors.city?.message}
                    icon={<MapPin size={18} />}
                  />
                </div>
                
                <div className="flex space-x-2 mt-6">
                  <Button
                    type="submit"
                    variant="primary"
                    className="flex-1"
                    loading={status === API_STATUS.LOADING}
                  >
                    Save Changes
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setIsEditing(false);
                      reset({
                        name: user?.name || '',
                        phone: user?.phone || '',
                        country: user?.country || '',
                        city: user?.city || '',
                      });
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            )}
          </Card>
        </div>
        
        {/* Travel Stats and Trip History */}
        <div className="lg:col-span-2">
          {/* Travel Stats */}
          <Card className="mb-8">
            <h2 className="text-xl font-semibold mb-6 flex items-center">
              <TrendingUp size={20} className="mr-2 text-blue-500" />
              Travel Analytics
            </h2>
            
            {statsLoading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner size="md" />
              </div>
            ) : connectionError ? (
              <div className="text-center py-8">
                <div className="bg-red-50 p-4 rounded-lg mb-4">
                  <p className="text-red-600 font-medium">Unable to connect to the server</p>
                  <p className="text-gray-600 text-sm mt-2">We're having trouble connecting to the backend server. Your data is displayed with default values.</p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={fetchUserStats}
                  className="mt-2"
                >
                  Try Again
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-blue-500 mb-2 flex items-center">
                    <Map size={18} className="mr-2" />
                    <span className="font-medium">Total Trips</span>
                  </div>
                  <div className="text-2xl font-bold">{userStats?.totalTrips || 0}</div>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-green-500 mb-2 flex items-center">
                    <MapPin size={18} className="mr-2" />
                    <span className="font-medium">Destinations</span>
                  </div>
                  <div className="text-2xl font-bold">{userStats?.totalCities || 0}</div>
                </div>
                
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="text-purple-500 mb-2 flex items-center">
                    <MapPin size={18} className="mr-2" />
                    <span className="font-medium">Countries</span>
                  </div>
                  <div className="text-2xl font-bold">{userStats?.totalCountries || 0}</div>
                </div>
                
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="text-yellow-500 mb-2 flex items-center">
                    <DollarSign size={18} className="mr-2" />
                    <span className="font-medium">Total Budget</span>
                  </div>
                  <div className="text-2xl font-bold">
                    ${userStats?.totalBudget?.toLocaleString() || 0}
                  </div>
                </div>
                
                <div className="bg-red-50 p-4 rounded-lg">
                  <div className="text-red-500 mb-2 flex items-center">
                    <Clock size={18} className="mr-2" />
                    <span className="font-medium">Avg. Duration</span>
                  </div>
                  <div className="text-2xl font-bold">
                    {userStats?.avgTripDuration || 0} days
                  </div>
                </div>
                
                <div className="bg-indigo-50 p-4 rounded-lg">
                  <div className="text-indigo-500 mb-2 flex items-center">
                    <MapPin size={18} className="mr-2" />
                    <span className="font-medium">Total Stops</span>
                  </div>
                  <div className="text-2xl font-bold">{userStats?.totalStops || 0}</div>
                </div>
              </div>
            )}
          </Card>
          
          {/* Upcoming Trips */}
          <Card className="mb-8">
            <h2 className="text-xl font-semibold mb-6 flex items-center">
              <Calendar size={20} className="mr-2 text-green-500" />
              Upcoming Trips
            </h2>
            
            {tripsLoading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner size="md" />
              </div>
            ) : connectionError ? (
              <div className="text-center py-8">
                <div className="bg-red-50 p-4 rounded-lg mb-4">
                  <p className="text-red-600 font-medium">Unable to load trips</p>
                  <p className="text-gray-600 text-sm mt-2">We're having trouble connecting to the server. Please try again later.</p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={fetchUserTrips}
                  className="mt-2"
                >
                  Try Again
                </Button>
              </div>
            ) : upcomingTrips.length > 0 ? (
              <div className="space-y-4">
                {upcomingTrips.map((trip) => (
                  <motion.div 
                    key={trip._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => navigate(`/trips/${trip._id}`)}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">{trip.title}</h3>
                        <div className="text-sm text-gray-600 mt-1 flex items-center">
                          <Calendar size={14} className="mr-1" />
                          {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
                        </div>
                        {trip.stops && trip.stops.length > 0 && (
                          <div className="text-sm text-gray-600 mt-1 flex items-center">
                            <MapPin size={14} className="mr-1" />
                            {trip.stops.map(stop => `${stop.city || 'Unknown City'}${stop.country ? `, ${stop.country}` : ''}`).join(' • ')}
                          </div>
                        )}
                      </div>
                      <div className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
                        Upcoming
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Calendar size={40} className="mx-auto mb-4 text-gray-400" />
                <p>No upcoming trips planned</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-4"
                  onClick={() => navigate('/trips/new')}
                >
                  Plan a Trip
                </Button>
              </div>
            )}
          </Card>
          
          {/* Past Trips */}
          <Card>
            <h2 className="text-xl font-semibold mb-6 flex items-center">
              <Clock size={20} className="mr-2 text-blue-500" />
              Past Trips
            </h2>
            
            {tripsLoading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner size="md" />
              </div>
            ) : connectionError ? (
              <div className="text-center py-8">
                <div className="bg-red-50 p-4 rounded-lg mb-4">
                  <p className="text-red-600 font-medium">Unable to load trips</p>
                  <p className="text-gray-600 text-sm mt-2">We're having trouble connecting to the server. Please try again later.</p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={fetchUserTrips}
                  className="mt-2"
                >
                  Try Again
                </Button>
              </div>
            ) : pastTrips.length > 0 ? (
              <div className="space-y-4">
                {pastTrips.map((trip) => (
                  <motion.div 
                    key={trip._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => navigate(`/trips/${trip._id}`)}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">{trip.title}</h3>
                        <div className="text-sm text-gray-600 mt-1 flex items-center">
                          <Calendar size={14} className="mr-1" />
                          {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
                        </div>
                        {trip.stops && trip.stops.length > 0 && (
                          <div className="text-sm text-gray-600 mt-1 flex items-center">
                            <MapPin size={14} className="mr-1" />
                            {trip.stops.map(stop => `${stop.city || 'Unknown City'}${stop.country ? `, ${stop.country}` : ''}`).join(' • ')}
                          </div>
                        )}
                        {trip.budget && (
                          <div className="text-sm text-gray-600 mt-1 flex items-center">
                            <DollarSign size={14} className="mr-1" />
                            Budget: ${typeof trip.budget === 'object' ? 
                              (trip.budget.total || 0).toLocaleString() : 
                              (parseFloat(trip.budget) || 0).toLocaleString()}
                          </div>
                        )}
                      </div>
                      <div className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded">
                        Completed
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Clock size={40} className="mx-auto mb-4 text-gray-400" />
                <p>No past trips</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;