import React, { useEffect, useState } from 'react'
import ImageCarousel from '../components/common/ImageBanner';
import HighlightImages, { famousPlacesGujarat, indianStates } from '../DataCenter/HighlighImages';
import PlaceCard from '../components/common/PlaceDetailCard';
import CardCarousel from '../components/common/GenericImageCardHolder';
import { getTopPlaces } from '../utils/GetTopPlaces';
import NearbyFamousPlaces from '../components/common/NearbyFamousPlaces';
import StateCard from '../components/common/StateCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { Link } from 'react-router-dom';
import CitySearch from '../components/common/CitySearch';
import TripAnalytics from '../components/analytics/TripAnalytics';
import PopularDestinations from '../components/analytics/PopularDestinations';
import UpcomingTrips from '../components/analytics/UpcomingTrips';
import TravelRecommendations from '../components/analytics/TravelRecommendations';
import { useAuth } from '../hooks/useAuth';

const Dashboard = () => {
    const { isAuthenticated, user } = useAuth();
    const [location, setLocation] = useState();
    const [locationError, setLocationError] = useState(null);
    const [places, setPlaces] = useState([]);
    const [selectedCities, setSelectedCities] = useState([]); // State to track selected cities
    const [showAnalytics, setShowAnalytics] = useState(true); // Control visibility of analytics section

    useEffect(() => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLocation({
                        lat: position.coords.latitude,
                        lon: position.coords.longitude,
                    });
                },
                (error) => {
                    setLocationError(error.message);
                }
            );
        } else {
            setLocationError("Geolocation is not supported by your browser.");
        }
    }, []);

    // Handle adding cities to trip
    const handleAddToTrip = (city) => {
        setSelectedCities(prev => [...prev, city]);
    };

    return (
        <div>
            <div className='p-6 md:p-10 flex flex-col gap-8 md:gap-12'>
                {/* Hero Banner */}
                <ImageCarousel items={HighlightImages} />

                {/* Analytics Section for authenticated users */}
                {/* {isAuthenticated && showAnalytics && (
                    <div className="mb-4">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-800">Your Travel Dashboard</h2>
                            <button 
                                onClick={() => setShowAnalytics(!showAnalytics)}
                                className="text-blue-600 text-sm font-medium hover:underline"
                            >
                                {showAnalytics ? 'Hide Analytics' : 'Show Analytics'}
                            </button>
                        </div>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                            <TripAnalytics />
                            <div className="space-y-6">
                                <UpcomingTrips />
                            </div>
                        </div>
                    </div>
                )} */}

                {/* City Search Component */}
                <CitySearch onAddToTrip={handleAddToTrip} />

                {/* Popular Destinations */}
                <PopularDestinations />

                {/* Travel Recommendations */}
                <TravelRecommendations />

                {/* Discover States of India */}
                <div>
                    <CardCarousel heading={"Discover States of India"} children={<>
                        {
                            indianStates.map((ele, id) => {
                                return (
                                    <StateCard details={ele} key={id} />
                                )
                            })
                        }
                    </>} />
                </div>

                {/* Religious Places */}
                <div>
                    <CardCarousel heading={"Religious Places"} children={<>
                        {
                            famousPlacesGujarat.map((ele, id) => {
                                return (
                                    <PlaceCard details={ele} key={id} />
                                )
                            })
                        }
                    </>} />
                </div>
            </div>
            
            {/* Floating Action Button */}
            <div className="fixed right-4 bottom-4 flex flex-col space-y-2">
                <Link to={"/onboarding/newtrip"} className="bg-green-600 text-white font-extrabold px-6 py-3 rounded-xl shadow-lg hover:bg-green-700 active:bg-green-800 backdrop-blur-md transition-all duration-300 ease-in-out text-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-50">
                    Create New Trip
                </Link>
            </div>
        </div>
    )
}

export default Dashboard
