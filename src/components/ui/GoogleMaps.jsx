import React, { useState, useCallback } from 'react';
import { LoadScript } from '@react-google-maps/api';
import { CircularProgress, Box } from '@mui/material';

const libraries = ['places'];

const GoogleMapsProvider = ({ children }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState(null);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
  }, []);

  const handleError = useCallback((error) => {
    setLoadError(error);
    console.error('Google Maps loading error:', error);
  }, []);

  if (loadError) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          height: '100vh',
          color: 'error.main',
          fontFamily: 'Lexend'
        }}
      >
        Error loading Google Maps
      </Box>
    );
  }

  return (
    <LoadScript
      googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
      libraries={libraries}
      onLoad={handleLoad}
      onError={handleError}
      loadingElement={
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            height: '100vh'
          }}
        >
          <CircularProgress />
        </Box>
      }
    >
      {isLoaded ? children : null}
    </LoadScript>
  );
};

export default GoogleMapsProvider;