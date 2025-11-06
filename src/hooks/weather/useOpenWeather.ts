import {useQuery} from "@tanstack/react-query";
import axios from "axios";

// useOpenWeather 훅이 인자로 받을 객체의 타입을 정의하는 인터페이스입니다.
interface useOpenWeatherProps {
  lon: number | undefined; // 경도
  lat: number | undefined; // 위도
}

/**
 * 위도와 경도를 기반으로 해당 위치의 '현재' 날씨 정보를 가져오는 React Query 커스텀 훅입니다.
 * @param {useOpenWeatherProps} { lon, lat } - 위도와 경도
 * @returns React Query의 쿼리 객체 ({ data, isLoading, isError, ... })
 */
export function useOpenWeather({ lon, lat }: useOpenWeatherProps) {
  // useQuery 훅을 사용하여 데이터 fetching, 캐싱, 상태 관리를 처리합니다.
  return useQuery({
    // 쿼리 키: 이 쿼리를 고유하게 식별합니다. 위도(lat)나 경도(lon)가 변경되면 쿼리가 다시 실행됩니다.
    queryKey: ["openWeather", lat, lon],

    // 데이터 fetching 함수: 실제 API 요청을 수행합니다.
    queryFn: async () => {
      // 우리 서버의 Next.js API 라우트(/api/openWeather)로 GET 요청을 보냅니다.
      // 위도와 경도는 URL 쿼리 파라미터로 전달됩니다.
      const res = await axios.get(`/api/openWeather?lat=${lat}&lon=${lon}`);
      // API 응답에서 실제 현재 날씨 데이터를 반환합니다.
      return res.data;
    },

    // enabled 옵션: 이 값이 true일 때만 쿼리가 자동으로 실행됩니다.
    // 위도(lat)와 경도(lon)가 모두 유효한 값(truthy)일 때만 API 요청을 보내도록 설정합니다.
    enabled: !!lat && !!lon,

    // staleTime 옵션: 데이터를 'fresh' 상태로 유지할 시간을 설정합니다.
    // 5분 (1000ms * 60초 * 5분) 동안은 fresh 상태로 간주되어,
    // 동일한 쿼리 키로 다시 요청이 발생해도 캐시된 데이터를 사용하고 API를 호출하지 않습니다.
    staleTime: 1000 * 60 * 5,
  });
}
