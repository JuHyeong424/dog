import { useQuery, UseQueryResult } from "@tanstack/react-query";
import axios from "axios";

interface UseAddressProps {
  lat: number | undefined;
  lon: number | undefined;
}

// 1. 반환될 데이터의 타입을 명확하게 정의합니다.
interface AddressData {
  address: string;
}

// 2. 훅의 반환 타입을 명시하여 TypeScript 오류를 해결합니다.
export function useAddress({ lat, lon }: UseAddressProps): UseQueryResult<AddressData, Error> {
  return useQuery({
    queryKey: ["address", lat, lon],
    queryFn: async () => {
      // 3. 재귀 호출 대신, 우리가 만든 백엔드 API를 호출합니다.
      const response = await axios.get<AddressData>(`/api/places/address?lat=${lat}&lon=${lon}`);
      return response.data;
    },
    // lat과 lon이 유효한 값일 때만 쿼리가 실행됩니다.
    enabled: typeof lat === 'number' && typeof lon === 'number',
  });
}
