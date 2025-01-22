const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { Client } = require('@googlemaps/google-maps-services-js');

admin.initializeApp();

exports.updatePlaceRatings = functions.pubsub.schedule('every 24 hours').onRun(async (context) => {
  const db = admin.database();
  const listingsRef = db.ref('listings');
  
  const snapshot = await listingsRef.once('value');
  const listings = snapshot.val();
  
  const mapsClient = new Client({});
  
  for (const [listingId, listing] of Object.entries(listings)) {
    if (listing.location?.placeId) {
      try {
        const response = await mapsClient.placeDetails({
          params: {
            place_id: listing.location.placeId,
            fields: ['rating', 'user_ratings_total'],
            key: process.env.GOOGLE_MAPS_API_KEY
          }
        });

        if (response.data.result) {
          await db.ref(`listings/${listingId}/location/googleData`).update({
            rating: response.data.result.rating,
            user_ratings_total: response.data.result.user_ratings_total,
            last_updated: admin.database.ServerValue.TIMESTAMP
          });
        }
      } catch (error) {
        console.error(`Error updating rating for listing ${listingId}:`, error);
      }
    }
  }
});