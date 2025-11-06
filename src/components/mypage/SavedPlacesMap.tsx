"use client";

import { GoogleMap, useJsApiLoader, MarkerF } from '@react-google-maps/api';
import React, { useEffect, useMemo, useState } from 'react';

interface Location { lat: number; lng: number; }
interface SavedPlace {
  content_id: string;
  content_data: any;
}
interface SavedPlacesMapProps {
  places: SavedPlace[];
  currentLocation: Location | null;
  onPlaceClick: (placeId: string) => void;
  hoveredPlaceId: string | null;
}

const libraries: ("marker")[] = ['marker'];
const mapContainerStyle = { width: '100%', height: '100%' };
const DEFAULT_CENTER = { lat: 37.5665, lng: 126.9780 };


export default function SavedPlacesMap({ places, currentLocation, onPlaceClick, hoveredPlaceId }: SavedPlacesMapProps) {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
    libraries: libraries,
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);

  const validPlaces = useMemo(() =>
    places.filter(p => {
      const lat = p.content_data?.geometry?.location?.lat;
      const lng = p.content_data?.geometry?.location?.lng;
      return typeof lat === 'number' && typeof lng === 'number';
    }), [places]
  );

  const mapCenter = useMemo(() => {
    if (currentLocation) return currentLocation;
    if (validPlaces.length > 0) {
      return { lat: validPlaces[0].content_data.geometry.location.lat, lng: validPlaces[0].content_data.geometry.location.lng };
    }
    return DEFAULT_CENTER;
  }, [currentLocation, validPlaces]);

  useEffect(() => {
    if (!map || !hoveredPlaceId) return;

    const hoveredPlace = validPlaces.find(p => p.content_id === hoveredPlaceId);
    if (hoveredPlace) {
      const newCenter = {
        lat: hoveredPlace.content_data.geometry.location.lat,
        lng: hoveredPlace.content_data.geometry.location.lng,
      };
      map.panTo(newCenter); // 부드럽게 이동
    }
  }, [hoveredPlaceId, map, validPlaces]);


  if (!isLoaded) {
    return <div className="w-full h-full bg-gray-200 flex items-center justify-center">지도 로딩 중...</div>;
  }

  return (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      center={mapCenter}
      zoom={13}
      options={{ disableDefaultUI: true, zoomControl: true }}
      onLoad={setMap}
    >
      {currentLocation && (
        <MarkerF
          position={currentLocation}
          title="현재 위치"
          icon={{
            path: google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: "#4285F4",
            fillOpacity: 1,
            strokeColor: "white",
            strokeWeight: 2,
          }}
          zIndex={10} // 항상 위에 있도록
        />
      )}

      {validPlaces.map(place => {
        const isHovered = place.content_id === hoveredPlaceId;
        return (
          <MarkerF
            key={place.content_id}
            position={{
              lat: place.content_data.geometry.location.lat,
              lng: place.content_data.geometry.location.lng,
            }}
            title={place.content_data.name}
            onClick={() => onPlaceClick(place.content_id)}
            zIndex={isHovered ? 5 : 1}
          />
        );
      })}
    </GoogleMap>
  );
}
