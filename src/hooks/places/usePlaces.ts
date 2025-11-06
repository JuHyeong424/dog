import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Place } from '@/types/place'; // Place 타입을 별도 파일에서 관리한다고 가정

// 1. usePlacesProps 인터페이스에 enabled 속성 추가 (선택적)
interface usePlacesProps {
  lat: number | undefined;
  lon: number | undefined;
  query: string;
  enabled?: boolean; // API 호출을 제어할 수 있도록 enabled 옵션 추가
}

export function usePlaces({ lat, lon, query, enabled = true }: usePlacesProps) {
  return useQuery<Place[]>({
    queryKey: ["places", lat, lon, query],
    queryFn: async () => {
      const { data } = await axios.get(`/api/places`, {
        params: { lat, lon, query },
      });
      return data;
    },
    // 2. 외부에서 받은 enabled 값과 기본 조건을 함께 사용하여 API 호출 여부 결정
    enabled: !!lat && !!lon && !!query && enabled,
  });
}