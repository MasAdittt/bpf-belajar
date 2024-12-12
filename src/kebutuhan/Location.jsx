// Location.jsx
import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

function MapUpdater({ center, zoom, onLocationSelect, position }) {
    const map = useMap();
    
    useEffect(() => {
        if (position) {
            map.setView(position, zoom);
        }
    }, [position, zoom, map]);

    useEffect(() => {
        map.on('click', (e) => {
            onLocationSelect(e.latlng);
        });

        return () => {
            map.off('click');
        };
    }, [map, onLocationSelect]);

    return null;
}

const LocationPicker = ({ 
    initialLocation, 
    onLocationSelect, 
    address,  // Tambahkan prop address
    city,     // Tambahkan prop city
    district, // Tambahkan prop district
    onAddressFieldFocus 
}) => {
    const [position, setPosition] = useState(
        initialLocation 
            ? [initialLocation.lat, initialLocation.lng]
            : [-8.4095, 115.1889]
    );
    const [zoom, setZoom] = useState(13);
    const [isLoading, setIsLoading] = useState(false);
    const mapRef = useRef(null);

    const searchLocation = async (searchAddress, searchCity, searchDistrict) => {
        if (!searchAddress || !searchCity || !searchDistrict) return;

        setIsLoading(true);
        try {
            const searchQuery = `${searchAddress}, ${searchDistrict}, ${searchCity}, Bali, Indonesia`;
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`,
                {
                    headers: {
                        'Accept-Language': 'en-US,en;q=0.9',
                    }
                }
            );
            
            if (!response.ok) throw new Error('Network response was not ok');
            
            const data = await response.json();
            
            if (data && data.length > 0) {
                const newPos = [parseFloat(data[0].lat), parseFloat(data[0].lon)];
                setPosition(newPos);
                setZoom(16);
                onLocationSelect({ lat: newPos[0], lng: newPos[1] });
            }
        } catch (error) {
            console.error('Error searching location:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Perbaiki handleAddressFieldFocus
    const handleAddressFieldFocus = () => {
        if (address && city && district) {
            searchLocation(address, city, district);
        }
    };

    useEffect(() => {
        if (address && city && district) {
            searchLocation(address, city, district);
        }
    }, [address, city, district]);

    useEffect(() => {
        if (onAddressFieldFocus) {
            onAddressFieldFocus(handleAddressFieldFocus);
        }
    }, [onAddressFieldFocus, address, city, district]);

    const handleMarkerDrag = (e) => {
        const newPos = e.target.getLatLng();
        setPosition([newPos.lat, newPos.lng]);
        onLocationSelect(newPos);
    };

    return (
        <div style={{ position: 'relative', height: '400px', width: '100%', marginBottom: '20px' }}>
            {isLoading && (
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    zIndex: 1000,
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    padding: '10px 20px',
                    borderRadius: '4px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }}>
                    Mencari lokasi...
                </div>
            )}

            <MapContainer
                center={position}
                zoom={zoom}
                style={{ height: '100%', width: '100%', borderRadius: '8px', zIndex: 1 }}
                ref={mapRef}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <Marker 
                    position={position}
                    draggable={true}
                    eventHandlers={{
                        dragend: handleMarkerDrag,
                    }}
                />
                <MapUpdater 
                    center={position} 
                    zoom={zoom} 
                    onLocationSelect={(latlng) => {
                        setPosition([latlng.lat, latlng.lng]);
                        onLocationSelect(latlng);
                    }}
                    position={position}
                />
            </MapContainer>
        </div>
    );
};

export default LocationPicker;