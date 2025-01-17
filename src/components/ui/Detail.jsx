import React from 'react';
import { Star, MapPin } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const GoogleLogo = () => (
  <div className="ml-1">
    <svg viewBox="0 0 24 24" width="16" height="16">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  </div>
);

const PlaceDetailsCard = ({ isLoading, placeDetails }) => {
  if (isLoading) {
    return (
      <Card className="max-w-2xl mx-auto w-full">
        <CardContent className="p-6">
          <div className="h-48 bg-gray-200 rounded mb-4 animate-pulse" />
          <div className="h-8 bg-gray-200 w-3/4 rounded mb-2 animate-pulse" />
          <div className="h-6 bg-gray-200 w-1/2 rounded mb-2 animate-pulse" />
          <div className="h-6 bg-gray-200 w-full rounded animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  if (!placeDetails) return null;

  const getImageUrl = (url) => {
    if (url) return url;
    return "/api/placeholder/400/300";
  };

  return (
    <Card className="max-w-2xl mx-auto w-full">
      <CardContent className="p-6">
        <div className="relative mb-4 mt-4">
          <img
            src={getImageUrl(placeDetails.image_url)}
            alt={placeDetails.name}
            className="w-full h-48 object-cover rounded"
            onError={(e) => {
              e.target.src = "/api/placeholder/400/300";
            }}
          />
        </div>
        
        <h2 className="text-xl font-semibold mb-2 font-lexend">
          {placeDetails.name}
        </h2>
        
        <div className="flex items-center gap-1 mb-2">
          <Star className="w-4 h-4 text-yellow-400 fill-current" />
          <span className="font-medium text-gray-600">{placeDetails.rating}</span>
          <span className="text-gray-600">
            ({new Intl.NumberFormat('id-ID').format(placeDetails.user_ratings_total || 0)})
          </span>
          <GoogleLogo />
        </div>

        {placeDetails.address && (
          <p className="text-gray-600 mb-2 flex items-center">
            <MapPin className="mr-1 w-4 h-4 text-gray-600" />
            {placeDetails.address}
          </p>
        )}
        
        {placeDetails.phone && (
          <p className="text-gray-600 flex items-center">
            <span className="mr-1">📞</span>
            {placeDetails.phone}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default PlaceDetailsCard;