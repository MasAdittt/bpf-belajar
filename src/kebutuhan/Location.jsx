import React, { useState, useCallback } from 'react';
import { GoogleMap, Marker } from '@react-google-maps/api';

const defaultCenter = { lat: -8.4095, lng: 115.1889 }; 

const LocationPicker = ({ 
    initialLocation, 
    onLocationSelect,
    address,
    city,
    district,
    onAddressFieldFocus
}) => {
    const [position, setPosition] = useState(initialLocation || defaultCenter);
    const [map, setMap] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [markerKey, setMarkerKey] = useState(Date.now()); // Tambah state untuk marker key

    const containerStyle = {
        width: '100%',
        height: '400px',
        borderRadius: '8px'
    };

    const searchLocation = async (searchAddress, searchCity, searchDistrict) => {
        if (!searchAddress || !searchCity || !searchDistrict || !window.google) {
            setError('Alamat tidak lengkap');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const geocoder = new window.google.maps.Geocoder();
            const searchQuery = `${searchAddress}, ${searchDistrict}, ${searchCity}, Bali, Indonesia`;

            geocoder.geocode({ address: searchQuery }, (results, status) => {
                if (status === 'OK' && results[0]) {
                    const newPos = {
                        lat: results[0].geometry.location.lat(),
                        lng: results[0].geometry.location.lng()
                    };
                    setPosition(newPos);
                    setMarkerKey(Date.now()); // Update marker key
                    onLocationSelect(newPos);
                    
                    if (map) {
                        map.panTo(newPos);
                        map.setZoom(16);
                    }
                } else {
                    setError('Lokasi tidak ditemukan');
                }
                setIsLoading(false);
            });
        } catch (error) {
            setError('Gagal mencari lokasi');
            setIsLoading(false);
        }
    };

    const onMapClick = (e) => {
        const newPos = {
            lat: e.latLng.lat(),
            lng: e.latLng.lng()
        };
        setPosition(newPos);
        setMarkerKey(Date.now()); // Update marker key
        onLocationSelect(newPos);
    };

    const onMarkerDragEnd = (e) => {
        const newPos = {
            lat: e.latLng.lat(),
            lng: e.latLng.lng()
        };
        setPosition(newPos);
        setMarkerKey(Date.now()); // Update marker key
        onLocationSelect(newPos);
    };

    const onLoad = useCallback((mapInstance) => {
        setMap(mapInstance);
    }, []);

    // Effect untuk menangani perubahan initialLocation
    React.useEffect(() => {
        if (initialLocation) {
            setPosition(initialLocation);
            setMarkerKey(Date.now());
            if (map) {
                map.panTo(initialLocation);
                map.setZoom(16);
            }
        }
    }, [initialLocation, map]);

    // Effect untuk pencarian alamat
    React.useEffect(() => {
        if (address && city && district) {
            searchLocation(address, city, district);
        }
    }, [address, city, district]);

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

            {error && (
                <div style={{
                    position: 'absolute',
                    top: '10px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 1000,
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    padding: '8px 16px',
                    borderRadius: '4px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                    color: '#dc2626',
                    fontSize: '14px'
                }}>
                    {error}
                </div>
            )}

            <GoogleMap
                mapContainerStyle={containerStyle}
                center={position}
                zoom={13}
                onClick={onMapClick}
                onLoad={onLoad}
                options={{
                    streetViewControl: false,
                    mapTypeControl: false,
                    fullscreenControl: true,
                    zoomControl: true,
                }}
            >
                {position && (
                    <Marker
                        key={markerKey}
                        position={position}
                        draggable={true}
                        onDragEnd={onMarkerDragEnd}
                        visible={true}
                    />
                )}
            </GoogleMap>
        </div>
    );
};

export default LocationPicker;