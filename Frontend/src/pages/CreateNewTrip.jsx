import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import axiosInstance from '../api/axiosInstance';
import { API_ROUTES } from '../api/BACKENDROUTES';
import toast from 'react-hot-toast';

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
    { id: 1, title: "Varanasi Ganga Aarti", image: "https://images.unsplash.com/photo-1607500369969-4fadd3f7d156?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60" },
    { id: 2, title: "Rishikesh Yoga Retreat", image: "https://images.unsplash.com/photo-1613323149846-28b1f8a68666?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60" },
    { id: 3, title: "Amritsar Golden Temple", image: "https://images.unsplash.com/photo-1614966939290-66b3e4760a7b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60" },
    { id: 4, title: "Bodh Gaya Meditation", image: "https://images.unsplash.com/photo-1593696140827-3f7f53e3e66e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60" },
    { id: 5, title: "Tirupati Temple Visit", image: "https://images.unsplash.com/photo-1626449876981-2f093c73e7d6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60" },
    { id: 6, title: "Puri Rath Yatra", image: "https://images.pexels.com/photos/9741801/pexels-photo-9741801.jpeg?auto=compress&cs=tinysrgb&w=800" },
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
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">Trip Name</label>
              <input
                type="text"
                name="tripName"
                value={formData.tripName}
                onChange={handleInputChange}
                className="w-full p-3 bg-gray-100 rounded-lg border border-gray-300 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 input-focus"
                placeholder="Enter trip name"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Start Date</label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  className={`w-full p-3 bg-gray-100 rounded-lg border ${dateError ? 'border-red-500' : 'border-gray-300'} text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 input-focus`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">End Date</label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  className={`w-full p-3 bg-gray-100 rounded-lg border ${dateError ? 'border-red-500' : 'border-gray-300'} text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 input-focus`}
                />
              </div>
            </div>
            {dateError && (
              <p className="text-red-500 text-sm mt-2">{dateError}</p>
            )}
            {submitError && (
              <p className="text-red-500 text-sm mt-2">{submitError}</p>
            )}
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">Destination</label>
              <textarea
                name="destination"
                value={formData.destination}
                onChange={handleInputChange}
                className="w-full h-64 p-3 bg-gray-100 rounded-lg border border-gray-300 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 input-focus"
                placeholder="Enter destination"
              />
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-700">Confirm Your Trip Details</h3>
            <div className="bg-gray-100 p-4 rounded-lg">
              <p className="text-gray-800"><strong>Trip Name:</strong> {formData.tripName || 'Not provided'}</p>
              <p className="text-gray-800"><strong>Destination:</strong> {formData.destination || 'Not provided'}</p>
              <p className="text-gray-800"><strong>Start Date:</strong> {formData.startDate || 'Not provided'}</p>
              <p className="text-gray-800"><strong>End Date:</strong> {formData.endDate || 'Not provided'}</p>
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
            background: linear-gradient(to top, rgba(0, 0, 0, 0.5), transparent);
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
            box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
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
            gap: 1rem;
            margin-bottom: 1.5rem;
          }
          .step {
            width: 2.5rem;
            height: 2.5rem;
            border-radius: 50%;
            background-color: #e5e7eb;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            color: #6b7280;
            transition: all 0.3s ease;
          }
          .step.active {
            background-color: #22c55e;
            color: white;
          }
        `}
      </style>
      <div className="w-full max-w-full flex flex-col items-center mx-auto p-6 fade-in bg-gray-50 min-h-screen">
        <h1 className="text-4xl font-extrabold text-gray-800 mb-8 text-center tracking-tight">
          Plan Your Next Adventure
        </h1>
        <div className="bg-white min-w-full p-8 rounded-2xl shadow-md border border-gray-200">
          <div className="step-indicator">
            <div className={`step ${step === 1 ? 'active' : ''}`}>1</div>
            <div className={`step ${step === 2 ? 'active' : ''}`}>2</div>
            <div className={`step ${step === 3 ? 'active' : ''}`}>3</div>
          </div>
          <h2 className="text-2xl font-semibold text-gray-700 mb-6">GlobalTrotter</h2>
          {renderStep()}
          <div className="flex justify-between mt-6">
            {step > 1 && (
              <button
                onClick={prevStep}
                className="bg-gray-300 text-gray-800 font-semibold px-6 py-3 rounded-xl shadow-lg hover:bg-gray-400 transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50"
              >
                Previous
              </button>
            )}
            {step < 3 ? (
              <button
                onClick={nextStep}
                className={`bg-green-600 text-white font-extrabold px-6 py-3 rounded-xl shadow-lg hover:bg-green-700 active:bg-green-800 transition-all duration-300 ease-in-out ml-auto focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-50 ${dateError ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={dateError}
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className={`bg-green-600 text-white font-extrabold px-6 py-3 rounded-xl shadow-lg hover:bg-green-700 active:bg-green-800 transition-all duration-300 ease-in-out ml-auto focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-50 ${(dateError || isSubmitting) ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={dateError || isSubmitting}
              >
                {isSubmitting ? 'Creating...' : 'Create New Trip'}
              </button>
            )}
          </div>
        </div>
        <div className="mt-8 w-full">
          <h3 className="text-2xl font-semibold text-gray-700 mb-6">Suggested Destinations</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {suggestions.map((suggestion) => (
              <div
                key={suggestion.id}
                className="card-hover bg-white rounded-xl overflow-hidden shadow-md cursor-pointer"
              >
                <div className="relative">
                  <img
                    src={suggestion.image}
                    alt={suggestion.title}
                    className="w-full h-56 object-cover"
                  />
                  <div className="absolute inset-0 gradient-overlay"></div>
                  <h4 className="absolute bottom-4 left-4 text-white font-bold text-xl drop-shadow-md">
                    {suggestion.title}
                  </h4>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default CreateNewTrip;