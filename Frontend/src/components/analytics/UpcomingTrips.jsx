import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Clock, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_ROUTES } from '../../api/BACKENDROUTES';
import Card from '../common/Card';
import LoadingSpinner from '../common/LoadingSpinner';
import Button from '../common/Button';

const UpcomingTrips = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [trips, setTrips] = useState([]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
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
        duration: 0.5
      }
    }
  };

  // Format date function
  const formatDate = (dateString) => {
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  // Calculate days remaining
  const getDaysRemaining = (dateString) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tripDate = new Date(dateString);
    tripDate.setHours(0, 0, 0, 0);
    
    const diffTime = tripDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  // Sample data for upcoming trips
  const sampleTrips = [
    {
      _id: '1',
      title: 'Summer in Bali',
      startDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
      endDate: new Date(Date.now() + 22 * 24 * 60 * 60 * 1000).toISOString(),
      coverImage: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4',
      stops: [
        { city: 'Ubud', country: 'Indonesia' },
        { city: 'Kuta', country: 'Indonesia' }
      ]
    },
    {
      _id: '2',
      title: 'Paris Weekend',
      startDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      endDate: new Date(Date.now() + 33 * 24 * 60 * 60 * 1000).toISOString(),
      coverImage: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34',
      stops: [
        { city: 'Paris', country: 'France' }
      ]
    },
    {
      _id: '3',
      title: 'Tokyo Adventure',
      startDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
      endDate: new Date(Date.now() + 52 * 24 * 60 * 60 * 1000).toISOString(),
      coverImage: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26',
      stops: [
        { city: 'Tokyo', country: 'Japan' },
        { city: 'Kyoto', country: 'Japan' }
      ]
    }
  ];

  useEffect(() => {
    // In a real application, you would fetch this data from the API
    // For now, we'll use the sample data
    setTrips(sampleTrips);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-6 bg-red-50 rounded-lg">
        <p className="text-red-600 mb-2">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="text-blue-600 underline"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold flex items-center">
          <Calendar className="mr-2 h-5 w-5 text-blue-500" />
          Upcoming Trips
        </h2>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => navigate('/trips')}
          icon={<ChevronRight size={16} />}
          iconPosition="right"
        >
          View All
        </Button>
      </div>

      {trips.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">No upcoming trips found</p>
          <Button 
            variant="primary"
            onClick={() => navigate('/onboarding/newtrip')}
          >
            Plan a Trip
          </Button>
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-4"
        >
          {trips.map((trip) => {
            const daysRemaining = getDaysRemaining(trip.startDate);
            return (
              <motion.div 
                key={trip._id}
                variants={itemVariants}
                className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate(`/trips/${trip._id}`)}
              >
                <div className="flex flex-col sm:flex-row">
                  <div 
                    className="w-full sm:w-1/3 h-32 sm:h-auto bg-cover bg-center" 
                    style={{ backgroundImage: `url(${trip.coverImage})` }}
                  />
                  <div className="p-4 w-full sm:w-2/3">
                    <h3 className="font-semibold text-lg mb-2">{trip.title}</h3>
                    <div className="flex flex-wrap gap-y-2">
                      <div className="w-full sm:w-1/2 text-sm text-gray-600 flex items-center">
                        <Calendar size={14} className="mr-1" />
                        {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
                      </div>
                      <div className="w-full sm:w-1/2 text-sm text-gray-600 flex items-center">
                        <MapPin size={14} className="mr-1" />
                        {trip.stops.map(stop => stop.city).join(', ')}
                      </div>
                    </div>
                    <div className="mt-3 flex items-center">
                      <Clock size={14} className="mr-1 text-blue-500" />
                      <span className="text-sm font-medium text-blue-500">
                        {daysRemaining === 0 ? 'Today' : 
                         daysRemaining === 1 ? 'Tomorrow' : 
                         `${daysRemaining} days remaining`}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </Card>
  );
};

export default UpcomingTrips;