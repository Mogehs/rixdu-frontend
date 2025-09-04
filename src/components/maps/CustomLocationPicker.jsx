import React, { useState, useEffect, useRef, useCallback } from "react";
import { ImPencil } from "react-icons/im";
import { IoMdSearch } from "react-icons/io";

const CustomLocationPicker = ({ onLocationSelect, initialLocation }) => {
  const mapRef = useRef(null);
  const searchBoxRef = useRef(null);
  const mapInstance = useRef(null);
  const markerInstance = useRef(null);

  const [selectedLocation, setSelectedLocation] = useState({
    address: "",
    lat: 25.2048,
    lng: 55.2708, // Default coordinates for Dubai
  });

  // Update selected location when initialLocation prop changes
  useEffect(() => {
    if (initialLocation) {
      let lat = 25.2048; // Default Dubai latitude
      let lng = 55.2708; // Default Dubai longitude

      // Handle different coordinate formats
      if (initialLocation.coordinates) {
        if (Array.isArray(initialLocation.coordinates)) {
          // Database GeoJSON format: [longitude, latitude]
          lng = parseFloat(initialLocation.coordinates[0]) || lng;
          lat = parseFloat(initialLocation.coordinates[1]) || lat;
        } else if (typeof initialLocation.coordinates === "object") {
          // Object format: {lat, lng}
          lat = parseFloat(initialLocation.coordinates.lat) || lat;
          lng = parseFloat(initialLocation.coordinates.lng) || lng;
        }
      } else {
        // Direct lat/lng properties
        lat = parseFloat(initialLocation.lat) || lat;
        lng = parseFloat(initialLocation.lng) || lng;
      }

      const newLocation = {
        address: initialLocation.address || "",
        lat: lat,
        lng: lng,
      };
      console.log(
        "CustomLocationPicker - Initial location received:",
        initialLocation
      );
      console.log(
        "CustomLocationPicker - Setting processed location:",
        newLocation
      );
      setSelectedLocation(newLocation);

      // Update map if it exists
      if (mapInstance.current && markerInstance.current) {
        const position = { lat: newLocation.lat, lng: newLocation.lng };
        mapInstance.current.setCenter(position);
        markerInstance.current.setPosition(position);
      }
    }
  }, [initialLocation]);

  // Define updateLocation function first
  const updateLocation = useCallback(
    (location) => {
      // Ensure coordinates are numbers
      const processedLocation = {
        ...location,
        lat: parseFloat(location.lat) || null,
        lng: parseFloat(location.lng) || null,
      };

      setSelectedLocation((prev) => ({
        ...prev,
        ...processedLocation,
      }));

      if (onLocationSelect) {
        onLocationSelect({
          ...processedLocation,
          address: location.address || selectedLocation.address,
        });
        console.log("CustomLocationPicker - Sending location to parent:", {
          ...processedLocation,
          address: location.address || selectedLocation.address,
        });
      }

      // If we have coordinates but no address, reverse geocode
      if (processedLocation.lat && processedLocation.lng && !location.address) {
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode(
          {
            location: {
              lat: processedLocation.lat,
              lng: processedLocation.lng,
            },
          },
          (results, status) => {
            if (status === "OK" && results[0]) {
              const address = results[0].formatted_address;
              setSelectedLocation((prev) => ({
                ...prev,
                address: address,
              }));
              if (onLocationSelect) {
                onLocationSelect({
                  ...processedLocation,
                  address: address,
                });
              }
            }
          }
        );
      }
    },
    [onLocationSelect, selectedLocation.address]
  );

  // Initialize the map
  useEffect(() => {
    const initMap = () => {
      if (!window.google || !mapRef.current) return;

      mapInstance.current = new window.google.maps.Map(mapRef.current, {
        center: { lat: selectedLocation.lat, lng: selectedLocation.lng },
        zoom: 12,
        zoomControl: true,
        mapTypeControl: false,
        scaleControl: true,
        streetViewControl: false,
        rotateControl: true,
        fullscreenControl: true,
        gestureHandling: "cooperative",
      });

      // Create a marker
      markerInstance.current = new window.google.maps.Marker({
        map: mapInstance.current,
        position: { lat: selectedLocation.lat, lng: selectedLocation.lng },
        draggable: true,
      });

      // Handle marker drag
      markerInstance.current.addListener("dragend", () => {
        const position = markerInstance.current.getPosition();
        updateLocation({
          lat: position.lat(),
          lng: position.lng(),
        });
      });

      // Handle map click
      mapInstance.current.addListener("click", (event) => {
        const lat = event.latLng.lat();
        const lng = event.latLng.lng();
        markerInstance.current.setPosition({ lat, lng });
        updateLocation({ lat, lng });
      });

      // Initialize search box
      if (window.google?.maps?.places && searchBoxRef.current) {
        const searchBoxInstance = new window.google.maps.places.SearchBox(
          searchBoxRef.current
        );

        searchBoxInstance.addListener("places_changed", () => {
          const places = searchBoxInstance.getPlaces();
          if (places.length === 0) return;

          const place = places[0];
          if (!place.geometry || !place.geometry.location) return;

          // Update map and marker
          mapInstance.current.setCenter(place.geometry.location);
          markerInstance.current.setPosition(place.geometry.location);

          updateLocation({
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
            address: place.formatted_address,
          });
        });
      }
    };

    // Load Google Maps JavaScript API
    if (!window.google) {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyB41DRUbKWJHPxaFjMAwdrzWzbVKartNGg&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = initMap;
      document.head.appendChild(script);
    } else {
      initMap();
    }
  }, [selectedLocation.lat, selectedLocation.lng, updateLocation]);

  return (
    <div className="border border-[var(--color-border)] rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[var(--color-dark)]">
          Is the pin in the right location?
        </p>
        <button type="button" className="text-[var(--color-primary)]">
          <ImPencil className="text-lg" />
        </button>
      </div>
      <p className="text-gray-500 text-sm mb-3">
        Click or Search to select the location. You can also drag the pin to
        adjust.
      </p>
      <div className="relative mb-4">
        <input
          ref={searchBoxRef}
          type="text"
          placeholder="Enter a location"
          className="w-full p-3 pr-10 border border-[var(--color-border)] outline-[var(--color-primary)] rounded-lg"
          value={selectedLocation.address}
          onChange={(e) =>
            setSelectedLocation((prev) => ({
              ...prev,
              address: e.target.value,
            }))
          }
        />
        <IoMdSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-2xl text-[var(--color-primary)]" />
      </div>
      <div
        ref={mapRef}
        className="w-full h-48 bg-gray-100 rounded-lg relative overflow-hidden"
      />
    </div>
  );
};

export default CustomLocationPicker;
