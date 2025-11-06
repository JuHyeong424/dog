// 이 파일이 클라이언트 측에서 렌더링되는 컴포넌트임을 명시합니다.
"use client";

// 필요한 유틸리티 함수, 아이콘, 타입 정의를 가져옵니다.
import { getWeatherIcon } from "@/utils/weather/weatherIcons";
import { WiHumidity, WiDust } from "react-icons/wi";
import { PiWindDuotone } from "react-icons/pi";
import { GiDustCloud } from "react-icons/gi";
import { CiTempHigh } from "react-icons/ci";
import { FaThumbsDown, FaThumbsUp } from "react-icons/fa";
import { AirPollutionData } from "@/types/weather/airPollutionData";
import { WeatherData } from "@/types/weather/weatherData";
import { checkHumidity, checkPM10, checkPM25, checkTemp, checkWind } from "@/utils/weather/walkingScores";
import totalWalkingScore from "@/utils/weather/totalWalkingScore";

// CurrentWeatherComponent가 부모로부터 받을 props의 타입을 정의하는 인터페이스입니다.
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

// 현재 위치의 날씨, 미세먼지 정보와 산책 적합도를 종합적으로 보여주는 컴포넌트
export default function CurrentWeatherComponent({ weather, currentLocation, isWeatherLoading, isWeatherError, airPollution, isAirPollutionLoading, isAirPollutionError, koreaTime }: WeatherComponentProps) {
  // --- 로딩 및 에러 처리 ---
  // 데이터가 로드되기 전이나 에러 발생 시 사용자에게 상태를 알려줍니다.
  if (!currentLocation) return <p>위치 정보를 가져오는 중...</p>;
  if (isWeatherLoading) return <p>날씨 불러오는 중...</p>;
  if (isWeatherError || !weather) return <p>날씨 정보를 가져오지 못했습니다.</p>;
  if (isAirPollutionLoading) return <p>미세먼지 정보 불러오는 중...</p>
  if (isAirPollutionError || !airPollution) return <p>미세먼지 정보를 가져오지 못했습니다.</p>

  // --- 데이터 가공 및 계산 ---
  // 현재 날씨 상태(예: "Clear", "Rain")에 맞는 아이콘을 가져옵니다.
  const weatherIcon = getWeatherIcon(weather.weather[0].main);

  // 각 날씨/환경 요소를 '산책 적합도' 점수로 변환합니다.
  const tempInCelsius = weather.main.temp - 273.15; // API에서 받은 켈빈 온도를 섭씨로 변환
  const tempScore = checkTemp(tempInCelsius);
  const humidityScore = checkHumidity(weather.main.humidity);
  const windScore = checkWind(weather.wind.speed);
  const pm10Score = checkPM10(airPollution.list[0].components.pm10);
  const pm25Score = checkPM25(airPollution.list[0].components.pm2_5);

  // 개별 점수들을 합산하여 최종 '산책 적합도' 점수와 코멘트를 계산합니다.
  const { score, comment } = totalWalkingScore({ tempScore, humidityScore, windScore, pm10Score, pm25Score });

  // 최종 점수에 따라 표시할 아이콘과 색상을 결정하는 함수
  const getScoreVisuals = (score: number) => {
    if (score >= 80) return { icon: <FaThumbsUp />, color: "text-green-300" };
    if (score >= 60) return { icon: <FaThumbsUp />, color: "text-lime-300" };
    if (score >= 40) return { icon: <FaThumbsDown />, color: "text-yellow-300" };
    return { icon: <FaThumbsDown />, color: "text-red-300" };
  };

  // 현재 점수에 맞는 시각적 요소를 가져옵니다.
  const scoreVisuals = getScoreVisuals(score);

  // --- 렌더링 ---
  return (
    // 전체 컴포넌트를 감싸는 카드 형태의 컨테이너
    <div className="flex flex-col bg-blue-500 rounded-lg p-8 font-bold text-white shadow-sm">
      {/* 상단: 지역 이름, 시간, 현재 온도, 날씨 아이콘 */}
      <div className="flex justify-between">
        <div className="flex flex-col">
          <h2 className="text-3xl py-2">{weather.name}</h2>
          <p className="font-thin text-sm">{koreaTime}</p>
        </div>
        <div className="flex flex-col items-end">
          <p className="text-3xl">{(weather.main.temp - 273.15).toFixed(2)}°C</p>
          <p className="text-4xl">{weatherIcon}</p>
        </div>
      </div>
      {/* 중단: 습도, 풍속, 미세먼지 등 상세 정보 그리드 */}
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

      {/* 하단: 산책 적합도 점수 및 코멘트 */}
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
