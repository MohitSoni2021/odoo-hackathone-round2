import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, MessageSquare, User, Check } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { SITE_INFO } from '../utils/SITEINFO';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Card from '../components/common/Card';

const ContactPage = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  // Form validation schema
  const schema = yup.object({
    name: yup.string().required('Name is required'),
    email: yup.string().email('Invalid email').required('Email is required'),
    subject: yup.string().required('Subject is required'),
    message: yup.string().required('Message is required').min(10, 'Message must be at least 10 characters')
  });

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: yupResolver(schema)
  });

  const onSubmit = async (data) => {
    console.log('Form submitted:', data);
    try {
      const response = await fetch('https://formspree.io/f/mdkdeybp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (response.ok) {
        setIsSubmitted(true);
        reset();
        // Reset the success message after 5 seconds
        setTimeout(() => setIsSubmitted(false), 5000);
      } else {
        console.error('Form submission failed');
        alert('Failed to submit the form. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('An error occurred. Please try again later.');
    }
  };

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

  // Contact methods
  const contactMethods = [
    {
      icon: <Mail className="w-8 h-8 text-blue-600" />,
      title: 'Email',
      description: SITE_INFO.contactEmail,
      action: `mailto:${SITE_INFO.contactEmail}`
    },
    {
      icon: <Phone className="w-8 h-8 text-green-500" />,
      title: 'Phone',
      description: '+1 (555) 123-4567',
      action: 'tel:+15551234567'
    },
    {
      icon: <MapPin className="w-8 h-8 text-red-500" />,
      title: 'Office',
      description: '123 Travel Lane, San Francisco, CA 94107',
      action: 'https://maps.google.com/?q=San+Francisco+CA+94107'
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
            Contact {SITE_INFO.brandName}
          </motion.h1>
          <motion.p 
            className="text-xl md:text-2xl max-w-3xl mx-auto"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            We'd love to hear from you. Get in touch with our team.
          </motion.p>
        </div>
      </motion.section>

      {/* Contact Methods */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold mb-4 text-gray-800">Get In Touch</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Have questions about our platform? Need help planning your trip? Our team is here to assist you.
            </p>
          </motion.div>
          
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {contactMethods.map((method, index) => (
              <motion.div 
                key={index} 
                className="bg-white p-6 rounded-lg shadow-md text-center"
                variants={itemVariants}
              >
                <div className="flex justify-center mb-4">{method.icon}</div>
                <h3 className="text-xl font-semibold mb-2 text-gray-800">{method.title}</h3>
                <p className="text-gray-600 mb-4">{method.description}</p>
                <a 
                  href={method.action} 
                  target={method.title === 'Office' ? '_blank' : undefined}
                  rel={method.title === 'Office' ? 'noopener noreferrer' : undefined}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  {method.title === 'Email' ? 'Send an email' : 
                   method.title === 'Phone' ? 'Call us' : 
                   'View on map'}
                </a>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div 
              className="text-center mb-12"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl font-bold mb-4 text-gray-800">Send Us a Message</h2>
              <p className="text-lg text-gray-600">
                Fill out the form below and we'll get back to you as soon as possible.
              </p>
            </motion.div>
            
            <Card padding="lg" className="mb-8">
              {isSubmitted ? (
                <motion.div 
                  className="text-center py-8"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                    <Check className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">Message Sent!</h3>
                  <p className="text-gray-600">
                    Thank you for reaching out. We'll get back to you shortly.
                  </p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} action="https://formspree.io/f/mdkdeybp" method="POST">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <Input
                      {...register('name')}
                      label="Your Name"
                      placeholder="Enter your name"
                      icon={<User size={18} />}
                      error={errors.name?.message}
                      required
                    />
                    
                    <Input
                      {...register('email')}
                      type="email"
                      label="Email Address"
                      placeholder="Enter your email"
                      icon={<Mail size={18} />}
                      error={errors.email?.message}
                      required
                    />
                  </div>
                  
                  <div className="mb-6">
                    <Input
                      {...register('subject')}
                      label="Subject"
                      placeholder="What is your message about?"
                      icon={<MessageSquare size={18} />}
                      error={errors.subject?.message}
                      required
                    />
                  </div>
                  
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Message<span className="text-red-500 ml-1">*</span>
                    </label>
                    <div className="relative">
                      <textarea
                        {...register('message')}
                        rows={6}
                        className={`w-full px-4 py-3 border ${errors.message ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200`}
                        placeholder="Type your message here..."
                      ></textarea>
                    </div>
                    {errors.message && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-sm text-red-600 mt-1"
                      >
                        {errors.message.message}
                      </motion.p>
                    )}
                  </div>
                  
                  <div className="text-right">
                    <Button 
                      type="submit" 
                      size="lg"
                      icon={<Send size={18} />}
                      iconPosition="right"
                    >
                      Send Message
                    </Button>
                  </div>
                </form>
              )}
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold mb-4 text-gray-800">Frequently Asked Questions</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Find quick answers to common questions about {SITE_INFO.brandName}.
            </p>
          </motion.div>
          
          <div className="max-w-4xl mx-auto">
            <motion.div 
              className="space-y-6"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {[
                {
                  question: 'How do I create a new trip?',
                  answer: 'To create a new trip, log in to your account, navigate to the dashboard, and click on the "Create Trip" button. Follow the guided process to set up your trip details.'
                },
                {
                  question: 'Can I share my trip with friends who don\'t have an account?',
                  answer: 'Yes! You can generate a public link to share your trip with anyone, even if they don\'t have a GlobeTrotter account. They\'ll be able to view your itinerary but won\'t be able to make changes.'
                },
                {
                  question: 'How do I add activities to my trip?',
                  answer: 'Once you\'ve created a trip, you can add activities by navigating to your trip details page and clicking "Add Activity". You can specify the date, time, location, and other details for each activity.'
                },
                {
                  question: 'Is there a mobile app available?',
                  answer: 'We\'re currently developing our mobile app for iOS and Android. In the meantime, our website is fully responsive and works great on mobile browsers.'
                },
                {
                  question: 'How can I get help with planning my trip?',
                  answer: 'We offer several resources to help you plan your trip. You can use our recommendation engine, browse public trips for inspiration, or contact our support team for personalized assistance.'
                }
              ].map((faq, index) => (
                <motion.div 
                  key={index} 
                  className="bg-white p-6 rounded-lg shadow-sm"
                  variants={itemVariants}
                >
                  <h3 className="text-xl font-semibold mb-3 text-gray-800">{faq.question}</h3>
                  <p className="text-gray-600">{faq.answer}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;