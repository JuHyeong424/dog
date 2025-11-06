import { ForecastData } from "@/types/weather/forecastData";
import { AirPollutionForecastData } from "@/types/weather/airPoluttionForecastData";

export interface FormattedForecastItem {
  time: string;
  weather: string;
  temp: number;
  pop: number;
  pm10: number;
  pm25: number;
  humidity: number;
  wind: number;
}

export const processForecastData = (
  forecastWeather?: ForecastData,
  forecastAirPollution?: AirPollutionForecastData
): FormattedForecastItem[] => {
  if (!forecastWeather?.list || !forecastAirPollution?.list) {
    return [];
  }

  return forecastWeather.list.slice(0, 8).map(weatherItem => {
    const kstDate = new Date(weatherItem.dt_txt + " UTC");

    const hours = kstDate.getHours();
    const ampm = hours >= 12 ? '오후' : '오전';
    const displayHour = hours % 12 || 12;

    const closestAirPollution = forecastAirPollution.list.reduce((prev, curr) => {
      const prevDiff = Math.abs(prev.dt * 1000 - kstDate.getTime());
      const currDiff = Math.abs(curr.dt * 1000 - kstDate.getTime());
      return currDiff < prevDiff ? curr : prev;
    });

    return {
      time: `${ampm} ${displayHour}시`,
      weather: weatherItem.weather[0].main,
      temp: weatherItem.main.temp - 273.15,
      humidity: weatherItem.main.humidity,
      wind: weatherItem.wind.speed,
      pop: Math.round(weatherItem.pop * 100),
      pm10: closestAirPollution.components.pm10,
      pm25: closestAirPollution.components.pm2_5,
    };
  });
};
