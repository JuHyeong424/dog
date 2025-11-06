import { ForecastData } from "@/types/weather/forecastData";
import { AirPollutionForecastData } from "@/types/weather/airPoluttionForecastData";

// UI 컴포넌트에서 사용하기 편리하도록 가공된 최종 예보 데이터 항목의 구조를 정의합니다.
export interface FormattedForecastItem {
  time: string;      // 표시될 시간 (예: "오후 3시")
  weather: string;   // 날씨 상태 (예: "Clear", "Rain")
  temp: number;      // 온도 (섭씨)
  pop: number;       // 강수 확률 (%)
  pm10: number;      // 미세먼지 수치
  pm25: number;      // 초미세먼지 수치
  humidity: number;  // 습도 (%)
  wind: number;      // 풍속 (m/s)
}

/**
 * OpenWeatherMap API에서 받은 원본 날씨 예보와 대기 오염 예보 데이터를
 * UI 컴포넌트에서 사용하기 쉬운 통합된 형태로 가공하는 함수입니다.
 * @param {ForecastData} [forecastWeather] - 5일/3시간 날씨 예보 원본 데이터
 * @param {AirPollutionForecastData} [forecastAirPollution] - 대기 오염 예보 원본 데이터
 * @returns {FormattedForecastItem[]} 가공된 시간대별 예보 데이터 배열 (최대 8개)
 */
export const processForecastData = (
  forecastWeather?: ForecastData,
  forecastAirPollution?: AirPollutionForecastData
): FormattedForecastItem[] => {
  // 필요한 데이터가 없으면 빈 배열을 반환하여 에러를 방지합니다.
  if (!forecastWeather?.list || !forecastAirPollution?.list) {
    return [];
  }

  // 날씨 예보 데이터 중 가까운 미래의 8개 항목만 사용합니다. (3시간 * 8 = 24시간)
  return forecastWeather.list.slice(0, 8).map(weatherItem => {
    // API에서 받은 UTC 시간 문자열을 한국 시간(KST)으로 변환합니다.
    // (참고: 이 방식은 서버/클라이언트 환경에 따라 다르게 동작할 수 있어 주의가 필요합니다.
    // 보다 안정적인 방법은 date-fns-tz와 같은 라이브러리를 사용하는 것입니다.)
    const kstDate = new Date(weatherItem.dt_txt + " UTC");

    // 한국 시간에 맞춰 "오전/오후"와 "시"를 계산합니다.
    const hours = kstDate.getHours();
    const ampm = hours >= 12 ? '오후' : '오전';
    const displayHour = hours % 12 || 12; // 0시는 12시로 표시

    // 현재 날씨 예보 시간(weatherItem)과 가장 시간적으로 가까운 대기 오염 예보 데이터를 찾습니다.
    // (날씨는 3시간 간격, 대기 오염은 1시간 간격이므로 시간이 정확히 일치하지 않기 때문입니다.)
    const closestAirPollution = forecastAirPollution.list.reduce((prev, curr) => {
      // 이전 항목과의 시간 차이와 현재 항목과의 시간 차이를 계산합니다.
      const prevDiff = Math.abs(prev.dt * 1000 - kstDate.getTime());
      const currDiff = Math.abs(curr.dt * 1000 - kstDate.getTime());
      // 시간 차이가 더 적은 항목을 다음 비교 대상으로 넘깁니다.
      return currDiff < prevDiff ? curr : prev;
    });

    // 최종적으로 UI에 필요한 데이터만 추출하고 단위를 변환하여 새로운 객체를 생성하고 반환합니다.
    return {
      time: `${ampm} ${displayHour}시`,
      weather: weatherItem.weather[0].main,
      temp: weatherItem.main.temp, // 온도는 섭씨로 변환하지 않고 반환합니다. (이전 코드와 다름)
      humidity: weatherItem.main.humidity,
      wind: weatherItem.wind.speed,
      pop: Math.round(weatherItem.pop * 100), // 0~1 사이의 값을 퍼센트로 변환
      pm10: closestAirPollution.components.pm10,
      pm25: closestAirPollution.components.pm2_5,
    };
  });
};
