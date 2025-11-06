import { ForecastData } from "@/types/weather/forecastData";
import React from "react";
import {AirPollutionForecastData} from "@/types/weather/airPoluttionForecastData";
import {ForecastItemProps} from "@/types/weather/chartForecastWeatherData";
import totalWalkingScore from "@/utils/weather/totalWalkingScore";
import {checkHumidity, checkPM10, checkPM25, checkTemp, checkWind} from "@/utils/weather/walkingScores";

// ForecastScoreComponent가 부모로부터 받을 props의 타입을 정의하는 인터페이스입니다.
interface ForecastScoreProps {
  chartData: ForecastItemProps[];
  forecastWeather: ForecastData;
  isForecastWeatherIsLoading: boolean;
  isForecastWeatherIsError: boolean;
  forecastAirPollution: AirPollutionForecastData;
  isForecastAirPollutionIsLoading: boolean;
  isForecastAirPollutionIsError: boolean;
}

// 시간대별 예보 데이터를 기반으로 산책하기 좋은 시간을 추천해주는 UI 컴포넌트입니다.
export default function ForecastScoreComponent(
  {
    chartData, forecastWeather, isForecastWeatherIsLoading, isForecastWeatherIsError,
    forecastAirPollution, isForecastAirPollutionIsLoading, isForecastAirPollutionIsError
  }: ForecastScoreProps) {

  // 전달받은 시간대별 예보 데이터(chartData)를 순회하며 각 시간대의 최종 '산책 적합도' 점수를 계산합니다.
  // 각 항목에 대해 온도, 습도 등의 개별 점수를 먼저 구하고, 이를 `totalWalkingScore` 함수로 종합합니다.
  const totalScores = chartData.map(item => {
    const tempScore = checkTemp(item.temp - 273.15);
    const humidityScore = checkHumidity(item.humidity);
    const windScore = checkWind(item.wind);
    const pm10Score = checkPM10(item.pm10);
    const pm25Score = checkPM25(item.pm25);

    return totalWalkingScore({ time: item.time, tempScore, humidityScore, windScore, pm10Score, pm25Score });
  });

  // 점수에 따라 "매우 좋음", "좋음" 등의 텍스트 코멘트를 반환하는 함수입니다.
  const totalScoreComment = ((item: number) => {
    if (item >= 80) return "매우 좋음";
    if (item >= 60) return "좋음";
    if (item >= 40) return "보통";
    return "주의";
  });

  // 점수에 따라 텍스트 코멘트의 색상을 결정하는 Tailwind CSS 클래스를 반환하는 함수입니다.
  const getScoreFontColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-blue-500";
    if (score >= 40) return "text-yellow-500";
    return "text-red-500";
  };

  // 점수에 따라 리스트 아이템의 배경색을 결정하는 Tailwind CSS 클래스를 반환하는 함수입니다.
  const getScoreBGColor = (score: number) => {
    if (score >= 80) return "bg-green-100";
    if (score >= 60) return "bg-blue-100";
    if (score >= 40) return "bg-yellow-100";
    return "bg-red-100";
  };

  // 컴포넌트 렌더링에 앞서, 데이터 로딩 중이거나 에러가 발생한 경우를 처리합니다.
  if (isForecastWeatherIsLoading || isForecastAirPollutionIsLoading) return <div>날씨 예보를 불러오는 중...</div>;
  if (isForecastWeatherIsError || isForecastAirPollutionIsError || !forecastWeather || !forecastAirPollution) return <div>날씨 예보를 불러오지 못했습니다.</div>;

  return (
    // 전체 컴포넌트를 감싸는 카드 형태의 컨테이너
    <div className="bg-white rounded-xl w-2/7 p-5 shadow-sm">
      <h1 className="text-2xl font-bold">산책 추천 시간</h1>
      {/* `totalScores` 배열을 순회하며 각 시간대별 추천 항목을 생성합니다. */}
      {totalScores.map((item) => (
        <div
          key={item.time} // React가 각 항목을 식별하기 위한 고유한 key
          // 점수에 따라 배경색을 동적으로 설정합니다.
          className={`flex flex-row justify-between ${getScoreBGColor(item.score)} py-3 px-4 rounded-xl my-4`}
        >
          {/* 시간 표시 */}
          <div className="text-gray-500">{item.time}</div>
          {/* 점수에 따라 색상이 적용된 텍스트 코멘트 표시 */}
          <div className={`${getScoreFontColor(item.score)} font-bold`}>{totalScoreComment(item.score)}</div>
        </div>
      ))}
    </div>
  );
}
