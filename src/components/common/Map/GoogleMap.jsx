import React, { useState, useCallback, useEffect } from "react";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "100%",
};

const defaultCenter = {
  lat: 25.2048,
  lng: 55.2708,
};

const GOOGLE_MAPS_API_KEY = "AIzaSyB41DRUbKWJHPxaFjMAwdrzWzbVKartNGg";

const GoogleMapComponent = ({ location, mapContainerStyle, zoom = 14 }) => {
  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
  });

  // eslint-disable-next-line no-unused-vars
  const [map, setMap] = useState(null);
  const [center, setCenter] = useState(defaultCenter);

  useEffect(() => {
    if (location) {
      if (typeof location === "object") {
        // Case 1: Direct lat/lng in the location object
        if (location.lat && location.lng) {
          setCenter({
            lat: parseFloat(location.lat),
            lng: parseFloat(location.lng),
          });
        }
        // Case 2: Location with nested coordinates object with lat/lng
        else if (
          location.coordinates &&
          location.coordinates.lat &&
          location.coordinates.lng
        ) {
          setCenter({
            lat: parseFloat(location.coordinates.lat),
            lng: parseFloat(location.coordinates.lng),
          });
        }
        // Case 3: GeoJSON format - coordinates as [longitude, latitude] array
        else if (
          location.coordinates &&
          Array.isArray(location.coordinates) &&
          location.coordinates.length === 2
        ) {
          setCenter({
            lat: parseFloat(location.coordinates[1]),
            lng: parseFloat(location.coordinates[0]),
          });
        } else {
          console.warn("Unsupported location format:", location);
        }
      }
    }
  }, [location]);

  const onLoad = useCallback((map) => setMap(map), []);
  const onUnmount = useCallback(() => setMap(null), []);

  if (loadError) {
    console.error("Google Maps loading error:", loadError);
    return (
      <div className="flex items-center justify-center w-full h-full bg-gray-100 rounded-md">
        <div className="text-red-500">
          Failed to load Google Maps. Please try again later.
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center w-full h-full bg-gray-100 rounded-md">
        <div className="text-gray-500">
          <svg
            className="animate-spin h-5 w-5 mr-3 inline"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Loading map...
        </div>
      </div>
    );
  }

  return (
    <GoogleMap
      mapContainerStyle={mapContainerStyle || containerStyle}
      center={center}
      zoom={zoom}
      onLoad={onLoad}
      onUnmount={onUnmount}
      options={{
        fullscreenControl: false,
        mapTypeControl: false,
        streetViewControl: false,
        zoomControl: true,
      }}
    >
      <Marker
        position={center}
        icon={{
          url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
        }}
      />
    </GoogleMap>
  );
};

export default GoogleMapComponent;
