"use client";

import {getWeatherIcon} from "@/utils/weather/weatherIcons";
import {WiHumidity} from "react-icons/wi";
import {PiWindDuotone} from "react-icons/pi";
import {WiDust} from "react-icons/wi";
import {GiDustCloud} from "react-icons/gi";
import {CiTempHigh} from "react-icons/ci";
import {AirPollutionData} from "@/types/weather/airPollutionData";
import {WeatherData} from "@/types/weather/weatherData";
import {checkHumidity, checkPM10, checkPM25, checkTemp, checkWind} from "@/utils/weather/walkingScores";
import totalWalkingScore from "@/utils/weather/totalWalkingScore";
import {FaThumbsDown, FaThumbsUp} from "react-icons/fa";

interface WeatherComponentProps {
  weather: WeatherData;
  currentLocation: { lat: number | undefined; lng: number | undefined } | null;
  isWeatherLoading: boolean;
  isWeatherError: boolean;
  airPollution: AirPollutionData;
  isAirPollutionLoading: boolean;
  isAirPollutionError: boolean;
  koreaTime: string;
}

export default function CurrentWeatherComponent({ weather, currentLocation, isWeatherLoading, isWeatherError, airPollution, isAirPollutionLoading, isAirPollutionError, koreaTime }: WeatherComponentProps) {
  if (!currentLocation) return <p>위치 정보를 가져오는 중...</p>;
  if (isWeatherLoading) return <p>날씨 불러오는 중...</p>;
  if (isWeatherError || !weather) return <p>날씨 정보를 가져오지 못했습니다.</p>;
  if (isAirPollutionLoading) return <p>미세먼지 정보 불러오는 중...</p>
  if (isAirPollutionError || !airPollution) return <p>미세먼지 정보를 가져오지 못했습니다.</p>

  const weatherIcon = getWeatherIcon(weather.weather[0].main);

  const tempInCelsius = weather.main.temp - 273.15;
  const tempScore = checkTemp(tempInCelsius);
  const humidityScore = checkHumidity(weather.main.humidity);
  const windScore = checkWind(weather.wind.speed);
  const pm10Score = checkPM10(airPollution.list[0].components.pm10);
  const pm25Score = checkPM25(airPollution.list[0].components.pm2_5);

  const { score, comment } = totalWalkingScore({ tempScore, humidityScore, windScore, pm10Score, pm25Score });

  const getScoreVisuals = (score: number) => {
    if (score >= 80) return { icon: <FaThumbsUp />, color: "text-green-300" };
    if (score >= 60) return { icon: <FaThumbsUp />, color: "text-lime-300" };
    if (score >= 40) return { icon: <FaThumbsDown />, color: "text-yellow-300" };
    return { icon: <FaThumbsDown />, color: "text-red-300" };
  };

  const scoreVisuals = getScoreVisuals(score);

  return (
    <div className="flex flex-col bg-blue-500 rounded-lg p-8 font-bold text-white shadow-sm">
      <div className="flex justify-between">
        <div className="flex flex-col">
          <h2 className="text-3xl py-2">{weather.name}</h2>
          <p className="font-thin text-sm">{koreaTime}</p>
        </div>
        <div className="flex flex-col">
          <p className="text-3xl">{(weather.main.temp - 273.15).toFixed(2)}°C</p>
          <p className="text-4xl">{weatherIcon}</p>
        </div>
      </div>
      <div className="grid grid-cols-5 md:grid-cols-5 gap-6 pt-6">
        <div className="flex flex-col items-center">
          <WiHumidity className="bg-white/20 w-12 h-12 p-2"/>
          <span className="font-thin py-0.5">습도</span>
          <span>{weather.main.humidity}%</span>
        </div>

        <div className="flex flex-col items-center">
          <PiWindDuotone className="bg-white/20 w-12 h-12 p-2"/>
          <span className="font-thin py-0.5">풍속</span>
          <span>{weather.wind.speed} m/s</span>
        </div>

        <div className="flex flex-col items-center">
          <WiDust className="bg-white/20 w-12 h-12 p-2"/>
          <span className="font-thin py-0.5">미세먼지</span>
          <span>{airPollution.list[0].components.pm10}µg/m³</span>
        </div>

        <div className="flex flex-col items-center">
          <GiDustCloud className="bg-white/20 w-12 h-12 p-2"/>
          <span className="font-thin py-0.5">초미세먼지</span>
          <span>{airPollution.list[0].components.pm2_5}µg/m³</span>
        </div>

        <div className="flex flex-col items-center">
          <CiTempHigh className="bg-white/20 w-12 h-12 p-2"/>
          <span className="font-thin py-0.5">체감 온도</span>
          <span>{(weather.main.feels_like - 273.15).toFixed(2)}°C</span>
        </div>
      </div>

      <div className="flex justify-between items-center bg-white/20 rounded-lg p-4 mt-4">
        <div>
          <h3 className="font-semibold">산책 적합도</h3>
          <p className="text-sm font-light">{comment}</p>
        </div>
        <div className={`flex items-center gap-2 text-2xl ${scoreVisuals.color}`}>
          <span>{score}점</span>
          {scoreVisuals.icon}
        </div>
      </div>
    </div>
  )
}
