import React, { useState, useEffect } from 'react';
import { MapPin, Calendar, Cloud, Star, Loader2, AlertCircle } from 'lucide-react';

const NearbyFamousPlaces = ({ latitude, longitude }) => {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedCards, setExpandedCards] = useState(new Set());

  const fetchNearbyPlaces = async () => {
    try {
      setLoading(true);
      setError(null);

      const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
      
      if (!apiKey) {
        throw new Error('OpenRouter API key is not configured. Please add VITE_OPENROUTER_API_KEY to your .env file.');
      }

      const prompt = `List the top 10 most famous places near latitude: ${latitude} and longitude: ${longitude} in JSON format with imageUrl, location, bestTime, weather, rating, name, and short_desc fields. Return only the JSON array without any additional text or formatting.`;

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Nearby Famous Places'
        },
        body: JSON.stringify({
          model: 'meta-llama/llama-3.1-8b-instruct:free',
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 2000
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      
      if (!content) {
        throw new Error('No content received from API');
      }

      // Try to parse JSON from the response
      let jsonMatch = content.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        // If no JSON array found, try to extract it differently
        jsonMatch = content.match(/```json\s*($$   [\s\S]*   $$)\s*```/);
        if (jsonMatch) {
          jsonMatch[0] = jsonMatch[1];
        }
      }

      if (!jsonMatch) {
        throw new Error('No valid JSON found in API response');
      }

      const placesData = JSON.parse(jsonMatch[0]);
      
      if (!Array.isArray(placesData)) {
        throw new Error('API response is not an array');
      }

      setPlaces(placesData);
    } catch (err) {
      console.error('Error fetching places:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNearbyPlaces();
  }, [latitude, longitude]);

  const toggleExpanded = (index) => {
    setExpandedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />);
    }

    if (hasHalfStar) {
      stars.push(
        <div key="half" className="relative">
          <Star className="w-4 h-4 text-gray-300" />
          <div className="absolute top-0 left-0 overflow-hidden w-1/2">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          </div>
        </div>
      );
    }

    const remainingStars = 5 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="w-4 h-4 text-gray-300" />);
    }

    return stars;
  };

  const truncateText = (text, maxLength) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Discovering amazing places near you...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Something went wrong</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={fetchNearbyPlaces}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          Famous Places Near You
        </h2>
        <p className="text-gray-600 text-lg">
          Discover amazing destinations at coordinates {latitude.toFixed(4)}, {longitude.toFixed(4)}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {places.map((place, index) => {
          const isExpanded = expandedCards.has(index);
          
          return (
            <div 
              key={index}
              className="bg-white rounded-xl shadow-md overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-xl"
            >
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={place.imageUrl} 
                  alt={place.name}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                  onError={(e) => {
                    e.target.src = `https://images.pexels.com/photos/1010657/pexels-photo-1010657.jpeg?auto=compress&cs=tinysrgb&w=400`;
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full flex items-center space-x-1">
                  {renderStars(place.rating)}
                  <span className="text-sm font-medium text-gray-700 ml-1">
                    {place.rating.toFixed(1)}
                  </span>
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2">
                  {place.name}
                </h3>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-gray-600 text-sm">
                    <MapPin className="w-4 h-4 mr-2 text-red-500 flex-shrink-0" />
                    <span className="truncate">{place.location}</span>
                  </div>
                  
                  <div className="flex items-center text-gray-600 text-sm">
                    <Calendar className="w-4 h-4 mr-2 text-green-500 flex-shrink-0" />
                    <span>{place.bestTime}</span>
                  </div>
                  
                  <div className="flex items-center text-gray-600 text-sm">
                    <Cloud className="w-4 h-4 mr-2 text-blue-500 flex-shrink-0" />
                    <span>{place.weather}</span>
                  </div>
                </div>
                
                <div className="text-gray-700 text-sm leading-relaxed">
                  {isExpanded ? (
                    <>
                      {place.short_desc}
                      <button 
                        onClick={() => toggleExpanded(index)}
                        className="text-blue-600 hover:text-blue-700 font-medium ml-1 transition-colors"
                      >
                        Read less
                      </button>
                    </>
                  ) : (
                    <>
                      {truncateText(place.short_desc, 100)}
                      {place.short_desc.length > 100 && (
                        <button 
                          onClick={() => toggleExpanded(index)}
                          className="text-blue-600 hover:text-blue-700 font-medium ml-1 transition-colors"
                        >
                          Read more
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {places.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No famous places found near these coordinates.</p>
        </div>
      )}
    </div>
  );
};

export default NearbyFamousPlaces;