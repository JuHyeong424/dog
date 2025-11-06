import {checkHumidity, checkPM10, checkPM25, checkTemp, checkWind } from "@/utils/weather/walkingScores";
import WalkingOKScoreComponent from "@/components/weather/currentWeather/WalkingOKScoreComponent";
import totalWalkingScore from "@/utils/weather/totalWalkingScore";
import WalkingOKGraphComponent from "@/components/weather/currentWeather/WalkingOKGraphComponent";

interface WalkingOKProps {
  temperature: number;
  humidity: number;
  wind: number;
  pm10: number;
  pm25: number;
}

export default function WalkingOKComponent({temperature, humidity, wind, pm10, pm25}: WalkingOKProps) {
  const tempScore = checkTemp(temperature - 273.15);
  const humidityScore = checkHumidity(humidity);
  const windScore = checkWind(wind);
  const pm10Score = checkPM10(pm10);
  const pm25Score = checkPM25(pm25);

  const totalScore = totalWalkingScore({ tempScore, humidityScore, windScore, pm10Score, pm25Score });

  return (
    <div className="bg-white rounded-xl w-2/7 p-5 shadow-sm">
      <h1 className="font-bold text-2xl">산책 적합도</h1>
      <WalkingOKGraphComponent totalScore={totalScore.score} />
      <div className="flex flex-col py-8">
        <WalkingOKScoreComponent label="온도" status={tempScore}/>
        <WalkingOKScoreComponent label="습도" status={humidityScore}/>
        <WalkingOKScoreComponent label="바람" status={windScore}/>
        <WalkingOKScoreComponent label="미세먼지" status={pm10Score}/>
        <WalkingOKScoreComponent label="초미세먼지" status={pm25Score}/>
      </div>
    </div>
  )
}
