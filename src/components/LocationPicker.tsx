import React, { useState, useCallback, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { MapPin, Navigation } from 'lucide-react';

const containerStyle = {
  width: '100%',
  height: '350px',
  borderRadius: '1.5rem'
};

const defaultCenter = {
  lat: 23.2599, // Default to Bhopal/Central India if no location
  lng: 77.4126
};

interface LocationPickerProps {
  initialLocation?: { lat: number; lng: number };
  onLocationSelect: (lat: number, lng: number) => void;
}

const LocationPicker: React.FC<LocationPickerProps> = ({ initialLocation, onLocationSelect }) => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: apiKey || ''
  });

  const [markerPosition, setMarkerPosition] = useState<{ lat: number; lng: number } | null>(
    initialLocation && initialLocation.lat && initialLocation.lng ? initialLocation : null
  );
  const [center, setCenter] = useState<{ lat: number; lng: number }>(
    initialLocation && initialLocation.lat && initialLocation.lng ? initialLocation : defaultCenter
  );

  const onMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      setMarkerPosition({ lat, lng });
      onLocationSelect(lat, lng);
    }
  }, [onLocationSelect]);

  const useCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setMarkerPosition({ lat, lng });
          setCenter({ lat, lng });
          onLocationSelect(lat, lng);
        },
        () => {
          alert("Error: The Geolocation service failed.");
        }
      );
    } else {
      alert("Error: Your browser doesn't support geolocation.");
    }
  };

  useEffect(() => {
    if (initialLocation && initialLocation.lat && initialLocation.lng) {
      setMarkerPosition(initialLocation);
      setCenter(initialLocation);
    }
  }, [initialLocation]);

  if (!apiKey) {
    return (
      <div className="h-[350px] bg-orange-50 rounded-[1.5rem] flex flex-col items-center justify-center text-orange-800 p-6 text-center border border-orange-100">
        <MapPin size={32} className="mb-4 opacity-50" />
        <h3 className="font-bold mb-2 uppercase text-xs tracking-widest">Maps Key Required</h3>
        <p className="text-xs opacity-75">Please add VITE_GOOGLE_MAPS_API_KEY to secrets to enable map selection.</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="h-[350px] bg-red-50 rounded-[1.5rem] flex flex-col items-center justify-center text-red-800 p-6 text-center border border-red-100">
        <MapPin size={32} className="mb-4 opacity-50" />
        <h3 className="font-bold mb-2 uppercase text-xs tracking-widest">Maps Load Error</h3>
        <p className="text-xs opacity-75">Verify that 'Maps JavaScript API' is enabled in your Google Cloud Console for this project.</p>
      </div>
    );
  }

  if (!isLoaded) return <div className="h-[350px] bg-gray-100 animate-pulse rounded-[1.5rem] flex items-center justify-center text-gray-400">Loading Map...</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-2">
        <label className="block text-sm font-bold text-gray-700 flex items-center">
          <MapPin size={18} className="mr-2 text-orange-500" />
          Select Location on Map
        </label>
        <button
          type="button"
          onClick={useCurrentLocation}
          className="flex items-center space-x-1 text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
        >
          <Navigation size={14} />
          <span>Use Current Location</span>
        </button>
      </div>
      
      <div className="border-2 border-gray-100 rounded-[1.5rem] overflow-hidden shadow-sm">
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={12}
          onClick={onMapClick}
          options={{
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: false
          }}
        >
          {markerPosition && (
            <Marker position={markerPosition} />
          )}
        </GoogleMap>
      </div>
      <p className="text-[10px] text-gray-400 font-medium italic">
        * Click anywhere on the map to set your business location pin.
      </p>
    </div>
  );
};

export default LocationPicker;
