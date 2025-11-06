"use client";

import { GoogleMap, useJsApiLoader } from '@react-google-maps/api';
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Place } from '@/types/place';

// RecommendPlaces 컴포넌트가 부모로부터 받을 props의 타입을 정의합니다.
interface RecommendPlacesProps {
  center: { lat: number; lng: number };      // 지도의 중심 좌표 (현재 위치)
  places: Place[];                          // 지도에 표시할 장소들의 배열
  isGoodWeather: boolean;                   // 날씨가 좋은지 여부 (마커 색상 결정에 사용)
  hoveredPlaceId: string | null;            // 목록에서 마우스가 올라간 장소의 ID
  panTo: google.maps.LatLngLiteral | null;  // 지도를 부드럽게 이동시킬 목표 좌표
  onPlaceClick: (placeId: string) => void;  // 마커를 클릭했을 때 실행될 콜백 함수
  mapId?: string;                           // Google Cloud에서 설정한 커스텀 지도 스타일 ID
}

// Google Maps API에서 로드할 라이브러리를 지정합니다.
const libraries: ("marker")[] = ['marker'];
// 지도를 감싸는 컨테이너의 스타일을 정의합니다.
const mapContainerStyle = { width: '100%', height: '100%' };

// Google Maps의 AdvancedMarkerElement를 React 컴포넌트처럼 사용하기 위한 래퍼(Wrapper) 컴포넌트입니다.
const CustomMarker = ({ map, place, color, onClick, isCurrentLocation, isHovered }: {
  map: google.maps.Map, place: Place, color: string, onClick: () => void, isCurrentLocation?: boolean, isHovered?: boolean
}) => {
  // useEffect를 사용하여 map 객체나 관련 데이터가 변경될 때마다 마커를 다시 그립니다.
  useEffect(() => {
    if (!map || !place?.geometry?.location) return;
    // PinElement를 사용하여 마커의 외형(크기, 색상 등)을 정의합니다.
    const pinElement = new google.maps.marker.PinElement({
      scale: (isCurrentLocation || isHovered) ? 1.5 : 1, // 현재 위치 또는 호버된 마커는 더 크게 표시
      background: color,
      glyphColor: 'white',
      borderColor: 'white',
    });
    // AdvancedMarkerElement를 생성하여 지도에 추가합니다.
    const marker = new google.maps.marker.AdvancedMarkerElement({
      map,
      position: place.geometry.location,
      title: place.name,
      content: pinElement.element,
      zIndex: (isCurrentLocation || isHovered) ? 10 : 1, // 현재 위치 또는 호버된 마커가 항상 위에 오도록 z-index 설정
    });
    // 마커에 클릭 이벤트 리스너를 추가합니다.
    marker.addListener('click', onClick);
    // 컴포넌트가 언마운트될 때 실행될 정리(cleanup) 함수입니다. (메모리 누수 방지)
    return () => {
      google.maps.event.clearInstanceListeners(marker);
      marker.map = null;
    };
  }, [map, place, color, isCurrentLocation, isHovered]); // 의존성 배열

  // 이 컴포넌트는 실제 DOM 요소를 렌더링하지 않으므로 null을 반환합니다.
  return null;
};

// 날씨에 따라 추천된 장소들을 지도 위에 표시하는 컴포넌트
export default function RecommendPlaces({
                                          center, places, isGoodWeather, hoveredPlaceId, panTo, onPlaceClick, mapId = "b952dbd4abe0798a7fa76ba4"
                                        }: RecommendPlacesProps) {
  // useJsApiLoader 훅으로 Google Maps API 스크립트를 비동기적으로 로드합니다.
  const { isLoaded } = useJsApiLoader({ id: 'google-map-script', googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!, libraries });
  // 지도 인스턴스를 저장하기 위한 state입니다.
  const [map, setMap] = useState<google.maps.Map | null>(null);

  // panTo prop이 변경될 때 지도를 해당 위치로 부드럽게 이동시킵니다.
  useEffect(() => {
    if (map && panTo) {
      map.panTo(panTo);
    }
  }, [panTo, map]);

  // useMemo를 사용하여 현재 위치를 나타내는 Place 객체를 생성합니다.
  // center prop이 변경되지 않는 한 재계산되지 않아 성능에 유리합니다.
  const currentLocationPlace = useMemo(() => ({
    id: 'current-location', name: '현재 위치', geometry: { location: center }, vicinity: '', distance: '', duration: ''
  }), [center]);

  // useCallback을 사용하여 onPlaceClick 함수를 메모이제이션합니다.
  // onPlaceClick prop이 변경되지 않는 한 함수가 재생성되지 않아 하위 컴포넌트의 불필요한 리렌더링을 방지합니다.
  const handlePlaceClick = useCallback((placeId: string) => {
    onPlaceClick(placeId);
  }, [onPlaceClick]);

  // 날씨 상태(isGoodWeather)에 따라 장소 마커의 색상을 결정합니다.
  const markerColor = isGoodWeather ? "#34a853" : "#1a73e8"; // 좋음: 녹색, 나쁨: 파란색

  // API 스크립트가 로드되지 않았으면 로딩 메시지를 표시합니다.
  if (!isLoaded) return <div className="h-full flex items-center justify-center bg-gray-200">지도 로딩 중...</div>;

  return (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      center={center}
      zoom={14}
      options={{ disableDefaultUI: true, zoomControl: true, mapId: mapId }}
      onLoad={setMap} // 지도가 로드되면 map 인스턴스를 state에 저장합니다.
    >
      {/* map 인스턴스가 생성된 후에만 마커들을 렌더링합니다. */}
      {map && (
        <>
          {/* 현재 위치 마커 */}
          <CustomMarker map={map} place={currentLocationPlace} color="#FF0000" onClick={() => {}} isCurrentLocation={true} />

          {/* 추천 장소 마커 목록 */}
          {places.map(place => (
            <CustomMarker
              key={place.id}
              map={map}
              place={place}
              color={markerColor} // 날씨에 따라 결정된 마커 색상을 사용합니다.
              onClick={() => handlePlaceClick(place.id)}
              isHovered={place.id === hoveredPlaceId} // 호버 상태 여부를 전달합니다.
            />
          ))}
        </>
      )}
    </GoogleMap>
  );
}
