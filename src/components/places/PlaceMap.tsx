"use client";

import { GoogleMap, useJsApiLoader } from '@react-google-maps/api';
import React, { useEffect, useState } from 'react';

// 타입 정의
// 개별 장소 데이터의 구조를 정의합니다.
interface Place {
  id: string;
  name: string;
  vicinity: string;
  geometry: { location: { lat: number; lng: number; }; };
}

// PlacesMap 컴포넌트가 부모로부터 받을 props의 타입을 정의합니다.
interface PlacesMapProps {
  center: { lat: number; lng: number }; // 지도의 중심 좌표
  places: Place[];                       // 지도에 표시할 장소들의 배열
  color: string;                         // 장소 마커의 색상
  onPlaceClick: (placeId: string) => void; // 마커를 클릭했을 때 실행될 콜백 함수
}

// Google Maps API에서 로드할 라이브러리를 지정합니다. (새로운 Advanced Marker를 위해 'marker' 라이브러리 필요)
const libraries: ("marker")[] = ['marker'];
// 지도를 감싸는 컨테이너의 스타일을 정의합니다.
const mapContainerStyle = { width: '100%', height: '600px', borderRadius: '1rem' };

// Google Maps의 AdvancedMarkerElement를 React 컴포넌트처럼 사용하기 위한 래퍼(Wrapper) 컴포넌트입니다.
// 이 컴포넌트는 useEffect를 사용하여 지도에 직접 마커를 그리고, 소멸 시 정리합니다.
const CustomMarker = ({ map, place, color, onClick, isCurrentLocation }: {
  map: google.maps.Map,
  place: Place,
  color: string,
  onClick: () => void,
  isCurrentLocation?: boolean;
}) => {
  // useEffect를 사용하여 map 객체나 place 데이터가 변경될 때마다 마커를 다시 그립니다.
  useEffect(() => {
    // map 객체나 위치 정보가 없으면 아무 작업도 하지 않습니다.
    if (!map || !place || !place.geometry?.location) return;

    // 새로운 PinElement를 사용하여 마커의 외형(크기, 배경색 등)을 정의합니다.
    const pinElement = new google.maps.marker.PinElement({
      scale: isCurrentLocation ? 1.5 : 1, // 현재 위치 마커는 더 크게 표시
      background: color,
      glyphColor: 'white',
      borderColor: 'white',
    });

    // AdvancedMarkerElement를 생성하여 지도에 추가합니다.
    const marker = new google.maps.marker.AdvancedMarkerElement({
      map,
      position: place.geometry.location,
      title: place.name,
      content: pinElement.element, // content에 PinElement를 할당
      zIndex: isCurrentLocation ? 10 : 1, // 현재 위치 마커가 항상 위에 오도록 z-index 설정
    });

    // 마커에 클릭 이벤트 리스너를 추가합니다.
    marker.addListener('click', onClick);

    // 컴포넌트가 언마운트되거나 의존성이 변경될 때 실행될 정리(cleanup) 함수입니다.
    // 메모리 누수를 방지하기 위해 이벤트 리스너를 제거하고 마커를 지도에서 삭제합니다.
    return () => {
      google.maps.event.clearInstanceListeners(marker);
      marker.map = null;
    };
  }, [map, place, color, onClick, isCurrentLocation]); // 의존성 배열

  // 이 컴포넌트는 실제 DOM 요소를 렌더링하지 않고, 지도에 직접 그리는 부수 효과만 수행하므로 null을 반환합니다.
  return null;
};

// 주변 장소를 지도에 표시하는 메인 컴포넌트
export default function PlacesMap({ center, places, color, onPlaceClick }: PlacesMapProps) {
  // useJsApiLoader 훅을 사용하여 Google Maps JavaScript API 스크립트를 비동기적으로 로드합니다.
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
    libraries: libraries,
  });

  // 지도 인스턴스를 저장하기 위한 state입니다. 이 인스턴스는 CustomMarker로 전달됩니다.
  const [map, setMap] = useState<google.maps.Map | null>(null);

  // API 스크립트가 로드되지 않았으면 로딩 메시지를 표시합니다.
  if (!isLoaded) return <div className="h-[600px] flex items-center justify-center">지도 로딩 중...</div>;

  return (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      center={center}
      zoom={14}
      options={{
        disableDefaultUI: true, // 기본 UI(스트리트뷰 등) 비활성화
        zoomControl: true,      // 줌 컨트롤은 활성화
        mapId: "b952dbd4abe0798a7fa76ba4" // Google Cloud에서 설정한 커스텀 지도 스타일 ID
      }}
      // 지도가 성공적으로 로드되면 map 인스턴스를 state에 저장합니다.
      onLoad={setMap}
    >
      {/* map 인스턴스가 생성된 후에만 마커들을 렌더링합니다. */}
      {map && (
        <>
          {/* 현재 위치를 나타내는 특별한 마커를 생성합니다. */}
          <CustomMarker
            map={map}
            place={{ id: 'current-location', name: '현재 위치', geometry: { location: center }, vicinity: '' }}
            color="#FF0000" // 빨간색으로 구분
            onClick={() => {}} // 현재 위치 마커는 클릭 이벤트가 없습니다.
            isCurrentLocation={true} // 더 크고 위에 표시되도록 플래그를 전달합니다.
          />

          {/* places 배열을 순회하면서 각 장소에 대한 CustomMarker를 생성합니다. */}
          {places.map(place => (
            <CustomMarker key={place.id} map={map} place={place} color={color} onClick={() => onPlaceClick(place.id)} />
          ))}
        </>
      )}
    </GoogleMap>
  );
}
