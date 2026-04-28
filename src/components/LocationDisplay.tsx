import React, { useState, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { MapPin, Navigation, ExternalLink } from 'lucide-react';
import { calculateDistance } from '../lib/utils';

const containerStyle = {
  width: '100%',
  height: '300px',
  borderRadius: '1.5rem'
};

interface LocationDisplayProps {
  latitude: number;
  longitude: number;
  businessName: string;
}

const LocationDisplay: React.FC<LocationDisplayProps> = ({ latitude, longitude, businessName }) => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: apiKey || ''
  });

  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [distance, setDistance] = useState<number | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLat = position.coords.latitude;
          const userLng = position.coords.longitude;
          setUserLocation({ lat: userLat, lng: userLng });
          
          const dist = calculateDistance(userLat, userLng, latitude, longitude);
          setDistance(dist);
        },
        (error) => {
          console.error("Error getting user location:", error);
        }
      );
    }
  }, [latitude, longitude]);

  const openInGoogleMaps = () => {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`, '_blank');
  };

  if (!apiKey) {
    return (
      <div className="h-[300px] bg-gray-50 rounded-[1.5rem] flex flex-col items-center justify-center text-gray-500 p-6 text-center border border-gray-100">
        <MapPin size={32} className="mb-4 opacity-30" />
        <p className="text-xs">Google Maps key not configured. Directions available via external link.</p>
        <button onClick={openInGoogleMaps} className="mt-4 text-blue-600 font-bold text-xs flex items-center">
          <ExternalLink size={14} className="mr-1" /> View Location on Maps
        </button>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="h-[300px] bg-red-50 rounded-[1.5rem] flex flex-col items-center justify-center text-red-500 p-6 text-center border border-red-100">
        <MapPin size={32} className="mb-4 opacity-30" />
        <p className="text-xs">Error loading Google Maps. Visit Google Cloud Console to enable 'Maps JavaScript API'.</p>
        <button onClick={openInGoogleMaps} className="mt-4 text-red-600 font-bold text-xs flex items-center">
          <ExternalLink size={14} className="mr-1" /> View on Maps Instead
        </button>
      </div>
    );
  }

  if (!isLoaded) return <div className="h-[300px] bg-gray-100 animate-pulse rounded-[1.5rem]" />;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <h3 className="text-xl font-bold text-gray-900 flex items-center">
          <MapPin size={22} className="mr-2 text-orange-500" />
          Location & Distance
        </h3>
        {distance !== null && (
          <div className="flex items-center bg-blue-50 text-blue-700 px-3 py-1.5 rounded-xl border border-blue-100 text-sm font-bold animate-in fade-in slide-in-from-right-4 duration-500">
            <Navigation size={14} className="mr-1.5" />
            <span>Approx. {distance.toFixed(1)} km away from you</span>
          </div>
        )}
      </div>

      <div className="relative group border-2 border-gray-100 rounded-[1.5rem] overflow-hidden shadow-sm">
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={{ lat: latitude, lng: longitude }}
          zoom={14}
          options={{
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: false,
            draggable: false
          }}
        >
          <Marker 
            position={{ lat: latitude, lng: longitude }} 
            title={businessName}
          />
        </GoogleMap>
        
        <button
          onClick={openInGoogleMaps}
          className="absolute bottom-4 right-4 bg-white text-gray-900 px-4 py-2 rounded-xl shadow-lg border border-gray-100 flex items-center space-x-2 font-bold text-sm hover:bg-gray-50 transition-colors z-10"
        >
          <ExternalLink size={16} />
          <span>Get Directions</span>
        </button>
      </div>
    </div>
  );
};

export default LocationDisplay;
