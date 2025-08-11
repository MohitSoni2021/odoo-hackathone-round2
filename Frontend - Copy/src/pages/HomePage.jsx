import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, MapPin, Users, Star, Globe } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { SITE_INFO } from '../utils/SITEINFO';
import Button from '../components/common/Button';
import Card from '../components/common/Card';

const HomePage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const features = [
    {
      icon: <MapPin className="w-8 h-8 text-blue-600" />,
      title: 'Multi-City Planning',
      description: 'Plan complex trips with multiple destinations and seamless connections.'
    },
    {
      icon: <Users className="w-8 h-8 text-green-500" />,
      title: 'Collaborative Planning',
      description: 'Share your itineraries and plan trips together with friends and family.'
    },
    {
      icon: <Star className="w-8 h-8 text-yellow-500" />,
      title: 'Smart Recommendations',
      description: 'Get personalized suggestions for activities, restaurants, and attractions.'
    },
    {
      icon: <Globe className="w-8 h-8 text-purple-600" />,
      title: 'Global Coverage',
      description: 'Explore destinations worldwide with comprehensive travel information.'
    }
  ];

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/signup');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-7xl font-bold font-heading mb-6"
          >
            {SITE_INFO.brandName}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl md:text-2xl mb-8 text-blue-100"
          >
            {SITE_INFO.tagline}
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-lg mb-10 text-blue-50 max-w-3xl mx-auto"
          >
            {SITE_INFO.description}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Button
              size="xl"
              variant="secondary"
              onClick={handleGetStarted}
              icon={<ArrowRight size={20} />}
              iconPosition="right"
              className="min-w-[200px]"
            >
              {isAuthenticated ? 'Go to Dashboard' : 'Start Planning'}
            </Button>
            <Button
              size="xl"
              variant="outline"
              onClick={() => navigate('/about')}
              className="min-w-[200px] border-white text-white hover:bg-white hover:text-blue-600"
            >
              Learn More
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold font-heading text-gray-900 mb-6">
              Why Choose GlobeTrotter?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our powerful features make trip planning effortless and enjoyable
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
              >
                <Card hover className="text-center h-full">
                  <div className="mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold font-heading text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Destinations */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold font-heading text-gray-900 mb-6">
              Popular Destinations
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover amazing places around the world
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {SITE_INFO.featuredDestinations.map((destination, index) => (
              <motion.div
                key={destination.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
              >
                <Card hover className="overflow-hidden">
                  <div className="aspect-w-16 aspect-h-9 mb-4">
                    <img
                      src={destination.image}
                      alt={destination.name}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  </div>
                  <h3 className="text-lg font-semibold font-heading text-gray-900 mb-2">
                    {destination.name}
                  </h3>
                  <p className="text-gray-600">
                    {destination.description}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-green-500 to-teal-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-5xl font-bold font-heading mb-6"
          >
            Ready to Start Your Adventure?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl mb-10"
          >
            Join thousands of travelers who plan their perfect trips with GlobeTrotter
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <Button
              size="xl"
              variant="accent"
              onClick={handleGetStarted}
              icon={<ArrowRight size={20} />}
              iconPosition="right"
              className="min-w-[250px]"
            >
              {isAuthenticated ? 'Create Your First Trip' : 'Sign Up Now'}
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;