import React, { useEffect, useState } from 'react'
import ImageCarousel from '../components/common/ImageBanner';
import HighlightImages from '../DataCenter/HighlighImages';
import PlaceCard from '../components/common/PlaceDetailCard';
import CardCarousel from '../components/common/GenericImageCardHolder';

const Dashboard = () => {

    const [location, setLocation] = useState(null);
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
            <div className='p-10'>
                <ImageCarousel items={HighlightImages} />
                <PlaceCard name="Taj Mahal" location="Agra, India" bestTime="March - May" weather="20°C - 30°C" activities="Sightseeing, Hiking, Local Cuisine" rating="★★★★☆ (4.5/5)" imageUrl="https://plus.unsplash.com/premium_photo-1661885523029-fc960a2bb4f3?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" />
                <CardCarousel heading={"Most Famous Places"} children={<PlaceCard name="Taj Mahal" location="Agra, India" bestTime="March - May" weather="20°C - 30°C" activities="Sightseeing, Hiking, Local Cuisine" rating="★★★★☆ (4.5/5)" imageUrl="https://plus.unsplash.com/premium_photo-1661885523029-fc960a2bb4f3?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" />} />
            </div>
        </div>
    )
}

export default Dashboard
