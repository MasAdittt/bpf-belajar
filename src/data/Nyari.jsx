import React, { useEffect, useState } from 'react';
import { Box, TextField, CircularProgress, List, ListItem, ListItemText, Paper } from '@mui/material';

const LocationSearchBar = ({ onPlaceSelect, isLoading, value, onInputChange }) => {
  const [searchQuery, setSearchQuery] = useState(value || '');  
  const [predictions, setPredictions] = useState([]);
  const [autocomplete, setAutocomplete] = useState(null);
  const [showPredictions, setShowPredictions] = useState(false);

  useEffect(() => {
    if (window.google) {
      const autocompleteService = new window.google.maps.places.AutocompleteService();
      setAutocomplete(autocompleteService);
    }
  }, []);

  useEffect(() => {
    if (value !== searchQuery) {
      setSearchQuery(value);
    }
  }, [value]);

  const handleInputChange = async (event) => {
    const value = event.target.value;
    setSearchQuery(value);
    onInputChange(value);

    if (!value.trim() || !autocomplete) {
      setPredictions([]);
      setShowPredictions(false);
      return;
    }

    try {
      const request = {
        input: value,
        componentRestrictions: { country: 'id' }, // Batasi untuk Indonesia saja
        types: ['establishment', 'geocode'] // Tipe tempat yang ingin ditampilkan
      };

      autocomplete.getPlacePredictions(request, (results, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
          setPredictions(results);
          setShowPredictions(true);
        } else {
          setPredictions([]);
          setShowPredictions(false);
        }
      });
    } catch (error) {
      console.error('Error getting predictions:', error);
    }
  };

  const handlePlaceSelect = async (prediction) => {
    try {
      const map = new window.google.maps.Map(document.createElement('div'));
      const placesService = new window.google.maps.places.PlacesService(map);

      placesService.getDetails({
        placeId: prediction.place_id,
        fields: ['name', 'formatted_address', 'geometry', 'rating', 'user_ratings_total', 'photos', 'url']
      }, (place, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK) {
          const placeDetails = {
            name: place.name,
            address: place.formatted_address,
            rating: place.rating,
            user_ratings_total: place.user_ratings_total || 0,
            latitude: place.geometry.location.lat(),
            longitude: place.geometry.location.lng(),
            placeId: prediction.place_id,
            url: place.url,
            image_url: place.photos?.[0]?.getUrl({
              maxWidth: 800,
              maxHeight: 600
            })
          };
          
          setSearchQuery(place.name);
          setShowPredictions(false);
          onPlaceSelect(placeDetails);
        }
      });
    } catch (error) {
      console.error('Error getting place details:', error);
    }
  };

  return (
    <Box sx={{ position: 'relative', width: '100%' }}>
      <TextField
        label="Place Name"
        variant='outlined'
        value={searchQuery}
        onChange={handleInputChange}
        required
        onFocus={() => setShowPredictions(true)}
        InputProps={{
          sx: { fontFamily: 'Lexend' }
      }}
      InputLabelProps={{
          sx: { fontFamily: 'Lexend' }
      }}
        disabled={isLoading}
        placeholder="search for a place..."
      />
      

      {showPredictions && predictions.length > 0 && (
        <Paper 
          sx={{ 
            position: 'absolute', 
            width: '100%', 
            maxHeight: '300px',
            overflowY: 'auto',
            mt: 1,
            zIndex: 1000,
            boxShadow: 3
          }}
        >
          <List>
            {predictions.map((prediction) => (
              <ListItem
                key={prediction.place_id}
                button
                onClick={() => handlePlaceSelect(prediction)}
                sx={{
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.04)'
                  }
                }}
              >
                <ListItemText 
                  primary={prediction.structured_formatting.main_text}
                  secondary={prediction.structured_formatting.secondary_text}
                  primaryTypographyProps={{ sx: { fontFamily: 'Lexend',color:'#666' } }}
                  secondaryTypographyProps={{ sx: { fontFamily: 'Lexend' } }}
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}
    </Box>
  );
};

export default LocationSearchBar;