"use client";

import { useEffect, useState } from "react";

// 훅이 반환할 상태 객체의 데이터 구조를 정의하는 인터페이스입니다.
interface LocationState {
  currentLocation: { lat: number; lng: number } | null; // 현재 위치 좌표 또는 null
  error: string | null;                                 // 에러 메시지 또는 null
}

/**
 * 브라우저의 Geolocation API를 사용하여 사용자의 현재 위치를 가져오는 커스텀 훅입니다.
 * @returns {LocationState} 현재 위치 좌표와 에러 상태를 포함하는 객체
 */
export default function useCurrentLocation(): LocationState {
  // 현재 위치 좌표를 저장하기 위한 state입니다. 초기값은 null입니다.
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  // 에러 메시지를 저장하기 위한 state입니다. 초기값은 null입니다.
  const [error, setError] = useState<string | null>(null);

  // 컴포넌트가 처음 렌더링될 때 한 번만 실행됩니다. (의존성 배열이 비어있음)
  useEffect(() => {
    // 브라우저가 Geolocation API를 지원하지 않는 경우,
    if (!navigator.geolocation) {
      setError("이 브라우저에서는 위치 정보가 지원되지 않습니다.");
      setCurrentLocation({ lat: 37.5665, lng: 126.9780 }); // 기본 위치(서울 시청)로 설정합니다.
      return; // 함수 실행을 종료합니다.
    }

    // Geolocation API를 호출하여 현재 위치를 요청합니다.
    navigator.geolocation.getCurrentPosition(
      // 성공 콜백 함수: 위치 정보를 성공적으로 가져왔을 때 실행됩니다.
      (position) => {
        setError(null); // 에러 상태를 초기화합니다.
        setCurrentLocation({ // 가져온 위도와 경도로 상태를 업데이트합니다.
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      // 실패 콜백 함수: 위치 정보 가져오기에 실패했을 때(예: 사용자가 거부) 실행됩니다.
      () => {
        setError("위치 정보 접근이 거부되었습니다. 지도가 기본 위치로 표시됩니다.");
        setCurrentLocation({ lat: 37.5665, lng: 126.9780 }); // 기본 위치(서울 시청)로 설정합니다.
      }
    );
  }, []); // 빈 배열은 이 useEffect가 마운트 시에만 실행되도록 합니다.

  // 최종적으로 현재 위치와 에러 상태를 객체 형태로 반환합니다.
  return { currentLocation, error };
}
