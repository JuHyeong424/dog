import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

// Google Place Details API로부터 받아올 데이터의 구조를 정의하는 인터페이스입니다.
export interface PlaceDetails {
  name: string;
  vicinity: string; // 주소
  formatted_phone_number?: string;
  photos?: { photo_reference: string }[]; // 사진 참조 ID 배열
  rating?: number;
  reviews?: any[];
  opening_hours?: { weekday_text: string[] }; // 영업 시간 정보
  geometry?: {
    location: {
      lat: number;
      lng: number;
    };
  };
}

/**
 * placeId를 사용하여 특정 장소의 상세 정보를 가져오는 React Query 커스텀 훅입니다.
 * @param {string | null} placeId - 상세 정보를 조회할 장소의 ID. null이면 쿼리가 실행되지 않습니다.
 * @returns React Query의 쿼리 객체 ({ data, isLoading, isError, ... })
 */
export function usePlaceDetails(placeId: string | null) {
  // useQuery 훅을 사용하여 데이터 fetching, 캐싱, 상태 관리를 처리합니다.
  return useQuery<PlaceDetails>({
    // 쿼리 키: 이 쿼리를 고유하게 식별합니다. placeId가 변경되면 쿼리가 다시 실행됩니다.
    queryKey: ['placeDetails', placeId],

    // 데이터 fetching 함수: 실제 API 요청을 수행합니다.
    queryFn: async () => {
      // placeId가 없으면 API 요청을 보내지 않고 null을 반환합니다.
      if (!placeId) return null;
      // 우리 서버의 Next.js API 라우트(/api/places/[placeId])로 GET 요청을 보냅니다.
      // (클라이언트에서 직접 Google API를 호출하지 않고, 서버를 통해 안전하게 호출)
      const response = await axios.get(`/api/places/${placeId}`);
      // API 응답에서 실제 장소 데이터를 반환합니다.
      return response.data;
    },

    // enabled 옵션: 이 값이 true일 때만 쿼리가 자동으로 실행됩니다.
    // placeId가 존재할 때(truthy)만 API 요청을 보내도록 설정하여 불필요한 호출을 방지합니다.
    enabled: !!placeId,
  });
}
