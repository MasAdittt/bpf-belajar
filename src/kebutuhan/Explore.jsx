import React from 'react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import { MapPin } from 'lucide-react';

const DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const ExploreAreaMap = ({ location, address }) => {
    const position = location 
        ? [location.latitude, location.longitude]
        : [-8.4095, 115.1889];
    
    return (
        <div className="w-full relative">
            <h3 className="text-lg md:text-xl font-bold mb-4 font-['Quicksand']">
                Explore the Area
            </h3>
            <div className="relative w-full">
                <MapContainer
                    center={position}
                    zoom={15}
                    className="w-full h-48 md:h-64 rounded mb-4"
                    style={{ 
                        position: 'relative',
                        zIndex: 0 
                    }}
                >
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    <Marker position={position} />
                </MapContainer>
                <div className="flex items-center mt-3">
                    <MapPin size={16} color="#6B6B6B" className="flex-shrink-0 mr-2 top-3" />
                    <span className="text-sm text-gray-600 flex-grow font-lexend">{address}</span>
                </div>
            </div>
        </div>
    );
};

export default ExploreAreaMap;