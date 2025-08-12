import React from 'react';
import { motion } from 'framer-motion';
import { Compass, MapPin, Calendar, Sun, Cloud, Umbrella } from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';

const TravelRecommendations = () => {
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

  // Sample recommendations based on season, trends, etc.
  const recommendations = [
    {
      id: 1,
      title: 'Beach Getaway',
      description: 'Perfect time to visit tropical beaches with ideal weather and fewer crowds.',
      destinations: ['Maldives', 'Bali', 'Phuket'],
      season: 'Summer',
      weatherIcon: <Sun className="h-5 w-5 text-yellow-500" />,
      image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e'
    },
    {
      id: 2,
      title: 'Cultural Exploration',
      description: 'Explore rich cultural heritage with pleasant temperatures and seasonal festivals.',
      destinations: ['Kyoto', 'Rome', 'Istanbul'],
      season: 'Spring',
      weatherIcon: <Cloud className="h-5 w-5 text-blue-300" />,
      image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e'
    },
    {
      id: 3,
      title: 'Mountain Adventure',
      description: 'Experience breathtaking mountain views with perfect hiking conditions.',
      destinations: ['Swiss Alps', 'Himalayas', 'Patagonia'],
      season: 'Fall',
      weatherIcon: <Umbrella className="h-5 w-5 text-purple-500" />,
      image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b'
    }
  ];

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold flex items-center">
          <Compass className="mr-2 h-5 w-5 text-blue-500" />
          Seasonal Recommendations
        </h2>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {recommendations.map((recommendation) => (
          <motion.div
            key={recommendation.id}
            variants={itemVariants}
            className="rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-100"
          >
            <div className="flex flex-col md:flex-row">
              <div 
                className="w-full md:w-1/3 h-48 md:h-auto bg-cover bg-center" 
                style={{ backgroundImage: `url(${recommendation.image})` }}
              />
              <div className="p-4 md:p-6 w-full md:w-2/3">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-lg">{recommendation.title}</h3>
                  <div className="flex items-center bg-gray-100 px-3 py-1 rounded-full">
                    {recommendation.weatherIcon}
                    <span className="ml-1 text-sm">{recommendation.season}</span>
                  </div>
                </div>
                
                <p className="text-gray-600 mb-3">{recommendation.description}</p>
                
                <div className="mb-4">
                  <div className="text-sm font-medium text-gray-500 mb-2">Top Destinations:</div>
                  <div className="flex flex-wrap gap-2">
                    {recommendation.destinations.map((destination, index) => (
                      <span 
                        key={index} 
                        className="inline-flex items-center bg-blue-50 text-blue-700 px-2 py-1 rounded-full text-xs"
                      >
                        <MapPin size={12} className="mr-1" />
                        {destination}
                      </span>
                    ))}
                  </div>
                </div>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  className="w-full md:w-auto"
                  onClick={() => window.open(`/onboarding/newtrip?suggestion=${recommendation.title}`, '_blank')}
                >
                  Plan This Trip
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </Card>
  );
};

export default TravelRecommendations;