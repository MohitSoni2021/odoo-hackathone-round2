import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_ROUTES } from '../api/BACKENDROUTES';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useAuth } from '../hooks/useAuth';

const ViewTrip = () => {
  const { id } = useParams();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { isAuthenticated, token } = useAuth();
  const [activeTab, setActiveTab] = useState('timeline');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchTrip = async () => {
      try {
        setLoading(true);
        const response = await axios.get(API_ROUTES.trips.getById(id), {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setTrip(response.data.trip);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch trip details. Please try again.');
        setLoading(false);
      }
    };

    fetchTrip();
  }, [id, isAuthenticated, navigate, token]);

  const handleDeleteStop = async (stopId) => {
    if (window.confirm('Are you sure you want to delete this stop?')) {
      try {
        await axios.delete(API_ROUTES.trips.deleteStop(id, stopId), {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        // Update the trip state by removing the deleted stop
        setTrip({
          ...trip,
          stops: trip.stops.filter(stop => stop._id !== stopId)
        });
      } catch (err) {
        setError('Failed to delete stop. Please try again.');
      }
    }
  };

  const handleDeleteActivity = async (stopId, activityId) => {
    if (window.confirm('Are you sure you want to delete this activity?')) {
      try {
        await axios.delete(API_ROUTES.trips.deleteActivity(id, stopId, activityId), {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        // Update the trip state by removing the deleted activity
        setTrip({
          ...trip,
          stops: trip.stops.map(stop => {
            if (stop._id === stopId) {
              return {
                ...stop,
                activities: stop.activities.filter(activity => activity._id !== activityId)
              };
            }
            return stop;
          })
        });
      } catch (err) {
        setError('Failed to delete activity. Please try again.');
      }
    }
  };

  const handleEditTrip = () => {
    navigate(`/trips/${id}/edit`);
  };

  const handleAddStop = () => {
    navigate('/onboarding/newstop', { state: { tripId: id } });
  };

  const handleAddActivity = () => {
    navigate('/onboarding/newactivity', { state: { tripId: id } });
  };

  if (loading) return <LoadingSpinner />;

  if (!trip) {
    return (
      <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error || 'Trip not found'}
        </div>
        <button 
          onClick={() => navigate('/trips')} 
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
        >
          Back to Trips
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
      {/* Trip Header */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
        {trip.coverImage && (
          <div className="relative h-64 w-full">
            <img 
              src={trip.coverImage} 
              alt={trip.title} 
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <div className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">{trip.title}</h1>
              <p className="text-gray-600 mb-4">{trip.description || 'No description provided'}</p>
              <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                <span className="flex items-center">
                  <i className="far fa-calendar mr-2"></i>
                  {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}
                </span>
                <span className="flex items-center">
                  <i className="fas fa-map-marker-alt mr-2"></i>
                  {trip.stops?.length || 0} stops
                </span>
                <span className="flex items-center">
                  <i className="fas fa-dollar-sign mr-2"></i>
                  Budget: ${trip.budget?.total || 0}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={handleEditTrip} 
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
              >
                Edit Trip
              </button>
              <button 
                onClick={() => navigate('/trips')} 
                className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors"
              >
                Back to Trips
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-md mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('timeline')}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${activeTab === 'timeline' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            >
              Timeline
            </button>
            <button
              onClick={() => setActiveTab('budget')}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${activeTab === 'budget' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            >
              Budget
            </button>
            <button
              onClick={() => setActiveTab('calendar')}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${activeTab === 'calendar' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            >
              Calendar
            </button>
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        {activeTab === 'timeline' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Trip Timeline</h2>
              <div className="flex gap-2">
                <button 
                  onClick={handleAddStop} 
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
                >
                  Add Stop
                </button>
                <button 
                  onClick={handleAddActivity} 
                  className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition-colors"
                >
                  Add Activity
                </button>
              </div>
            </div>

            {trip.stops && trip.stops.length > 0 ? (
              <div className="space-y-8">
                {trip.stops.map((stop, index) => (
                  <div key={stop._id} className="border-l-4 border-blue-500 pl-4 ml-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">{stop.city}, {stop.country}</h3>
                        <p className="text-sm text-gray-500">
                          {new Date(stop.startDate).toLocaleDateString()} - {new Date(stop.endDate).toLocaleDateString()}
                        </p>
                        {stop.description && <p className="text-gray-600 mt-1">{stop.description}</p>}
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => navigate(`/trips/${id}/stops/${stop._id}/edit`)} 
                          className="text-blue-600 hover:text-blue-800"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDeleteStop(stop._id)} 
                          className="text-red-600 hover:text-red-800"
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    {/* Activities */}
                    {stop.activities && stop.activities.length > 0 ? (
                      <div className="ml-4 mt-4 space-y-4">
                        {stop.activities.map((activity) => (
                          <div key={activity._id} className="bg-gray-50 p-4 rounded-lg">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-medium text-gray-800">{activity.title}</h4>
                                <p className="text-sm text-gray-500">Type: {activity.type}</p>
                                {activity.cost > 0 && <p className="text-sm text-gray-500">Cost: ${activity.cost}</p>}
                                {activity.duration && <p className="text-sm text-gray-500">Duration: {activity.duration}</p>}
                                {activity.notes && <p className="text-sm text-gray-600 mt-1">{activity.notes}</p>}
                                {activity.providerUrl && (
                                  <a 
                                    href={activity.providerUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="text-sm text-blue-600 hover:underline mt-1 inline-block"
                                  >
                                    Visit Provider
                                  </a>
                                )}
                              </div>
                              <div className="flex gap-2">
                                <button 
                                  onClick={() => navigate(`/trips/${id}/stops/${stop._id}/activities/${activity._id}/edit`)} 
                                  className="text-blue-600 hover:text-blue-800"
                                >
                                  Edit
                                </button>
                                <button 
                                  onClick={() => handleDeleteActivity(stop._id, activity._id)} 
                                  className="text-red-600 hover:text-red-800"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="ml-4 mt-2 text-sm text-gray-500">No activities added yet</div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No stops added to this trip yet</p>
                <button 
                  onClick={handleAddStop} 
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Add Your First Stop
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'budget' && (
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Trip Budget</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Budget Overview */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-medium text-gray-800 mb-4">Budget Overview</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Budget:</span>
                    <span className="font-medium">${trip.budget?.total || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Transport:</span>
                    <span className="font-medium">${trip.budget?.transport || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Accommodation:</span>
                    <span className="font-medium">${trip.budget?.stay || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Activities:</span>
                    <span className="font-medium">${trip.budget?.activities || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Meals:</span>
                    <span className="font-medium">${trip.budget?.meals || 0}</span>
                  </div>
                </div>
              </div>

              {/* Actual Expenses */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-medium text-gray-800 mb-4">Actual Expenses</h3>
                <div className="space-y-3">
                  {trip.stops && trip.stops.map((stop) => {
                    const stopTotal = stop.activities.reduce((sum, activity) => sum + (activity.cost || 0), 0);
                    return (
                      <div key={stop._id} className="flex justify-between">
                        <span className="text-gray-600">{stop.city}:</span>
                        <span className="font-medium">${stopTotal}</span>
                      </div>
                    );
                  })}
                  <div className="pt-2 border-t border-gray-200 flex justify-between font-semibold">
                    <span>Total Expenses:</span>
                    <span>
                      ${trip.stops?.reduce((total, stop) => {
                        return total + stop.activities.reduce((sum, activity) => sum + (activity.cost || 0), 0);
                      }, 0) || 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'calendar' && (
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Trip Calendar</h2>
            
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="flex flex-col space-y-4">
                {trip.stops && trip.stops.sort((a, b) => new Date(a.startDate) - new Date(b.startDate)).map((stop) => (
                  <div key={stop._id} className="border-l-4 border-blue-500 pl-4 py-2">
                    <h3 className="font-medium text-gray-800">{stop.city}, {stop.country}</h3>
                    <p className="text-sm text-gray-500">
                      {new Date(stop.startDate).toLocaleDateString()} - {new Date(stop.endDate).toLocaleDateString()}
                    </p>
                    
                    {stop.activities && stop.activities.length > 0 && (
                      <div className="mt-2 ml-4 space-y-2">
                        {stop.activities.map((activity) => (
                          <div key={activity._id} className="text-sm">
                            <span className="font-medium">{activity.title}</span>
                            {activity.duration && <span className="text-gray-500 ml-2">({activity.duration})</span>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewTrip;