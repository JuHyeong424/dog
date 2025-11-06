import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Place } from '@/types/place';

// usePlaces 훅이 인자로 받을 객체의 타입을 정의하는 인터페이스입니다.
interface usePlacesProps {
  lat: number | undefined;     // 위도
  lon: number | undefined;     // 경도
  query: string;               // 검색어 (예: "애견 동반 카페")
  enabled?: boolean;           // 쿼리를 활성화할지 여부를 외부에서 제어하기 위한 옵션
}

/**
 * 위도, 경도, 검색어를 기반으로 주변 장소를 검색하는 React Query 커스텀 훅입니다.
 * @param {usePlacesProps} { lat, lon, query, enabled = true } - 위도, 경도, 검색어 및 활성화 옵션
 * @returns React Query의 쿼리 객체 ({ data, isLoading, isError, ... })
 */
export function usePlaces({ lat, lon, query, enabled = true }: usePlacesProps) {
  // useQuery 훅을 사용하여 데이터 fetching, 캐싱, 상태 관리를 처리합니다.
  return useQuery<Place[]>({
    // 쿼리 키: 이 쿼리를 고유하게 식별합니다. 위도, 경도, 검색어가 변경되면 쿼리가 다시 실행됩니다.
    queryKey: ["places", lat, lon, query],

    // 데이터 fetching 함수: 실제 API 요청을 수행합니다.
    queryFn: async () => {
      // 우리 서버의 Next.js API 라우트(/api/places)로 GET 요청을 보냅니다.
      // 위도, 경도, 검색어는 URL 쿼리 파라미터로 전달됩니다.
      const { data } = await axios.get(`/api/places`, {
        params: { lat, lon, query },
      });
      // API 응답에서 실제 장소 데이터 배열을 반환합니다.
      return data;
    },

    // enabled 옵션: 이 값이 true일 때만 쿼리가 자동으로 실행됩니다.
    // 위도(lat), 경도(lon), 검색어(query)가 모두 유효한 값(truthy)이고,
    // 외부에서 전달된 enabled prop도 true일 때만 API 요청을 보내도록 설정합니다.
    enabled: !!lat && !!lon && !!query && enabled,
  });
}
