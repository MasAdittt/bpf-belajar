import React from 'react';
import { GoogleMap, MarkerF } from '@react-google-maps/api';
import { MapPin } from 'lucide-react';

const ExploreAreaMap = ({ location, address }) => {
    const position = location
        ? { lat: location.latitude, lng: location.longitude }
        : { lat: -8.4095, lng: 115.1889 };

    const mapStyles = {
        width: "100%",
        height: "100%",
        borderRadius: "0.25rem"
    };

    const mapContainerStyle = {
        width: "100%",
        height: "12rem",
        position: "relative",
        zIndex: 0
    };

    const mapOptions = {
        zoomControl: false,
        mapTypeControl: false,
        scaleControl: false,
        streetViewControl: false,
        rotateControl: false,
        fullscreenControl: false,
        draggable: true,
        gestureHandling: 'greedy'
    };

    return (
        <div className="w-full relative">
            <h3 className="text-lg md:text-xl font-bold mb-4 font-['Quicksand']">
                Explore the Area
            </h3>
            <div className="relative w-full">
                <div className="w-full h-48 md:h-64 rounded mb-4" style={mapContainerStyle}>
                    <GoogleMap
                        mapContainerStyle={mapStyles}
                        zoom={15}
                        center={position}
                        options={mapOptions}
                    >
                        <MarkerF position={position} />
                    </GoogleMap>
                </div>
                <div className="flex items-center mt-3">
                    <MapPin size={16} color="#6B6B6B" className="flex-shrink-0 mr-2 top-3" />
                    <span className="text-sm text-gray-600 flex-grow font-lexend">{address}</span>
                </div>
            </div>
        </div>
    );
};

export default ExploreAreaMap;