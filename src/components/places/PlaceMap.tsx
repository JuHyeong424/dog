"use client";

import { GoogleMap, useJsApiLoader } from '@react-google-maps/api';
import React, { useEffect, useState } from 'react';

// 타입 정의
interface Place {
  id: string;
  name: string;
  vicinity: string;
  geometry: { location: { lat: number; lng: number; }; };
}

interface PlacesMapProps {
  center: { lat: number; lng: number };
  places: Place[];
  color: string;
  onPlaceClick: (placeId: string) => void;
}

const libraries: ("marker")[] = ['marker'];
const mapContainerStyle = { width: '100%', height: '600px', borderRadius: '1rem' };

const CustomMarker = ({ map, place, color, onClick, isCurrentLocation }: {
  map: google.maps.Map,
  place: Place,
  color: string,
  onClick: () => void,
  isCurrentLocation?: boolean;
}) => {
  useEffect(() => {
    if (!map || !place || !place.geometry?.location) return;

    const pinElement = new google.maps.marker.PinElement({
      scale: isCurrentLocation ? 1.5 : 1,
      background: color,
      glyphColor: 'white',
      borderColor: 'white',
    });

    const marker = new google.maps.marker.AdvancedMarkerElement({
      map,
      position: place.geometry.location,
      title: place.name,
      content: pinElement.element,
      zIndex: isCurrentLocation ? 10 : 1,
    });

    marker.addListener('click', onClick);

    return () => {
      google.maps.event.clearInstanceListeners(marker);
      marker.map = null;
    };
  }, [map, place, color, onClick, isCurrentLocation]);

  return null;
};

export default function PlacesMap({ center, places, color, onPlaceClick }: PlacesMapProps) {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
    libraries: libraries,
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);

  if (!isLoaded) return <div className="h-[600px] flex items-center justify-center">지도 로딩 중...</div>;

  return (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      center={center}
      zoom={14}
      options={{
        disableDefaultUI: true,
        zoomControl: true,
        mapId: "b952dbd4abe0798a7fa76ba4"
      }}
      onLoad={setMap}
    >
      {map && (
        <>
          <CustomMarker
            map={map}
            place={{ id: 'current-location', name: '현재 위치', geometry: { location: center }, vicinity: '' }}
            color="#FF0000"
            onClick={() => {}}
            isCurrentLocation={true}
          />

          {places.map(place => (
            <CustomMarker key={place.id} map={map} place={place} color={color} onClick={() => onPlaceClick(place.id)} />
          ))}

        </>
      )}
    </GoogleMap>
  );
}
