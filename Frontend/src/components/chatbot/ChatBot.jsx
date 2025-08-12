import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, User, Calendar, MapPin, DollarSign, Activity, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../../hooks/useAuth';
import LoadingSpinner from '../common/LoadingSpinner';
import { API_ROUTES } from '../../api/BACKENDROUTES';

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userStats, setUserStats] = useState(null);
  const [userTrips, setUserTrips] = useState([]);
  const [userAnalytics, setUserAnalytics] = useState(null);
  const messagesEndRef = useRef(null);
  const { user, isAuthenticated } = useAuth();

  // Fetch user stats when authenticated
  useEffect(() => {
    if (isAuthenticated && isOpen) {
      fetchUserStats();
      fetchUserTrips();
    }
  }, [isAuthenticated, isOpen]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Fetch user statistics
  const fetchUserStats = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      const response = await axios.get(API_ROUTES.users.stats, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUserStats(response.data.stats);
      
      // Create simulated analytics data based on user stats
      // This is a fallback since there's no dedicated analytics endpoint
      if (response.data.stats) {
        const stats = response.data.stats;
        
        // Create simulated analytics data
        const simulatedAnalytics = {
          topDestinations: userTrips && userTrips.length > 0 
            ? userTrips
              .filter(trip => trip.stops && trip.stops.length > 0)
              .flatMap(trip => trip.stops)
              .reduce((acc, stop) => {
                if (!stop.city) return acc;
                const existingCity = acc.find(c => c.city === stop.city);
                if (existingCity) {
                  existingCity.count++;
                } else {
                  acc.push({ city: stop.city, country: stop.country || 'Unknown', count: 1 });
                }
                return acc;
              }, [])
              .sort((a, b) => b.count - a.count)
              .slice(0, 5)
            : [],
          
          activityBreakdown: userTrips && userTrips.length > 0
            ? userTrips
              .flatMap(trip => trip.stops || [])
              .flatMap(stop => stop.activities || [])
              .reduce((acc, activity) => {
                if (!activity.type) return acc;
                const existingType = acc.find(a => a.type === activity.type);
                if (existingType) {
                  existingType.count++;
                } else {
                  acc.push({ type: activity.type, count: 1 });
                }
                return acc;
              }, [])
              .sort((a, b) => b.count - a.count)
            : [],
          
          budgetAnalysis: {
            avgTripBudget: stats.totalTrips > 0 ? (stats.totalBudget / stats.totalTrips).toFixed(2) : 0,
            totalSpent: stats.totalBudget,
            avgDuration: stats.avgTripDuration
          }
        };
        
        setUserAnalytics(simulatedAnalytics);
      }
      
      // Add welcome message with user info
      if (messages.length === 0) {
        setMessages([
          {
            id: Date.now(),
            text: `Hello ${user?.name || 'there'}! 👋 I'm your travel assistant. I can help you with trip planning, budget management, and provide information about your travel history. What would you like to know today?`,
            sender: 'bot',
            timestamp: new Date(),
          },
        ]);
      }
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };
  
  // Fetch user trips
  const fetchUserTrips = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      const response = await axios.get(API_ROUTES.trips.getAll, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data && response.data.trips) {
        setUserTrips(response.data.trips);
      }
    } catch (error) {
      console.error('Error fetching user trips:', error);
    }
  };

  // Handle sending a message
  const handleSendMessage = async () => {
    if (!input.trim()) return;

    // Add user message
    const userMessage = {
      id: Date.now(),
      text: input,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Prepare context for the AI
      let context = '';
      if (isAuthenticated && user) {
        context = `User: ${user.name} (${user.email})\n`;
        
        // Add basic stats
        if (userStats) {
          context += `Stats: ${userStats.totalTrips} trips, ${userStats.totalCountries} countries, ${userStats.totalCities} cities, $${userStats.totalBudget} total spent\n`;
        }
        
        // Add trip information
        if (userTrips && userTrips.length > 0) {
          context += '\nRecent Trips:\n';
          // Add up to 3 most recent trips
          const recentTrips = [...userTrips].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 3);
          
          recentTrips.forEach(trip => {
            const startDate = new Date(trip.startDate).toLocaleDateString();
            const endDate = new Date(trip.endDate).toLocaleDateString();
            context += `- ${trip.title}: ${startDate} to ${endDate}, Budget: $${trip.budget?.total || 'N/A'}\n`;
            
            // Add stops if available
            if (trip.stops && trip.stops.length > 0) {
              context += '  Destinations: ' + trip.stops.map(stop => stop.city).join(', ') + '\n';
            }
          });
        }
        
        // Add detailed analytics if available
        if (userAnalytics) {
          context += '\nTravel Patterns:\n';
          
          if (userAnalytics.topDestinations && userAnalytics.topDestinations.length > 0) {
            context += `Top destinations: ${userAnalytics.topDestinations.slice(0, 3).map(d => d.city).join(', ')}\n`;
          }
          
          if (userAnalytics.activityBreakdown && userAnalytics.activityBreakdown.length > 0) {
            context += `Favorite activities: ${userAnalytics.activityBreakdown.slice(0, 3).map(a => a.type).join(', ')}\n`;
          }
          
          if (userAnalytics.budgetAnalysis) {
            context += `Average trip budget: $${userAnalytics.budgetAnalysis.avgTripBudget}\n`;
          }
        }
      }

      // Send to OpenRouter API
      const response = await axios.post(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          model: 'openai/gpt-4o-mini', // You can change the model
          messages: [
            {
              role: 'system',
              content: `You are a helpful travel assistant for the GlobeTrotter app. ${context}\nYou help users plan trips, manage budgets, and provide travel recommendations. Be concise, friendly, and helpful.`,
            },
            ...messages.map(msg => ({
              role: msg.sender === 'user' ? 'user' : 'assistant',
              content: msg.text,
            })),
            { role: 'user', content: input },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      // Add bot response
      const botMessage = {
        id: Date.now() + 1,
        text: response.data.choices[0].message.content,
        sender: 'bot',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message to AI:', error);
      
      // Add error message
      const errorMessage = {
        id: Date.now() + 1,
        text: 'Sorry, I encountered an error. Please try again later.',
        sender: 'bot',
        timestamp: new Date(),
        isError: true,
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Format timestamp
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Show user stats in a formatted way
  const renderUserStats = () => {
    if (!userStats) return null;

    return (
      <div className="p-3 bg-blue-50 rounded-lg mb-3 text-sm">
        <h3 className="font-semibold flex items-center gap-1 mb-2">
          <Info size={16} className="text-blue-500" />
          Your Travel Summary
        </h3>
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-1">
            <MapPin size={14} className="text-blue-500" />
            <span>{userStats.totalTrips} Trips</span>
          </div>
          <div className="flex items-center gap-1">
            <MapPin size={14} className="text-green-500" />
            <span>{userStats.totalCities} Cities</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar size={14} className="text-amber-500" />
            <span>~{userStats.avgTripDuration} Days/Trip</span>
          </div>
          <div className="flex items-center gap-1">
            <DollarSign size={14} className="text-purple-500" />
            <span>${userStats.totalBudget}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Chat Icon */}
      <div className="fixed left-4 bottom-4 z-50">
        <motion.button
          className={`p-3 rounded-full shadow-lg flex items-center justify-center ${isOpen ? 'bg-red-500' : 'bg-blue-600'}`}
          onClick={() => setIsOpen(!isOpen)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          {isOpen ? (
            <X className="h-6 w-6 text-white" />
          ) : (
            <MessageCircle className="h-6 w-6 text-white" />
          )}
        </motion.button>
      </div>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed left-4 bottom-20 w-80 sm:w-96 h-[500px] bg-white rounded-lg shadow-xl z-40 flex flex-col overflow-hidden border border-gray-200"
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          >
            {/* Header */}
            <div className="bg-blue-600 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                <h3 className="font-semibold">Travel Assistant</h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:text-gray-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
              {isAuthenticated && userStats && renderUserStats()}
              
              {messages.length === 0 && !isAuthenticated && (
                <div className="text-center text-gray-500 mt-4">
                  <User className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                  <p>Sign in to get personalized travel assistance</p>
                </div>
              )}

              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`mb-4 ${message.sender === 'user' ? 'text-right' : 'text-left'}`}
                >
                  <div
                    className={`inline-block rounded-lg px-4 py-2 max-w-[80%] ${message.sender === 'user' ? 'bg-blue-600 text-white' : message.isError ? 'bg-red-100 text-red-800' : 'bg-gray-200 text-gray-800'}`}
                  >
                    <p className="whitespace-pre-wrap break-words">{message.text}</p>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {formatTime(message.timestamp)}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start mb-4">
                  <div className="bg-gray-200 rounded-lg px-4 py-2">
                    <LoadingSpinner size="sm" />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 border-t border-gray-200 bg-white">
              <div className="flex items-center gap-2">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about trips, budgets, or travel tips..."
                  className="flex-1 resize-none border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 max-h-20"
                  rows="1"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!input.trim() || isLoading}
                  className={`p-2 rounded-full ${!input.trim() || isLoading ? 'bg-gray-300 text-gray-500' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
              <div className="text-xs text-gray-500 mt-1 text-center">
                Powered by AI • Your travel companion
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatBot;