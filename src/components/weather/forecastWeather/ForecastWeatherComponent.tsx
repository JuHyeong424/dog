import { ForecastData } from "@/types/weather/forecastData";
import React from "react";
import {AirPollutionForecastData} from "@/types/weather/airPoluttionForecastData";
import ForecastItemComponent from "@/components/weather/forecastWeather/ForecastItemComponent";
import {ForecastItemProps} from "@/types/weather/chartForecastWeatherData";

// ForecastWeatherComponent가 부모로부터 받을 props의 타입을 정의하는 인터페이스입니다.
interface ForecastWeatherComponentProps {
  chartData: ForecastItemProps[]; // 시간대별로 정리된 예보 데이터 배열
  forecastWeather: ForecastData;
  isForecastWeatherIsLoading: boolean;
  isForecastWeatherIsError: boolean;
  forecastAirPollution: AirPollutionForecastData;
  isForecastAirPollutionIsLoading: boolean;
  isForecastAirPollutionIsError: boolean;
}

// 시간대별 날씨 및 미세먼지 예보를 가로로 스크롤 가능한 목록으로 보여주는 UI 컴포넌트입니다.
export default function ForecastWeatherComponent(
  {
    chartData, forecastWeather, isForecastWeatherIsLoading, isForecastWeatherIsError,
    forecastAirPollution, isForecastAirPollutionIsLoading, isForecastAirPollutionIsError
  }: ForecastWeatherComponentProps) {

  // 데이터 로딩 중이거나 에러가 발생한 경우를 먼저 처리하여 UI를 렌더링하지 않도록 합니다.
  if (isForecastWeatherIsLoading || isForecastAirPollutionIsLoading) return <div>날씨 예보를 불러오는 중...</div>;
  if (isForecastWeatherIsError || isForecastAirPollutionIsError || !forecastWeather || !forecastAirPollution) return <div>날씨 예보를 불러오지 못했습니다.</div>;

  // 표시할 데이터가 없는 경우에 대한 처리입니다.
  if (chartData.length === 0) {
    return <div>표시할 예보 데이터가 없습니다.</div>;
  }

  return (
    // 전체 컴포넌트를 감싸는 카드 형태의 컨테이너
    <div className="w-4/7 p-8 bg-blue-500 rounded-xl shadow-lg">
      {/* 내용이 넘칠 경우 가로 스크롤을 가능하게 하는 컨테이너입니다. */}
      <div className="overflow-x-auto forecast-custom-scrollbar">
        {/*
          가로 스크롤을 구현하기 위한 트릭:
          내부 컨테이너의 너비를 '아이템 개수 * 아이템 너비(96px)'로 설정하여
          모든 아이템이 한 줄에 들어갈 수 있는 충분한 공간을 확보합니다.
        */}
        <div style={{width: chartData.length * 96}}>
          {/* 개별 예보 아이템들을 가로로 나열하는 flex 컨테이너입니다. */}
          <div className="flex flex-row h-56">
            {/* `chartData` 배열을 순회하며 각 시간대의 예보를 `ForecastItemComponent`로 렌더링합니다. */}
            {chartData.map((item, index) => (
              // 자식 컴포넌트에 필요한 모든 props를 spread operator(...)를 사용해 한 번에 전달합니다.
              <ForecastItemComponent key={index} {...item} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
