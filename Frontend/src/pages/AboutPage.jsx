import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Globe, Users, Star, Mail, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SITE_INFO } from '../utils/SITEINFO';
import Button from '../components/common/Button';

const AboutPage = () => {
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

  // Team members data
  const teamMembers = [
    {
      name: 'Mohit Soni',
      role: 'Full Stack Developer (Leader)',
      bio: '',
      image: 'https://avatars.githubusercontent.com/u/96830135?v=4'
    },
    {
      name: 'Ishita Trivedi',
      role: 'Project Manager',
      bio: 'Tech innovator with a passion for creating intuitive user experiences. Leads our development team in building cutting-edge travel planning tools.',
      image: 'https://media.licdn.com/dms/image/v2/D4E03AQGL1ERh28fP-w/profile-displayphoto-shrink_800_800/B4EZYUoRExHgAc-/0/1744102823525?e=1758153600&v=beta&t=DBY3VnDzGNzwc4zHpVi9WSPxAa6fPV6euIUu0SIF04U'
    },
    {
      name: 'Kalp Patel',
      role: 'Frontend Developer',
      bio: 'Product visionary who combines user research with travel expertise to create features that travelers actually need and love.',
      image: 'https://media.licdn.com/dms/image/v2/D5603AQHzAWCE2zm3Hw/profile-displayphoto-shrink_400_400/B56ZTMp4LMGQAg-/0/1738600319215?e=1758153600&v=beta&t=xm6zH2Kbz-rJ40fcXXaIVhMIbbuLxSOWWLCiK1KVRLY'
    },
    {
      name: 'Dev Patel',
      role: 'Backend Developer',
      bio: 'Former travel guide who has visited over 50 countries. Ensures our platform provides authentic and meaningful travel experiences.',
      image: 'https://media.licdn.com/dms/image/v2/D4E03AQEdlYjjGAZnTw/profile-displayphoto-shrink_400_400/B4EZTqf4wtHgAg-/0/1739101016324?e=1758153600&v=beta&t=gEZHFB3e1aNFWQioqfHgEYuJH0n-IuUSVLd0_JeJ2As'
    }
  ];

  // Company values
  const values = [
    {
      icon: <Globe className="w-8 h-8 text-blue-600" />,
      title: 'Global Perspective',
      description: 'We believe in the power of travel to broaden horizons and connect cultures.'
    },
    {
      icon: <Users className="w-8 h-8 text-green-500" />,
      title: 'Community First',
      description: 'We build tools that bring travelers together and foster shared experiences.'
    },
    {
      icon: <Star className="w-8 h-8 text-yellow-500" />,
      title: 'Quality Experiences',
      description: 'We prioritize authentic, meaningful travel over tourist traps and cookie-cutter itineraries.'
    },
    {
      icon: <MapPin className="w-8 h-8 text-purple-600" />,
      title: 'Sustainable Travel',
      description: 'We promote responsible tourism that respects local communities and environments.'
    }
  ];

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <motion.section 
        className="py-20 bg-gradient-to-r from-blue-600 to-indigo-700 text-white"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container mx-auto px-4 text-center">
          <motion.h1 
            className="text-4xl md:text-5xl font-bold mb-6"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            About {SITE_INFO.brandName}
          </motion.h1>
          <motion.p 
            className="text-xl md:text-2xl max-w-3xl mx-auto"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            Transforming the way you plan, experience, and share your travel adventures.
          </motion.p>
        </div>
      </motion.section>

      {/* Mission Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div 
            className="max-w-3xl mx-auto text-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold mb-6 text-gray-800">Our Mission</h2>
            <p className="text-lg text-gray-600 mb-8">
              At {SITE_INFO.brandName}, we believe that travel should be accessible, enjoyable, and meaningful. 
              Our mission is to empower travelers to create personalized journeys that reflect their unique interests and preferences, 
              while providing the tools to seamlessly plan, organize, and share their adventures.
            </p>
            <p className="text-lg text-gray-600">
              We're dedicated to removing the stress from travel planning, allowing you to focus on what matters most: 
              creating unforgettable memories and experiencing the world's wonders.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <motion.div 
              className="md:w-1/2"
              initial={{ x: -50, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl font-bold mb-6 text-gray-800">Our Story</h2>
              <p className="text-lg text-gray-600 mb-4">
                {SITE_INFO.brandName} was born from a simple frustration: planning multi-city trips was unnecessarily complicated. 
                Our founders, avid travelers themselves, found existing tools either too simplistic or overwhelmingly complex.
              </p>
              <p className="text-lg text-gray-600 mb-4">
                In 2023, we set out to create a platform that strikes the perfect balance—powerful enough for complex itineraries 
                yet intuitive enough for anyone to use. We assembled a team of travel enthusiasts and technology experts who shared our vision.
              </p>
              <p className="text-lg text-gray-600">
                Today, {SITE_INFO.brandName} helps thousands of travelers plan personalized journeys, manage their travel budgets, 
                and share their adventures with friends and family around the world.
              </p>
            </motion.div>
            <motion.div 
              className="md:w-1/2"
              initial={{ x: 50, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <img 
                src="https://images.pexels.com/photos/7412069/pexels-photo-7412069.jpeg" 
                alt="Team planning travel routes" 
                className="rounded-lg shadow-xl w-full h-auto"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold mb-4 text-gray-800">Our Values</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              These core principles guide everything we do at {SITE_INFO.brandName}.
            </p>
          </motion.div>
          
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {values.map((value, index) => (
              <motion.div 
                key={index} 
                className="bg-white p-6 rounded-lg shadow-md"
                variants={itemVariants}
              >
                <div className="mb-4">{value.icon}</div>
                <h3 className="text-xl font-semibold mb-2 text-gray-800">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold mb-4 text-gray-800">What Makes Us Different</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              {SITE_INFO.brandName} offers a unique approach to travel planning that sets us apart.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div 
              className="bg-blue-50 p-6 rounded-lg"
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h3 className="text-xl font-semibold mb-3 text-blue-700">Multi-City Planning</h3>
              <p className="text-gray-700 mb-4">
                Our platform excels at complex itineraries spanning multiple destinations. Easily organize your stops, 
                activities, and transportation in one cohesive plan.
              </p>
              <ul className="list-disc pl-5 text-gray-700 space-y-2">
                <li>Seamless connections between destinations</li>
                <li>Smart scheduling to optimize your time</li>
                <li>Location-based activity suggestions</li>
              </ul>
            </motion.div>
            
            <motion.div 
              className="bg-green-50 p-6 rounded-lg"
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, duration: 0.5 }}
            >
              <h3 className="text-xl font-semibold mb-3 text-green-700">Budget Management</h3>
              <p className="text-gray-700 mb-4">
                Take control of your travel expenses with our comprehensive budget tools. Track spending by category, 
                destination, and activity.
              </p>
              <ul className="list-disc pl-5 text-gray-700 space-y-2">
                <li>Multiple currency support</li>
                <li>Expense categorization</li>
                <li>Budget analytics and insights</li>
              </ul>
            </motion.div>
            
            <motion.div 
              className="bg-purple-50 p-6 rounded-lg"
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <h3 className="text-xl font-semibold mb-3 text-purple-700">Collaborative Planning</h3>
              <p className="text-gray-700 mb-4">
                Plan trips together with friends and family, no matter where they are. Our collaborative tools make group 
                travel planning simple and enjoyable.
              </p>
              <ul className="list-disc pl-5 text-gray-700 space-y-2">
                <li>Shared itineraries with edit permissions</li>
                <li>Group voting on activities and destinations</li>
                <li>Real-time updates for all participants</li>
              </ul>
            </motion.div>
            
            <motion.div 
              className="bg-yellow-50 p-6 rounded-lg"
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <h3 className="text-xl font-semibold mb-3 text-yellow-700">Smart Recommendations</h3>
              <p className="text-gray-700 mb-4">
                Discover hidden gems and popular attractions tailored to your interests. Our recommendation engine learns 
                from your preferences to suggest the perfect activities.
              </p>
              <ul className="list-disc pl-5 text-gray-700 space-y-2">
                <li>Personalized activity suggestions</li>
                <li>Local insights and tips</li>
                <li>Seasonal and weather-aware recommendations</li>
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold mb-4 text-gray-800">Meet Our Team</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              The passionate individuals behind {SITE_INFO.brandName} who are dedicated to transforming how you travel.
            </p>
          </motion.div>
          
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {teamMembers.map((member, index) => (
              <motion.div 
                key={index} 
                className="bg-white rounded-lg overflow-hidden shadow-md"
                variants={itemVariants}
              >
                <img 
                  src={member.image} 
                  alt={member.name} 
                  className="w-full h-64 object-cover"
                />
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-1 text-gray-800">{member.name}</h3>
                  <p className="text-blue-600 mb-3">{member.role}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold mb-6">Ready to Start Your Journey?</h2>
            <p className="text-xl max-w-3xl mx-auto mb-8">
              Join thousands of travelers who are already using {SITE_INFO.brandName} to create unforgettable experiences.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/signup">
                <Button size="lg" className="px-8">
                  Sign Up Free
                </Button>
              </Link>
              <Link to="/contact">
                <Button variant="outline" size="lg" className="px-8 border-white text-white hover:bg-white hover:text-blue-600">
                  Contact Us
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Contact Info */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-8 text-gray-800">Get In Touch</h2>
            <div className="flex flex-col md:flex-row justify-center gap-8 mb-8">
              <div className="flex flex-col items-center">
                <Mail className="w-10 h-10 text-blue-600 mb-3" />
                <h3 className="text-xl font-semibold mb-2 text-gray-800">Email Us</h3>
                <a href={`mailto:${SITE_INFO.contactEmail}`} className="text-blue-600 hover:underline">
                  {SITE_INFO.contactEmail}
                </a>
              </div>
              <div className="flex flex-col items-center">
                <ExternalLink className="w-10 h-10 text-blue-600 mb-3" />
                <h3 className="text-xl font-semibold mb-2 text-gray-800">Follow Us</h3>
                <div className="flex gap-4">
                  <a href={SITE_INFO.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                    Twitter
                  </a>
                  <a href={SITE_INFO.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                    Instagram
                  </a>
                  <a href={SITE_INFO.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                    Facebook
                  </a>
                </div>
              </div>
            </div>
            <p className="text-gray-600">
              We'd love to hear from you! Whether you have questions about our platform, need assistance with your account, 
              or want to provide feedback, our team is here to help.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;