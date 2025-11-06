"use client";

import { GoogleMap, useJsApiLoader } from '@react-google-maps/api';
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Place } from '@/types/place';

interface RecommendPlacesProps {
  center: { lat: number; lng: number };
  places: Place[]; // 하나의 장소 배열만 받음
  isGoodWeather: boolean; // 날씨 상태를 받음
  hoveredPlaceId: string | null;
  panTo: google.maps.LatLngLiteral | null;
  onPlaceClick: (placeId: string) => void;
  mapId?: string;
}

const libraries: ("marker")[] = ['marker'];
const mapContainerStyle = { width: '100%', height: '100%' };

const CustomMarker = ({ map, place, color, onClick, isCurrentLocation, isHovered }: {
  map: google.maps.Map, place: Place, color: string, onClick: () => void, isCurrentLocation?: boolean, isHovered?: boolean
}) => {
  useEffect(() => {
    if (!map || !place?.geometry?.location) return;
    const pinElement = new google.maps.marker.PinElement({
      scale: (isCurrentLocation || isHovered) ? 1.5 : 1, background: color, glyphColor: 'white', borderColor: 'white',
    });
    const marker = new google.maps.marker.AdvancedMarkerElement({
      map, position: place.geometry.location, title: place.name, content: pinElement.element, zIndex: (isCurrentLocation || isHovered) ? 10 : 1,
    });
    marker.addListener('click', onClick);
    return () => {
      google.maps.event.clearInstanceListeners(marker);
      marker.map = null;
    };
  }, [map, place, color, isCurrentLocation, isHovered]);
  return null;
};

export default function RecommendPlaces({
                                          center, places, isGoodWeather, hoveredPlaceId, panTo, onPlaceClick, mapId = "b952dbd4abe0798a7fa76ba4"
                                        }: RecommendPlacesProps) {
  const { isLoaded } = useJsApiLoader({ id: 'google-map-script', googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!, libraries });
  const [map, setMap] = useState<google.maps.Map | null>(null);

  useEffect(() => {
    if (map && panTo) {
      map.panTo(panTo);
    }
  }, [panTo, map]);

  const currentLocationPlace = useMemo(() => ({
    id: 'current-location', name: '현재 위치', geometry: { location: center }, vicinity: '', distance: '', duration: ''
  }), [center]);

  const handlePlaceClick = useCallback((placeId: string) => {
    onPlaceClick(placeId);
  }, [onPlaceClick]);

  // 날씨 상태에 따라 마커 색상을 결정
  const markerColor = isGoodWeather ? "#34a853" : "#1a73e8";

  if (!isLoaded) return <div className="h-full flex items-center justify-center bg-gray-200">지도 로딩 중...</div>;

  return (
    <GoogleMap mapContainerStyle={mapContainerStyle} center={center} zoom={14} options={{ disableDefaultUI: true, zoomControl: true, mapId: mapId }} onLoad={setMap}>
      {map && (
        <>
          <CustomMarker map={map} place={currentLocationPlace} color="#FF0000" onClick={() => {}} isCurrentLocation={true} />
          {places.map(place => (
            <CustomMarker
              key={place.id}
              map={map}
              place={place}
              color={markerColor} // 결정된 마커 색상 사용
              onClick={() => handlePlaceClick(place.id)}
              isHovered={place.id === hoveredPlaceId}
            />
          ))}
        </>
      )}
    </GoogleMap>
  );
}
