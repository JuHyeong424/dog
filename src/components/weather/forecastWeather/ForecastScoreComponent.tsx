import { ForecastData } from "@/types/weather/forecastData";
import React from "react";
import {AirPollutionForecastData} from "@/types/weather/airPoluttionForecastData";
import {ForecastItemProps} from "@/types/weather/chartForecastWeatherData";
import totalWalkingScore from "@/utils/weather/totalWalkingScore";
import {checkHumidity, checkPM10, checkPM25, checkTemp, checkWind} from "@/utils/weather/walkingScores";

interface ForecastScoreProps {
  chartData: ForecastItemProps[];
  forecastWeather: ForecastData;
  isForecastWeatherIsLoading: boolean;
  isForecastWeatherIsError: boolean;
  forecastAirPollution: AirPollutionForecastData;
  isForecastAirPollutionIsLoading: boolean;
  isForecastAirPollutionIsError: boolean;
}

export default function ForecastScoreComponent(
  {
    chartData, forecastWeather, isForecastWeatherIsLoading, isForecastWeatherIsError,
    forecastAirPollution, isForecastAirPollutionIsLoading, isForecastAirPollutionIsError
  }: ForecastScoreProps) {
  const totalScores = chartData.map(item => {
    const tempScore = checkTemp(item.temp - 273.15);
    const humidityScore = checkHumidity(item.humidity);
    const windScore = checkWind(item.wind);
    const pm10Score = checkPM10(item.pm10);
    const pm25Score = checkPM25(item.pm25);

    return totalWalkingScore({ time: item.time, tempScore, humidityScore, windScore, pm10Score, pm25Score });
  });

  const totalScoreComment = ((item: number) => {
    if (item >= 80) return "매우 좋음";
    if (item >= 60) return "좋음";
    if (item >= 40) return "보통";
    return "주의";
  });

  const getScoreFontColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-blue-500";
    if (score >= 40) return "text-yellow-500";
    return "text-red-500";
  };

  const getScoreBGColor = (score: number) => {
    if (score >= 80) return "bg-green-100";
    if (score >= 60) return "bg-blue-100";
    if (score >= 40) return "bg-yellow-100";
    return "bg-red-100";
  };

  if (isForecastWeatherIsLoading || isForecastAirPollutionIsLoading) return <div>날씨 예보를 불러오는 중...</div>;
  if (isForecastWeatherIsError || isForecastAirPollutionIsError || !forecastWeather || !forecastAirPollution) return <div>날씨 예보를 불러오지 못했습니다.</div>;

  console.log("t", totalScores)

  return (
    <div className="bg-white rounded-xl w-2/7 p-5 shadow-sm">
      <h1 className="text-2xl font-bold">산책 추천 시간</h1>
      {totalScores.map((item) => (
        <div
          key={item.time}
          className={`flex flex-row justify-between ${getScoreBGColor(item.score)} py-3 px-4 rounded-xl my-4`}
        >
          <div className="text-gray-500">{item.time}</div>
          <div className={`${getScoreFontColor(item.score)} font-bold`}>{totalScoreComment(item.score)}</div>
        </div>
      ))}
    </div>
  );
}
