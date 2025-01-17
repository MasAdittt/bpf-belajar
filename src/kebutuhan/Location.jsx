import React, { useState, useEffect, useCallback } from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

const defaultCenter = { lat: -8.4095, lng: 115.1889 };

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
    const [placeId, setPlaceId] = useState('');
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

    const getPlaceDetails = async (placeId) => {
        if (!window.google) {
            setError('Google Maps belum dimuat');
            return { rating: null, name: null, user_ratings_total: null };
        }

        try {
            const service = new window.google.maps.places.PlacesService(map);
            return new Promise((resolve, reject) => {
                service.getDetails({ placeId }, (result, status) => {
                    if (status === window.google.maps.places.PlacesServiceStatus.OK) {
                        const { rating, name, formatted_address, user_ratings_total } = result;
                        resolve({ rating, name, formatted_address, user_ratings_total });
                    } else {
                        console.error('Failed to fetch place details:', status);
                        reject({ rating: null, name: null, user_ratings_total: null });
                    }
                });
            });
        } catch (error) {
            console.error('Error fetching place details:', error);
            return { rating: null, name: null, user_ratings_total: null };
        }
    };

    const getPlaceId = async (lat, lng) => {
        if (!window.google) {
            setError('Google Maps belum dimuat');
            return;
        }

        try {
            const geocoder = new window.google.maps.Geocoder();
            const latlng = { lat, lng };

            const response = await new Promise((resolve, reject) => {
                geocoder.geocode({ location: latlng }, (results, status) => {
                    if (status === 'OK' && results && results[0]) {
                        resolve(results);
                    } else {
                        reject(status);
                    }
                });
            });

            if (response && response[0] && response[0].place_id) {
                const placeId = response[0].place_id;
                setPlaceId(placeId);

                const placeDetails = await getPlaceDetails(placeId);
                onLocationSelect({
                    lat,
                    lng,
                    place_id: placeId,
                    ...placeDetails, // Menyertakan rating, nama, dan total rating pengguna
                });
            } else {
                onLocationSelect({
                    lat,
                    lng,
                    place_id: null,
                });
            }
        } catch (error) {
            console.error('Error getting Place ID:', error);
            setError('Gagal mendapatkan Place ID');
            onLocationSelect({
                lat,
                lng,
                place_id: null,
            });
        }
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

            geocoder.geocode({ address: searchQuery }, async (results, status) => {
                if (status === 'OK' && results[0]) {
                    const newPos = {
                        lat: results[0].geometry.location.lat(),
                        lng: results[0].geometry.location.lng()
                    };
                    setPosition(newPos);
                    setZoom(16);
                    setMarkerKey(Date.now());
                    // Dapatkan Place ID untuk lokasi baru
                    await getPlaceId(newPos.lat, newPos.lng);
                    if (map) {
                        map.panTo(newPos);
                        map.setZoom(16);
                    }
                } else {
                    handleGeocodeError(status);
                }
                setIsLoading(false);
            });
        } catch (error) {
            console.error('Error searching location:', error);
            setError('Silakan pilih lokasi secara manual dengan mengklik peta');
            setIsLoading(false);
        }
    };

    const handleGeocodeError = (status) => {
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
    };

    const onMapClick = async (e) => {
        const newPos = {
            lat: e.latLng.lat(),
            lng: e.latLng.lng()
        };
        setPosition(newPos);
        setMarkerKey(Date.now());
        await getPlaceId(newPos.lat, newPos.lng);
        setError('');
    };

    const onMarkerDragEnd = async (e) => {
        const newPos = {
            lat: e.latLng.lat(),
            lng: e.latLng.lng()
        };
        setPosition(newPos);
        setMarkerKey(Date.now());
        await getPlaceId(newPos.lat, newPos.lng);
        setError('');
    };

    const onLoad = useCallback((map) => {
        setMap(map);
    }, []);

    useEffect(() => {
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

            <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY} libraries={['places']}>
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
