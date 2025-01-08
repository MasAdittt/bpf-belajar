import React, { useState, useEffect, useCallback } from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

const defaultCenter = { lat: -8.4095, lng: 115.1889 }; // Default to Bali coordinates

const LocationPicker = ({
    initialLocation,
    onLocationSelect,
    address,
    city,
    district,
    onAddressFieldFocus
}) => {
    const [position, setPosition] = useState(
        initialLocation
            ? { lat: initialLocation.lat, lng: initialLocation.lng }
            : defaultCenter
    );
    const [zoom, setZoom] = useState(13);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [map, setMap] = useState(null);
    const [markerKey, setMarkerKey] = useState(Date.now());

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
            // Cek apakah Geocoding API tersedia
            if (!window.google.maps.Geocoder) {
                throw new Error('Geocoding service tidak tersedia');
            }

            const geocoder = new window.google.maps.Geocoder();
            const searchQuery = `${searchAddress}, ${searchDistrict}, ${searchCity}, Bali, Indonesia`;

            geocoder.geocode({ address: searchQuery }, (results, status) => {
                if (status === 'OK' && results[0]) {
                    const newPos = {
                        lat: results[0].geometry.location.lat(),
                        lng: results[0].geometry.location.lng()
                    };
                    setPosition(newPos);
                    setZoom(16);
                    setMarkerKey(Date.now());
                    onLocationSelect(newPos);
                    if (map) {
                        map.panTo(newPos);
                        map.setZoom(16);
                    }
                } else {
                    // Handle berbagai status error dari Geocoding API
                    switch (status) {
                        case 'ZERO_RESULTS':
                            setError('Lokasi tidak ditemukan');
                            break;
                        case 'OVER_QUERY_LIMIT':
                            setError('Terlalu banyak permintaan, coba lagi nanti');
                            break;
                        case 'REQUEST_DENIED':
                            setError('Silakan pilih lokasi secara manual dengan mengklik peta');
                            break;
                        default:
                            setError('Terjadi kesalahan saat mencari lokasi');
                    }
                }
                setIsLoading(false);
            });
        } catch (error) {
            console.error('Error searching location:', error);
            setError('Silakan pilih lokasi secara manual dengan mengklik peta');
            setIsLoading(false);
        }
    };

    const handleAddressFieldFocus = useCallback(() => {
        if (address && city && district) {
            searchLocation(address, city, district);
        }
    }, [address, city, district]);

    useEffect(() => {
        if (address && city && district) {
            searchLocation(address, city, district);
        }
    }, [address, city, district]);

    useEffect(() => {
        if (onAddressFieldFocus) {
            onAddressFieldFocus((searchQuery) => {
                if (searchQuery) {
                    searchLocation(searchQuery);
                }
            });
        }
    }, [onAddressFieldFocus]);

    const onMapClick = (e) => {
        const newPos = {
            lat: e.latLng.lat(),
            lng: e.latLng.lng()
        };
        setPosition(newPos);
        setMarkerKey(Date.now());
        onLocationSelect(newPos);
        setError(''); // Clear any existing errors when user manually selects location
    };

    const onMarkerDragEnd = (e) => {
        const newPos = {
            lat: e.latLng.lat(),
            lng: e.latLng.lng()
        };
        setPosition(newPos);
        setMarkerKey(Date.now());
        onLocationSelect(newPos);
        setError(''); // Clear any existing errors when user manually selects location
    };

    const onLoad = useCallback((map) => {
        setMap(map);
    }, []);

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

              <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
                <GoogleMap
                    mapContainerStyle={containerStyle}
                    center={position}
                    zoom={zoom}
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
            </LoadScript>
        </div>
    );
};

export default LocationPicker;