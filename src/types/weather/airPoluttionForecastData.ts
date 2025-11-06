/**
 * 지리적 좌표 정보를 나타냅니다.
 */
export interface Coord {
  lat: number;
  lon: number;
}

/**
 * 대기 질 지수(AQI) 정보를 나타냅니다.
 * 1 = 좋음, 2 = 양호, 3 = 보통, 4 = 나쁨, 5 = 매우 나쁨
 */
export interface MainAirQuality {
  aqi: 1 | 2 | 3 | 4 | 5;
}

/**
 * 대기 오염 물질의 농도 정보를 나타냅니다. (단위: μg/m³)
 */
export interface AirComponents {
  co: number;    // 일산화탄소
  nh3: number;   // 암모니아
  no: number;    // 일산화질소
  no2: number;   // 이산화질소
  o3: number;    // 오존
  pm2_5: number; // 초미세먼지
  pm10: number;  // 미세먼지
  so2: number;   // 이산화황
}

/**
 * 시간별 대기 오염 예보 항목을 나타냅니다.
 */
export interface AirPollutionForecastListItem {
  main: MainAirQuality;
  components: AirComponents;
  dt: number; // 예보 데이터 시간 (Unix timestamp, UTC)
}

/**
 * OpenWeatherMap 대기 오염 예보 API의 전체 응답 구조를 나타냅니다.
 */
export interface AirPollutionForecastData {
  coord: Coord;
  list: AirPollutionForecastListItem[];
}
