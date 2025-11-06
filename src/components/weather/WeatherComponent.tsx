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

// 현재 날씨와 예보 정보를 종합적으로 보여주는 페이지의 메인 컴포넌트입니다.
export default function WeatherComponent() {
  // --- 데이터 Fetching 및 가공 ---

  // 1. 현재 위치 정보 가져오기
  const locationData = useCurrentLocation();
  const location = locationData.currentLocation;

  // 2. 현재 날씨 및 미세먼지 정보 가져오기 (위치 정보를 기반으로)
  const { data: weather, isLoading: isWeatherLoading, isError: isWeatherError} = useOpenWeather({
    lat: location?.lat,
    lon: location?.lng
  });
  const { data: airPollution, isLoading: isAirPollutionLoading, isError: isAirPollutionError} = useAirPollution({
    lat: location?.lat,
    lon: location?.lng
  });
  const koreaTime = useCurrentDate(); // 현재 한국 시간

  // 3. 5일/3시간 단위의 날씨 및 미세먼지 예보 정보 가져오기 (위치 정보를 기반으로)
  const { data: forecastWeather, isLoading: isForecastWeatherIsLoading, isError: isForecastWeatherIsError } = useForecastWeather({
    lat: location?.lat,
    lon: location?.lng
  });
  const { data: forecastAirPollution, isLoading: isForecastAirPollutionIsLoading, isError: isForecastAirPollutionIsError } = useForecastAirPollution({
    lat: location?.lat,
    lon: location?.lng
  });

  // 4. 가져온 예보 데이터(날씨, 미세먼지)를 UI에서 사용하기 쉬운 형태로 가공합니다.
  const chartData = processForecastData(forecastWeather, forecastAirPollution);

  // --- 렌더링 ---
  return (
    <div className="bg-gray-100 py-20">
      {/* === 현재 날씨 섹션 === */}
      <div>
        <h1 className="text-4xl font-bold">날씨 기반 산책 적합도</h1>
        <p className="text-gray-500 py-2">실시간 기상 정보를 바탕으로 최적 산책 시간을 확인하세요</p>
      </div>
      <div className="flex flex-row items-start gap-20">
        {/* 왼쪽: 현재 날씨와 미세먼지 정보를 종합적으로 보여주는 컴포넌트 */}
        <CurrentWeatherComponent
          weather={weather} currentLocation={location} isWeatherLoading={isWeatherLoading}
          isWeatherError={isWeatherError}
          airPollution={airPollution} isAirPollutionLoading={isAirPollutionLoading}
          isAirPollutionError={isAirPollutionError}
          koreaTime={koreaTime}
        />
        {/* 오른쪽: 현재 날씨 기반의 산책 적합도를 계산하고 시각화하는 컴포넌트 */}
        <WalkingOKComponent
          temperature={weather?.main.temp} humidity={weather?.main.humidity} wind={weather?.wind.speed}
          pm10={airPollution?.list[0].components.pm10} pm25={airPollution?.list[0].components.pm2_5}
        />
      </div>

      {/* === 날씨 예보 섹션 === */}
      <div className="pt-4">
        <h1 className="text-4xl font-bold">기상 예보 기반 산책 적합도</h1>
        <p className="text-gray-500 py-2">기상 예보 정보를 바탕으로 최적 산책 시간을 확인하세요</p>
      </div>
      <div className="flex flex-row items-start gap-20 py-4">
        {/* 왼쪽: 시간대별 예보를 가로 스크롤 목록으로 보여주는 컴포넌트 */}
        <ForecastWeatherComponent
          chartData={chartData}
          forecastWeather={forecastWeather}
          isForecastWeatherIsLoading={isForecastWeatherIsLoading}
          isForecastWeatherIsError={isForecastWeatherIsError}
          forecastAirPollution={forecastAirPollution}
          isForecastAirPollutionIsLoading={isForecastAirPollutionIsLoading}
          isForecastAirPollutionIsError={isForecastAirPollutionIsError}
        />
        {/* 오른쪽: 시간대별 산책 적합도를 계산하여 추천 시간을 목록으로 보여주는 컴포넌트 */}
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
