import {checkHumidity, checkPM10, checkPM25, checkTemp, checkWind } from "@/utils/weather/walkingScores";
import WalkingOKScoreComponent from "@/components/weather/currentWeather/WalkingOKScoreComponent";
import totalWalkingScore from "@/utils/weather/totalWalkingScore";
import WalkingOKGraphComponent from "@/components/weather/currentWeather/WalkingOKGraphComponent";

// WalkingOKComponent가 부모로부터 받을 props의 타입을 정의하는 인터페이스입니다.
interface WalkingOKProps {
  temperature: number; // 온도 (켈빈)
  humidity: number;    // 습도 (%)
  wind: number;        // 풍속 (m/s)
  pm10: number;        // 미세먼지 (µg/m³)
  pm25: number;        // 초미세먼지 (µg/m³)
}

// 날씨/환경 데이터를 기반으로 산책 적합도를 계산하고 시각적으로 표시하는 컴포넌트입니다.
export default function WalkingOKComponent({temperature, humidity, wind, pm10, pm25}: WalkingOKProps) {
  // 각 날씨/환경 요소를 '산책 적합도' 점수로 변환합니다.
  const tempScore = checkTemp(temperature - 273.15); // API에서 받은 켈빈 온도를 섭씨로 변환하여 점수를 계산합니다.
  const humidityScore = checkHumidity(humidity);
  const windScore = checkWind(wind);
  const pm10Score = checkPM10(pm10);
  const pm25Score = checkPM25(pm25);

  // 개별 점수들을 합산하여 최종 '산책 적합도' 점수 객체를 계산합니다.
  const totalScore = totalWalkingScore({ tempScore, humidityScore, windScore, pm10Score, pm25Score });

  return (
    // 전체 컴포넌트를 감싸는 카드 형태의 컨테이너
    <div className="bg-white rounded-xl w-2/7 p-5 shadow-sm">
      <h1 className="font-bold text-2xl">산책 적합도</h1>
      {/* 계산된 최종 점수를 그래프 형태로 시각화하는 자식 컴포넌트입니다. */}
      <WalkingOKGraphComponent totalScore={totalScore.score} />
      {/* 각 날씨/환경 요소별 점수를 개별적으로 표시하는 부분입니다. */}
      <div className="flex flex-col py-8">
        {/* WalkingOKScoreComponent를 사용하여 각 요소(온도, 습도 등)의 상태를 표시합니다. */}
        <WalkingOKScoreComponent label="온도" status={tempScore}/>
        <WalkingOKScoreComponent label="습도" status={humidityScore}/>
        <WalkingOKScoreComponent label="바람" status={windScore}/>
        <WalkingOKScoreComponent label="미세먼지" status={pm10Score}/>
        <WalkingOKScoreComponent label="초미세먼지" status={pm25Score}/>
      </div>
    </div>
  )
}
