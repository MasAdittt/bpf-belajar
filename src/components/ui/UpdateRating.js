// src/utils/placeUtils.js
export const getUpdatedPlaceDetails = (placeId) => {
    return new Promise((resolve, reject) => {
      if (!window.google) {
        reject(new Error('Google Maps not loaded'));
        return;
      }
  
      const map = new window.google.maps.Map(document.createElement('div'));
      const service = new window.google.maps.places.PlacesService(map);
  
      service.getDetails({
        placeId: placeId,
        fields: ['rating', 'user_ratings_total']
      }, (place, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK) {
          resolve({
            rating: place.rating,
            user_ratings_total: place.user_ratings_total
          });
        } else {
          reject(new Error('Failed to fetch place details'));
        }
      });
    });
  };