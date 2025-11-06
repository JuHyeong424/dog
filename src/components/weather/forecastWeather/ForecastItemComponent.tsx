import {getWeatherIcon} from "@/utils/weather/weatherIcons";
import {FaDroplet} from "react-icons/fa6";
import {WiDust, WiSmoke} from "react-icons/wi";
import React from "react";
import {ForecastItemProps} from "@/types/weather/chartForecastWeatherData";

// 시간대별 예보 목록의 개별 아이템 하나를 표시하는 UI 컴포넌트입니다.
export default function ForecastItemComponent({ time, weather, temp, pop, pm10, pm25 }: ForecastItemProps) {
  // 날씨 상태 문자열(예: "Clear", "Rain")에 맞는 아이콘 컴포넌트를 가져옵니다.
  const weatherIcon = getWeatherIcon(weather);

  // 미세먼지(pm10)와 초미세먼지(pm25) 수치에 따라 텍스트 색상을 결정하는 함수입니다.
  const getPmColor = (value: number, type: 'pm10' | 'pm25') => {
    // 'pm10'과 'pm25'의 좋음/보통/나쁨 기준값을 정의합니다.
    const thresholds = type === 'pm10' ? { good: 30, normal: 80, bad: 150 } : { good: 15, normal: 35, bad: 75 };
    // 수치에 따라 적절한 Tailwind CSS 색상 클래스를 반환합니다.
    if (value <= thresholds.good) return 'text-blue-300';   // 좋음
    if (value <= thresholds.normal) return 'text-green-300'; // 보통
    if (value <= thresholds.bad) return 'text-yellow-300';  // 나쁨
    return 'text-red-400';                                  // 매우 나쁨
  };

  return (
    // 개별 예보 아이템의 전체 컨테이너. 가로 스크롤을 위해 고정 너비를 가집니다.
    <div className="flex flex-col items-center justify-start flex-shrink-0 w-24 h-full gap-2 text-white">
      {/* 상단: 시간, 날씨 아이콘, 온도 정보 */}
      <div className="flex flex-col items-center flex-grow gap-3">
        <span className="text-sm font-semibold">{time}</span>
        <span className="text-4xl">{weatherIcon}</span>
        <span className="text-xl font-bold">{temp.toFixed(0)}°</span>
      </div>
      {/* 중단: 강수 확률 정보 */}
      <div className="flex items-center gap-1 text-sm font-semibold">
        <FaDroplet className="text-blue-200" />
        <span>{pop}%</span>
      </div>
      {/* 하단: 미세먼지 및 초미세먼지 정보 */}
      <div className="flex flex-col items-center w-full pt-3 mt-3 border-t border-white/20">
        {/* 미세먼지(pm10) 정보 */}
        <div className={`flex items-center gap-1 text-xs ${getPmColor(pm10, 'pm10')}`}>
          <WiDust size={20} />
          <span>{pm10.toFixed(0)}</span>
        </div>
        {/* 초미세먼지(pm25) 정보 */}
        <div className={`flex items-center gap-1 text-xs ${getPmColor(pm25, 'pm25')}`}>
          <WiSmoke size={20} />
          <span>{pm25.toFixed(0)}</span>
        </div>
      </div>
    </div>
  );
}
