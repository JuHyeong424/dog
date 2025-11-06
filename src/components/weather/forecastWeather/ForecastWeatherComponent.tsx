import { ForecastData } from "@/types/weather/forecastData";
import React from "react";
import {AirPollutionForecastData} from "@/types/weather/airPoluttionForecastData";
import ForecastItemComponent from "@/components/weather/forecastWeather/ForecastItemComponent";
import {ForecastItemProps} from "@/types/weather/chartForecastWeatherData";

interface ForecastWeatherComponentProps {
  chartData: ForecastItemProps[];
  forecastWeather: ForecastData;
  isForecastWeatherIsLoading: boolean;
  isForecastWeatherIsError: boolean;
  forecastAirPollution: AirPollutionForecastData;
  isForecastAirPollutionIsLoading: boolean;
  isForecastAirPollutionIsError: boolean;
}

export default function ForecastWeatherComponent(
  {
    chartData, forecastWeather, isForecastWeatherIsLoading, isForecastWeatherIsError,
    forecastAirPollution, isForecastAirPollutionIsLoading, isForecastAirPollutionIsError
  }: ForecastWeatherComponentProps) {
  if (isForecastWeatherIsLoading || isForecastAirPollutionIsLoading) return <div>날씨 예보를 불러오는 중...</div>;
  if (isForecastWeatherIsError || isForecastAirPollutionIsError || !forecastWeather || !forecastAirPollution) return <div>날씨 예보를 불러오지 못했습니다.</div>;

  console.log(chartData)

  if (chartData.length === 0) {
    return <div>표시할 예보 데이터가 없습니다.</div>;
  }

  return (
    <div className="w-4/7 p-8 bg-blue-500 rounded-xl shadow-lg">
      <div className="overflow-x-auto forecast-custom-scrollbar">
        <div style={{width: chartData.length * 96}}>
          <div className="flex flex-row h-56">
            {chartData.map((item, index) => (
              <ForecastItemComponent key={index} {...item} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
