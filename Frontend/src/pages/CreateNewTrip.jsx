import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import axiosInstance from '../api/axiosInstance';
import { API_ROUTES } from '../api/BACKENDROUTES';
import toast from 'react-hot-toast';
import { Calendar, MapPin, Clock, Users, Star, ArrowRight, ArrowLeft } from 'lucide-react';

const CreateNewTrip = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    tripName: '',
    destination: '',
    startDate: '',
    endDate: '',
  });
  const [dateError, setDateError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Redirect if not authenticated
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const suggestions = [
    { 
      id: 1, 
      title: "Varanasi Ganga Aarti", 
      image: "https://images.unsplash.com/photo-1607500369969-4fadd3f7d156?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60",
      description: "Experience the spiritual evening ritual on the banks of the sacred Ganges River",
      duration: "3-5 days",
      bestTime: "October to March",
      rating: 4.8,
      activities: ["Evening Aarti ceremony", "Boat rides", "Temple visits", "Cultural exploration"]
    },
    { 
      id: 2, 
      title: "Rishikesh Yoga Retreat", 
      image: "https://images.unsplash.com/photo-1613323149846-28b1f8a68666?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60",
      description: "Rejuvenate your mind and body in the yoga capital of the world nestled in the Himalayas",
      duration: "7-14 days",
      bestTime: "February to April, September to November",
      rating: 4.9,
      activities: ["Yoga classes", "Meditation", "Ayurvedic treatments", "River rafting"]
    },
    { 
      id: 3, 
      title: "Amritsar Golden Temple", 
      image: "https://images.unsplash.com/photo-1614966939290-66b3e4760a7b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60",
      description: "Visit the holiest gurdwara and spiritual center of Sikhism with its stunning gold architecture",
      duration: "2-3 days",
      bestTime: "October to March",
      rating: 4.9,
      activities: ["Golden Temple visit", "Langar experience", "Wagah Border ceremony", "Jallianwala Bagh"]
    },
    { 
      id: 4, 
      title: "Bodh Gaya Meditation", 
      image: "https://images.unsplash.com/photo-1593696140827-3f7f53e3e66e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60",
      description: "Meditate at the place where Buddha attained enlightenment under the Bodhi Tree",
      duration: "4-7 days",
      bestTime: "November to February",
      rating: 4.7,
      activities: ["Mahabodhi Temple visit", "Meditation sessions", "Buddhist monasteries tour", "Rural village walks"]
    },
    { 
      id: 5, 
      title: "Tirupati Temple Visit", 
      image: "https://images.unsplash.com/photo-1626449876981-2f093c73e7d6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60",
      description: "One of the world's richest temples dedicated to Lord Venkateswara on the seven hills",
      duration: "2-3 days",
      bestTime: "September to February",
      rating: 4.8,
      activities: ["Darshan at Tirumala temple", "Padmavati Temple visit", "Chandragiri Fort", "ISKCON temple"]
    },
    { 
      id: 6, 
      title: "Puri Rath Yatra", 
      image: "https://images.pexels.com/photos/9741801/pexels-photo-9741801.jpeg?auto=compress&cs=tinysrgb&w=800",
      description: "Witness the grand chariot festival of Lord Jagannath, one of India's most celebrated religious events",
      duration: "3-5 days",
      bestTime: "June-July (during Rath Yatra)",
      rating: 4.9,
      activities: ["Rath Yatra procession", "Jagannath Temple visit", "Puri beach", "Local crafts shopping"]
    },
    { 
      id: 7, 
      title: "Haridwar Spiritual Journey", 
      image: "https://images.unsplash.com/photo-1609948543931-5bf9bb19a2e8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60",
      description: "Experience the ancient city where the Ganges descends to the plains from the mountains",
      duration: "3-4 days",
      bestTime: "February to March, September to November",
      rating: 4.7,
      activities: ["Har Ki Pauri Ganga Aarti", "Mansa Devi Temple", "Chandi Devi Temple", "Ashram visits"]
    },
    { 
      id: 8, 
      title: "Ajmer Sharif Dargah", 
      image: "https://images.unsplash.com/photo-1621416894569-0f39ed31d247?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60",
      description: "Visit the revered Sufi shrine of Khwaja Moinuddin Chishti, attracting devotees of all faiths",
      duration: "2-3 days",
      bestTime: "October to March",
      rating: 4.6,
      activities: ["Dargah visit", "Qawwali performances", "Ana Sagar Lake", "Taragarh Fort"]
    },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const newFormData = { ...formData, [name]: value };

    // Date validation
    if (name === 'startDate' || name === 'endDate') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const start = new Date(newFormData.startDate);
      const end = new Date(newFormData.endDate);
      
      if (newFormData.startDate && start < today) {
        setDateError('Start date cannot be before today');
      } else if (newFormData.startDate && newFormData.endDate && start > end) {
        setDateError('Start date must be before end date');
      } else {
        setDateError('');
      }
    }

    setFormData(newFormData);
  };

  const nextStep = () => {
    if (step === 1 && dateError) return; // Prevent moving to next step if there's a date error
    if (step < 3) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    if (dateError) return; // Prevent submission if there's a date error
    if (!formData.tripName || !formData.startDate || !formData.endDate) {
      setSubmitError('Please fill in all required fields');
      return;
    }
    
    setIsSubmitting(true);
    setSubmitError('');
    
    try {
      const response = await axiosInstance.post(API_ROUTES.trips.create, {
        title: formData.tripName,
        description: formData.destination,
        startDate: formData.startDate,
        endDate: formData.endDate,
        isPublic: false
      });
      
      toast.success('Trip created successfully!');
      // Redirect to trips page or show success message
      navigate('/trips');
    } catch (error) {
      console.error('Error creating trip:', error);
      setSubmitError(error.response?.data?.message || 'Failed to create trip. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Trip Name</label>
              <div className="input-icon-wrapper">
                <MapPin className="input-icon" size={18} />
                <input
                  type="text"
                  name="tripName"
                  value={formData.tripName}
                  onChange={handleInputChange}
                  className="w-full p-4 bg-white rounded-lg border border-gray-300 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 input-focus input-with-icon shadow-sm"
                  placeholder="Enter your spiritual journey name"
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">Give your spiritual journey a meaningful name that reflects your intentions</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                <div className="input-icon-wrapper">
                  <Calendar className="input-icon" size={18} />
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    className={`w-full p-4 bg-white rounded-lg border ${dateError ? 'border-red-500' : 'border-gray-300'} text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 input-focus input-with-icon shadow-sm`}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                <div className="input-icon-wrapper">
                  <Calendar className="input-icon" size={18} />
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    className={`w-full p-4 bg-white rounded-lg border ${dateError ? 'border-red-500' : 'border-gray-300'} text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 input-focus input-with-icon shadow-sm`}
                  />
                </div>
              </div>
            </div>
            
            {dateError && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{dateError}</p>
                  </div>
                </div>
              </div>
            )}
            
            {submitError && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{submitError}</p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded mt-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-700">You can also select a destination from our suggestions below to pre-fill your trip details.</p>
                </div>
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Destination Details</label>
              <div className="input-icon-wrapper">
                <MapPin className="input-icon" size={18} style={{ top: '1.25rem' }} />
                <textarea
                  name="destination"
                  value={formData.destination}
                  onChange={handleInputChange}
                  className="w-full h-64 p-4 pl-10 bg-white rounded-lg border border-gray-300 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 input-focus shadow-sm"
                  placeholder="Describe the spiritual destinations you want to visit and your intentions for this journey..."
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">Include any specific temples, rituals, or spiritual practices you're interested in experiencing</p>
            </div>
            
            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded mt-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">Consider including information about dietary preferences, accommodation requirements, and any specific spiritual guides or teachers you'd like to meet.</p>
                </div>
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">Confirm Your Spiritual Journey</h3>
            
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                  <MapPin className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-gray-800">{formData.tripName || 'Not provided'}</h4>
                  <p className="text-sm text-gray-500">Your spiritual journey</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="flex items-start">
                  <Calendar className="h-5 w-5 text-gray-500 mt-0.5 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">START DATE</p>
                    <p className="text-gray-800 font-medium">
                      {formData.startDate ? new Date(formData.startDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'Not provided'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Calendar className="h-5 w-5 text-gray-500 mt-0.5 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">END DATE</p>
                    <p className="text-gray-800 font-medium">
                      {formData.endDate ? new Date(formData.endDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'Not provided'}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="border-t border-gray-200 pt-6">
                <div className="flex items-start">
                  <MapPin className="h-5 w-5 text-gray-500 mt-0.5 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">DESTINATION DETAILS</p>
                    <p className="text-gray-800 whitespace-pre-line">{formData.destination || 'Not provided'}</p>
                  </div>
                </div>
              </div>
              
              {formData.startDate && formData.endDate && (
                <div className="mt-6 bg-green-50 p-4 rounded-lg">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <Clock className="h-5 w-5 text-green-500" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-green-700">
                        Your journey will last approximately {Math.ceil((new Date(formData.endDate) - new Date(formData.startDate)) / (1000 * 60 * 60 * 24))} days
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-700">After creating your trip, you'll be able to add specific activities, accommodations, and transportation details.</p>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <style>
        {`
          .gradient-overlay {
            background: linear-gradient(to top, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.2), transparent);
          }
          .fade-in {
            animation: fadeIn 0.6s ease-in;
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .card-hover:hover {
            transform: translateY(-5px);
            box-shadow: 0 12px 20px rgba(0, 0, 0, 0.15);
            transition: all 0.3s ease;
          }
          .input-focus {
            transition: all 0.3s ease;
          }
          .input-focus:focus {
            box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.2);
          }
          .step-indicator {
            display: flex;
            justify-content: center;
            gap: 1.5rem;
            margin-bottom: 2rem;
            position: relative;
          }
          .step-indicator::before {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            height: 2px;
            width: 60%;
            background-color: #e5e7eb;
            z-index: 0;
          }
          .step {
            width: 3rem;
            height: 3rem;
            border-radius: 50%;
            background-color: #e5e7eb;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            color: #6b7280;
            transition: all 0.3s ease;
            position: relative;
            z-index: 1;
            border: 2px solid #e5e7eb;
          }
          .step.active {
            background-color: #22c55e;
            color: white;
            border-color: #22c55e;
            box-shadow: 0 0 0 4px rgba(34, 197, 94, 0.2);
          }
          .step.completed {
            background-color: #22c55e;
            color: white;
            border-color: #22c55e;
          }
          .destination-card {
            height: 100%;
            display: flex;
            flex-direction: column;
          }
          .destination-card-body {
            padding: 1.25rem;
            flex-grow: 1;
            display: flex;
            flex-direction: column;
          }
          .destination-card-footer {
            padding: 1rem 1.25rem;
            background-color: #f9fafb;
            border-top: 1px solid #e5e7eb;
          }
          .rating-stars {
            color: #f59e0b;
          }
          .activity-tag {
            display: inline-block;
            background-color: #f3f4f6;
            border-radius: 9999px;
            padding: 0.25rem 0.75rem;
            font-size: 0.75rem;
            font-weight: 500;
            color: #4b5563;
            margin-right: 0.5rem;
            margin-bottom: 0.5rem;
          }
          .form-container {
            background-image: url('https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80');
            background-size: cover;
            background-position: center;
            position: relative;
          }
          .form-container::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.85) 100%);
            border-radius: inherit;
          }
          .form-content {
            position: relative;
            z-index: 1;
          }
          .input-icon-wrapper {
            position: relative;
          }
          .input-icon {
            position: absolute;
            left: 1rem;
            top: 50%;
            transform: translateY(-50%);
            color: #9ca3af;
          }
          .input-with-icon {
            padding-left: 2.75rem !important;
          }
          .btn-primary {
            background-color: #22c55e;
            color: white;
            font-weight: 600;
            padding: 0.75rem 1.5rem;
            border-radius: 0.5rem;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s ease;
            box-shadow: 0 4px 6px rgba(34, 197, 94, 0.12);
          }
          .btn-primary:hover {
            background-color: #16a34a;
            transform: translateY(-1px);
            box-shadow: 0 6px 8px rgba(34, 197, 94, 0.15);
          }
          .btn-primary:active {
            background-color: #15803d;
            transform: translateY(0);
          }
          .btn-secondary {
            background-color: #f3f4f6;
            color: #4b5563;
            font-weight: 600;
            padding: 0.75rem 1.5rem;
            border-radius: 0.5rem;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s ease;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
          }
          .btn-secondary:hover {
            background-color: #e5e7eb;
            transform: translateY(-1px);
            box-shadow: 0 6px 8px rgba(0, 0, 0, 0.08);
          }
          .btn-secondary:active {
            background-color: #d1d5db;
            transform: translateY(0);
          }
          .section-title {
            position: relative;
            display: inline-block;
            margin-bottom: 2rem;
          }
          .section-title::after {
            content: '';
            position: absolute;
            bottom: -0.5rem;
            left: 0;
            width: 3rem;
            height: 0.25rem;
            background-color: #22c55e;
            border-radius: 9999px;
          }
        `}
      </style>
      <div className="w-full max-w-full flex flex-col items-center mx-auto p-6 fade-in bg-gray-50 min-h-screen">
        <h1 className="text-4xl font-extrabold text-gray-800 mb-2 text-center tracking-tight">
          Plan Your Next Adventure
        </h1>
        <p className="text-gray-600 text-center max-w-2xl mb-10">Create a personalized spiritual journey to connect with your inner self and explore sacred destinations across India</p>
        
        <div className="form-container bg-white min-w-full p-8 rounded-2xl shadow-lg border border-gray-200 mb-12">
          <div className="form-content">
            <div className="step-indicator">
              <div className={`step ${step === 1 ? 'active' : step > 1 ? 'completed' : ''}`}>1</div>
              <div className={`step ${step === 2 ? 'active' : step > 2 ? 'completed' : ''}`}>2</div>
              <div className={`step ${step === 3 ? 'active' : ''}`}>3</div>
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">GlobalTrotter</h2>
            <p className="text-gray-600 mb-6">Your spiritual journey begins here</p>
            {renderStep()}
            <div className="flex justify-between mt-8">
              {step > 1 && (
                <button
                  onClick={prevStep}
                  className="btn-secondary"
                >
                  <ArrowLeft size={18} className="mr-2" /> Previous
                </button>
              )}
              {step < 3 ? (
                <button
                  onClick={nextStep}
                  className={`btn-primary ml-auto ${dateError ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={dateError}
                >
                  Next <ArrowRight size={18} className="ml-2" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  className={`btn-primary ml-auto ${(dateError || isSubmitting) ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={dateError || isSubmitting}
                >
                  {isSubmitting ? 'Creating...' : 'Create New Trip'}
                </button>
              )}
            </div>
          </div>
        </div>
        
        <div className="w-full mb-16">
          <h3 className="section-title text-3xl font-bold text-gray-800">Spiritual Destinations</h3>
          <p className="text-gray-600 mb-8">Discover sacred places that offer unique spiritual experiences and cultural immersion</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {suggestions.map((suggestion) => (
              <div
                key={suggestion.id}
                className="card-hover bg-white rounded-xl overflow-hidden shadow-md cursor-pointer destination-card"
                onClick={() => {
                  setFormData({
                    ...formData,
                    tripName: `Trip to ${suggestion.title}`,
                    destination: `${suggestion.title}: ${suggestion.description}`
                  });
                  toast.success(`${suggestion.title} added to your trip!`);
                }}
              >
                <div className="relative">
                  <img
                    src={suggestion.image}
                    alt={suggestion.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute inset-0 gradient-overlay"></div>
                  <h4 className="absolute bottom-4 left-4 text-white font-bold text-xl drop-shadow-md">
                    {suggestion.title}
                  </h4>
                  <div className="absolute top-4 right-4 bg-white bg-opacity-90 rounded-full px-2 py-1 flex items-center">
                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    <span className="ml-1 text-sm font-medium">{suggestion.rating}</span>
                  </div>
                </div>
                
                <div className="destination-card-body">
                  <p className="text-gray-600 text-sm mb-4">{suggestion.description}</p>
                  
                  <div className="flex items-center mb-2">
                    <Clock className="h-4 w-4 text-gray-500 mr-2" />
                    <span className="text-sm text-gray-700">{suggestion.duration}</span>
                  </div>
                  
                  <div className="flex items-center mb-4">
                    <Calendar className="h-4 w-4 text-gray-500 mr-2" />
                    <span className="text-sm text-gray-700">Best time: {suggestion.bestTime}</span>
                  </div>
                  
                  <div className="mt-auto">
                    <p className="text-xs font-medium text-gray-500 mb-2">ACTIVITIES:</p>
                    <div>
                      {suggestion.activities.slice(0, 2).map((activity, index) => (
                        <span key={index} className="activity-tag">{activity}</span>
                      ))}
                      {suggestion.activities.length > 2 && (
                        <span className="text-xs text-gray-500">+{suggestion.activities.length - 2} more</span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="destination-card-footer">
                  <button className="w-full text-green-600 font-medium text-sm hover:text-green-700 transition-colors flex items-center justify-center">
                    Add to Trip <ArrowRight size={16} className="ml-1" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* </div> */}
    </>
  );
};

export default CreateNewTrip;