import React, { useEffect, useState } from 'react'
import ImageCarousel from '../components/common/ImageBanner';
import HighlightImages, { famousPlacesGujarat, indianStates } from '../DataCenter/HighlighImages';
import PlaceCard from '../components/common/PlaceDetailCard';
import CardCarousel from '../components/common/GenericImageCardHolder';
import { getTopPlaces } from '../utils/GetTopPlaces';
import NearbyFamousPlaces from '../components/common/NearbyFamousPlaces';
import OpenRouterChat from '../components/common/test';
import StateCard from '../components/common/StateCard';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Dashboard = () => {

    const [location, setLocation] = useState();
    const [locationError, setLocationError] = useState(null);
    const [places, setPlaces] = useState([]);

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




    return (
        <div>
            <div className='p-10 flex flex-col gap-12'>
                <ImageCarousel items={HighlightImages} />

                <div>
                    <CardCarousel heading={"Discover States of India"} children={<>
                        {
                            indianStates.map((ele, id) => {
                                return (
                                    <StateCard details={ele} />
                                )
                            })
                        }
                    </>} />
                </div>

                <div>
                    <CardCarousel heading={"Religious Places"} children={<>
                        {
                            famousPlacesGujarat.map((ele, id) => {
                                return (
                                    <PlaceCard details={ele} />
                                )
                            })
                        }
                    </>} />
                </div>
                {
                    !location && <LoadingSpinner />
                }

                {   
               
                    location && <OpenRouterChat prompt={`List all the nearby famous places to visit near the longitude ${location.lon} and latitude ${location.lat} make sure to give response in form of 
                    [
                    {
                          name: "Dholavira Archaeological Site",
                          imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT0nsSmyC7uiZGEvmBcxYVwZWgOrxaFHFnVebhR3N1ZURqeqjMWoIxf7Mt_qasZV7Pb6F0&usqp=CAU",
                          location: "Kutch, Gujarat",
                          bestTime: "October - March",
                          weather: "12°C - 25°C",
                          activities: "Heritage Tours, Archaeology",
                          rating: "★★★★☆ (4.8/5)",
                          maplink: "https://www.google.com/maps/search/?api=1&query=}"
                        }
                    ]
                    
                    this type of array of object 
                    give only array of object in response`} />
                }
            </div>
        </div>
    )
}

export default Dashboard
