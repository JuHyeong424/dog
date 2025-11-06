"use client";

import { GoogleMap, useJsApiLoader, MarkerF } from '@react-google-maps/api';
import React, { useEffect, useMemo, useState } from 'react';

// 위치(위도, 경도) 데이터 타입을 정의합니다.
interface Location { lat: number; lng: number; }
// 저장된 장소 데이터의 일부 타입을 정의합니다.
interface SavedPlace {
  content_id: string;
  content_data: any; // 장소의 상세 정보 (이름, 좌표 등)
}
// SavedPlacesMap 컴포넌트가 받을 props의 타입을 정의합니다.
interface SavedPlacesMapProps {
  places: SavedPlace[]; // 지도에 표시할 장소 목록
  currentLocation: Location | null; // 사용자의 현재 위치
  onPlaceClick: (placeId: string) => void; // 마커 클릭 시 실행될 함수
  hoveredPlaceId: string | null; // 마우스가 올라간 장소의 ID (카드-지도 연동용)
}

// Google Maps API에서 로드할 라이브러리를 지정합니다. ('marker' 라이브러리만 필요)
const libraries: ("marker")[] = ['marker'];
// 지도의 크기를 설정하는 스타일 객체입니다.
const mapContainerStyle = { width: '100%', height: '100%' };
// 기본 지도 중심 좌표 (서울 시청)
const DEFAULT_CENTER = { lat: 37.5665, lng: 126.9780 };


// 사용자가 저장한 장소들을 Google 지도 위에 표시하는 컴포넌트
export default function SavedPlacesMap({ places, currentLocation, onPlaceClick, hoveredPlaceId }: SavedPlacesMapProps) {
  // useJsApiLoader 훅을 사용하여 Google Maps JavaScript API를 비동기적으로 로드합니다.
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script', // 스크립트 태그에 부여할 고유 ID
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!, // .env 파일에서 API 키를 가져옵니다.
    libraries: libraries, // 로드할 라이브러리 목록
  });

  // 지도 인스턴스를 저장하기 위한 state
  const [map, setMap] = useState<google.maps.Map | null>(null);

  // useMemo를 사용하여 유효한 좌표를 가진 장소만 필터링합니다.
  // places 배열이 변경될 때만 재계산되어 성능을 최적화합니다.
  const validPlaces = useMemo(() =>
    places.filter(p => {
      const lat = p.content_data?.geometry?.location?.lat;
      const lng = p.content_data?.geometry?.location?.lng;
      // 위도와 경도가 모두 유효한 숫자인지 확인합니다.
      return typeof lat === 'number' && typeof lng === 'number';
    }), [places]
  );

  // 지도의 초기 중심점을 결정합니다.
  // 우선순위: 1. 현재 위치 -> 2. 저장된 장소 중 첫 번째 -> 3. 기본 좌표(서울)
  const mapCenter = useMemo(() => {
    if (currentLocation) return currentLocation;
    if (validPlaces.length > 0) {
      return { lat: validPlaces[0].content_data.geometry.location.lat, lng: validPlaces[0].content_data.geometry.location.lng };
    }
    return DEFAULT_CENTER;
  }, [currentLocation, validPlaces]);

  // hoveredPlaceId가 변경될 때 지도를 해당 위치로 부드럽게 이동시킵니다.
  useEffect(() => {
    // 지도 인스턴스나 호버된 ID가 없으면 아무것도 하지 않습니다.
    if (!map || !hoveredPlaceId) return;

    // 호버된 ID에 해당하는 장소를 찾습니다.
    const hoveredPlace = validPlaces.find(p => p.content_id === hoveredPlaceId);
    if (hoveredPlace) {
      const newCenter = {
        lat: hoveredPlace.content_data.geometry.location.lat,
        lng: hoveredPlace.content_data.geometry.location.lng,
      };
      map.panTo(newCenter); // setCenter와 달리 부드럽게 이동합니다.
    }
  }, [hoveredPlaceId, map, validPlaces]); // 의존성 배열: 이 값들이 변경될 때만 효과를 실행합니다.


  // Google Maps API 스크립트가 로드되지 않았으면 로딩 메시지를 표시합니다.
  if (!isLoaded) {
    return <div className="w-full h-full bg-gray-200 flex items-center justify-center">지도 로딩 중...</div>;
  }

  // --- 렌더링 ---
  return (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      center={mapCenter}
      zoom={13}
      // 기본 UI(스트리트뷰, 지도/위성 전환 등)를 비활성화하고, 줌 컨트롤만 활성화합니다.
      options={{ disableDefaultUI: true, zoomControl: true }}
      // 지도가 로드되면 map 인스턴스를 state에 저장합니다.
      onLoad={setMap}
    >
      {/* 현재 위치가 있으면 파란색 원 모양의 마커를 표시합니다. */}
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
          zIndex={10} // 다른 마커들보다 항상 위에 있도록 z-index를 높게 설정합니다.
        />
      )}

      {/* 유효한 장소 목록을 순회하며 각 장소에 대한 마커를 생성합니다. */}
      {validPlaces.map(place => {
        // 현재 마커가 호버된 마커인지 확인합니다.
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
            // 호버된 마커는 다른 마커들보다 위에 보이도록 z-index를 조정합니다.
            zIndex={isHovered ? 5 : 1}
          />
        );
      })}
    </GoogleMap>
  );
}
