"use client";

import { useEffect, useState } from "react";

interface LocationState {
  currentLocation: { lat: number; lng: number } | null;
  error: string | null;
}

// 파일에서 export default를 사용하셨으므로 그대로 유지합니다.
export default function useCurrentLocation(): LocationState {
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("이 브라우저에서는 위치 정보가 지원되지 않습니다.");
      // [추가] 지원되지 않을 때도 기본 위치 설정
      setCurrentLocation({ lat: 37.5665, lng: 126.9780 });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      // 성공 콜백
      (position) => {
        setError(null);
        setCurrentLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      // 실패 콜백
      () => {
        setError("위치 정보 접근이 거부되었습니다. 지도가 기본 위치로 표시됩니다.");
        // [가장 중요] 실패 시 기본 위치(서울)를 설정하여 지도가 에러 없이 렌더링되도록 합니다.
        setCurrentLocation({ lat: 37.5665, lng: 126.9780 });
      }
    );
  }, []);

  return { currentLocation, error };
}
