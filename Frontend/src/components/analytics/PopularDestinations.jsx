import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Globe, Users, Star, TrendingUp } from 'lucide-react';
import axios from 'axios';
import { API_ROUTES } from '../../api/BACKENDROUTES';
import Card from '../common/Card';
import LoadingSpinner from '../common/LoadingSpinner';

const PopularDestinations = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [destinations, setDestinations] = useState([]);

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

  // Sample data for popular destinations
  const sampleDestinations = [
    {
      city: 'Bali',
      country: 'Indonesia',
      fullName: 'Bali, Indonesia',
      visitCount: 12,
      totalDays: 45,
      totalActivities: 36,
      sampleImage: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4'
    },
    {
      city: 'Paris',
      country: 'France',
      fullName: 'Paris, France',
      visitCount: 10,
      totalDays: 32,
      totalActivities: 28,
      sampleImage: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34'
    },
    {
      city: 'Tokyo',
      country: 'Japan',
      fullName: 'Tokyo, Japan',
      visitCount: 8,
      totalDays: 24,
      totalActivities: 30,
      sampleImage: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26'
    },
    {
      city: 'New York',
      country: 'USA',
      fullName: 'New York, USA',
      visitCount: 7,
      totalDays: 21,
      totalActivities: 25,
      sampleImage: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9'
    },
    {
      city: 'Barcelona',
      country: 'Spain',
      fullName: 'Barcelona, Spain',
      visitCount: 6,
      totalDays: 18,
      totalActivities: 20,
      sampleImage: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4'
    }
  ];

  useEffect(() => {
    // In a real application, you would fetch this data from the API
    // For now, we'll use the sample data
    setDestinations(sampleDestinations);
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
          <TrendingUp className="mr-2 h-5 w-5 text-blue-500" />
          Popular Destinations
        </h2>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {destinations.map((destination, index) => (
          <motion.div
            key={index}
            variants={itemVariants}
            className="rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow"
          >
            <div 
              className="h-40 bg-cover bg-center" 
              style={{ backgroundImage: `url(${destination.sampleImage})` }}
            >
              <div className="h-full w-full bg-gradient-to-t from-black/70 to-transparent flex items-end p-4">
                <div className="text-white">
                  <h3 className="text-lg font-semibold">{destination.city}</h3>
                  <p className="text-sm flex items-center">
                    <Globe className="h-3 w-3 mr-1" />
                    {destination.country}
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4 bg-white">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-xs text-gray-500">Visits</p>
                  <p className="font-semibold">{destination.visitCount}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Days</p>
                  <p className="font-semibold">{destination.totalDays}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Activities</p>
                  <p className="font-semibold">{destination.totalActivities}</p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </Card>
  );
};

export default PopularDestinations;