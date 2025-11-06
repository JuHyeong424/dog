"use client";

import useCurrentLocation from "@/hooks/useCurrentLocation";
import useCurrentDate from "@/hooks/useCurrentDate";
import {processForecastData} from "@/utils/weather/processForecastData";
import {useOpenWeather} from "@/hooks/weather/useOpenWeather";
import {useAirPollution} from "@/hooks/weather/useAirPollution";
import useForecastWeather from "@/hooks/weather/useForecastWeather";
import {useForecastAirPollution} from "@/hooks/weather/useForecastAirPollution";
import WalkingOKComponent from "@/components/weather/currentWeather/WalkingOKComponent";
import ForecastScoreComponent from "@/components/weather/forecastWeather/ForecastScoreComponent";
import ForecastWeatherComponent from "@/components/weather/forecastWeather/ForecastWeatherComponent";
import CurrentWeatherComponent from "@/components/weather/currentWeather/CurrentWeatherComponent";

export default function WeatherComponent() {
  const locationData = useCurrentLocation();
  const location = locationData.currentLocation;

  const { data: weather, isLoading: isWeatherLoading, isError: isWeatherError} = useOpenWeather({
    lat: location?.lat,
    lon: location?.lng
  });
  const { data: airPollution, isLoading: isAirPollutionLoading, isError: isAirPollutionError} = useAirPollution({
    lat: location?.lat,
    lon: location?.lng
  });
  const koreaTime = useCurrentDate();

  const { data: forecastWeather, isLoading: isForecastWeatherIsLoading, isError: isForecastWeatherIsError } = useForecastWeather({
    lat: location?.lat,
    lon: location?.lng
  });

  const { data: forecastAirPollution, isLoading: isForecastAirPollutionIsLoading, isError: isForecastAirPollutionIsError } = useForecastAirPollution({
    lat: location?.lat,
    lon: location?.lng
  });

  const chartData = processForecastData(forecastWeather, forecastAirPollution);

  return (
    <div className="bg-gray-100 py-20">
      <div>
        <h1 className="text-4xl font-bold">날씨 기반 산책 적합도</h1>
        <p className="text-gray-500 py-2">실시간 기상 정보를 바탕으로 최적 산책 시간을 확인하세요</p>
      </div>
      <div className="flex flex-row items-start gap-20">
        <CurrentWeatherComponent
          weather={weather} currentLocation={location} isWeatherLoading={isWeatherLoading}
          isWeatherError={isWeatherError}
          airPollution={airPollution} isAirPollutionLoading={isAirPollutionLoading}
          isAirPollutionError={isAirPollutionError}
          koreaTime={koreaTime}
        />
        <WalkingOKComponent
          temperature={weather?.main.temp} humidity={weather?.main.humidity} wind={weather?.wind.speed}
          pm10={airPollution?.list[0].components.pm10} pm25={airPollution?.list[0].components.pm2_5}
        />
      </div>
      <div className="pt-4">
        <h1 className="text-4xl font-bold">기상 예보 기반 산책 적합도</h1>
        <p className="text-gray-500 py-2">기상 예보 정보를 바탕으로 최적 산책 시간을 확인하세요</p>
      </div>
      <div className="flex flex-row items-start gap-20 py-4">
        <ForecastWeatherComponent
          chartData={chartData}
          forecastWeather={forecastWeather}
          isForecastWeatherIsLoading={isForecastWeatherIsLoading}
          isForecastWeatherIsError={isForecastWeatherIsError}
          forecastAirPollution={forecastAirPollution}
          isForecastAirPollutionIsLoading={isForecastAirPollutionIsLoading}
          isForecastAirPollutionIsError={isForecastAirPollutionIsError}
        />

        <ForecastScoreComponent
          chartData={chartData}
          forecastWeather={forecastWeather}
          isForecastWeatherIsLoading={isForecastWeatherIsLoading}
          isForecastWeatherIsError={isForecastWeatherIsError}
          forecastAirPollution={forecastAirPollution}
          isForecastAirPollutionIsLoading={isForecastAirPollutionIsLoading}
          isForecastAirPollutionIsError={isForecastAirPollutionIsError}
        />
      </div>
    </div>
  )
}
