/**
 * 도시의 좌표 정보를 나타냅니다.
 */
export interface Coord {
  lat: number;
  lon: number;
}

/**
 * 도시 정보를 나타냅니다.
 */
export interface City {
  id: number;
  name: string;
  coord: Coord;
  country: string;
  population: number;
  timezone: number;
  sunrise: number;
  sunset: number;
}

/**
 * 날씨의 주요 수치 정보를 나타냅니다.
 */
export interface MainWeatherData {
  temp: number;
  feels_like: number;
  temp_min: number;
  temp_max: number;
  pressure: number;
  sea_level: number;
  grnd_level: number;
  humidity: number;
  temp_kf: number;
}

/**
 * 날씨 상태에 대한 상세 정보를 나타냅니다. (예: "Rain", "Clouds")
 */
export interface WeatherCondition {
  id: number;
  main: string;
  description: string;
  icon: string;
}

/**
 * 구름 정보를 나타냅니다.
 */
export interface Clouds {
  all: number;
}

/**
 * 바람 정보를 나타냅니다.
 */
export interface Wind {
  speed: number;
  deg: number;
  gust: number;
}

/**
 * 강수량 정보를 나타냅니다. (선택적 프로퍼티)
 */
export interface Rain {
  "3h"?: number; // API 응답에 'rain' 객체가 없을 수도 있으므로 optional chaining 처리
}

/**
 * 시스템 정보를 나타냅니다.
 */
export interface Sys {
  pod: string; // "d" (day) 또는 "n" (night)
}

/**
 * 3시간 단위의 개별 예보 항목을 나타냅니다.
 */
export interface ForecastListItem {
  dt: number; // 타임스탬프
  main: MainWeatherData;
  weather: WeatherCondition[];
  clouds: Clouds;
  wind: Wind;
  visibility: number;
  pop: number; // 강수 확률
  rain?: Rain; // 비가 오지 않으면 이 필드가 없을 수 있음
  sys: Sys;
  dt_txt: string; // "YYYY-MM-DD HH:mm:ss" 형식의 날짜 문자열
}

export interface ForecastData {
  cod: string;
  message: number;
  cnt: number;
  list: ForecastListItem[];
  city: City;
}
