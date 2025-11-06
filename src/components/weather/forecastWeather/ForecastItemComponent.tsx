import {getWeatherIcon} from "@/utils/weather/weatherIcons";
import {FaDroplet} from "react-icons/fa6";
import {WiDust, WiSmoke} from "react-icons/wi";
import React from "react";
import {ForecastItemProps} from "@/types/weather/chartForecastWeatherData";

export default function ForecastItemComponent({ time, weather, temp, pop, pm10, pm25 }: ForecastItemProps) {
  const weatherIcon = getWeatherIcon(weather);

  const getPmColor = (value: number, type: 'pm10' | 'pm25') => {
    const thresholds = type === 'pm10' ? { good: 30, normal: 80, bad: 150 } : { good: 15, normal: 35, bad: 75 };
    if (value <= thresholds.good) return 'text-blue-300';
    if (value <= thresholds.normal) return 'text-green-300';
    if (value <= thresholds.bad) return 'text-yellow-300';
    return 'text-red-400';
  };

  return (
    <div className="flex flex-col items-center justify-start flex-shrink-0 w-24 h-full gap-2 text-white">
      <div className="flex flex-col items-center flex-grow gap-3">
        <span className="text-sm font-semibold">{time}</span>
        <span className="text-4xl">{weatherIcon}</span>
        <span className="text-xl font-bold">{temp.toFixed(0)}°</span>
      </div>
      <div className="flex items-center gap-1 text-sm font-semibold">
        <FaDroplet className="text-blue-200" />
        <span>{pop}%</span>
      </div>
      <div className="flex flex-col items-center w-full pt-3 mt-3 border-t border-white/20">
        <div className={`flex items-center gap-1 text-xs ${getPmColor(pm10, 'pm10')}`}>
          <WiDust size={20} />
          <span>{pm10.toFixed(0)}</span>
        </div>
        <div className={`flex items-center gap-1 text-xs ${getPmColor(pm25, 'pm25')}`}>
          <WiSmoke size={20} />
          <span>{pm25.toFixed(0)}</span>
        </div>
      </div>
    </div>
  );
}
