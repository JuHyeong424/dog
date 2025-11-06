// 각 상태 텍스트("좋음", "보통", "주의")를 최종 점수 계산에 사용할 숫자 값으로 매핑하는 객체입니다.
// `as const`를 사용하여 이 객체가 읽기 전용(readonly)임을 명시하고, 타입 추론을 더 정확하게 합니다.
const scoreMap = {
  "매우 좋음": 100, // "매우 좋음" 추가
  "좋음": 75,       // 점수 조정
  "보통": 50,
  "주의": 0,
} as const;

// `scoreMap`의 키들("좋음", "보통", "주의")을 타입으로 정의합니다.
type ScoreStatus = keyof typeof scoreMap;

// 이 함수가 인자로 받을 객체의 타입을 정의하는 인터페이스입니다.
interface totalWalkingScoreProps {
  tempScore: ScoreStatus;
  humidityScore: ScoreStatus;
  windScore: ScoreStatus;
  pm10Score: ScoreStatus;
  pm25Score: ScoreStatus;
  time?: string; // 시간 정보는 선택적으로 받습니다.
}

// 각 날씨/환경 요소가 최종 점수에 미치는 영향(가중치)을 정의하는 객체입니다.
// 모든 가중치의 합은 1이 되어야 합니다.
const weights = {
  temperature: 0.30,
  humidity: 0.20,
  wind: 0.10,
  pm10: 0.20,
  pm25: 0.20,
};

/**
 * 각 날씨/환경 요소의 상태("좋음", "보통", "주의")를 입력받아,
 * 가중치를 적용하여 최종 '산책 적합도' 점수와 코멘트를 계산하는 함수입니다.
 * @param {totalWalkingScoreProps} props - 각 요소의 상태와 선택적인 시간 정보
 * @returns {{score: number, comment: string, time?: string}} 최종 점수, 코멘트, (있을 경우) 시간 정보
 */
export default function totalWalkingScore({ time, tempScore, humidityScore, windScore, pm10Score, pm25Score }: totalWalkingScoreProps) {
  // 각 요소의 상태 텍스트를 `scoreMap`을 이용해 숫자 점수로 변환하고, 해당 요소의 가중치를 곱합니다.
  const tempEvaluation = scoreMap[tempScore] * weights.temperature;
  const humidityEvaluation = scoreMap[humidityScore] * weights.humidity;
  const windEvaluation = scoreMap[windScore] * weights.wind;
  const pm10Evaluation = scoreMap[pm10Score] * weights.pm10;
  const pm25Evaluation = scoreMap[pm25Score] * weights.pm25;

  // 모든 요소의 가중 점수를 합산하고, 소수점을 반올림하여 최종 점수를 계산합니다.
  const total = Math.round(
    tempEvaluation + humidityEvaluation + windEvaluation + pm10Evaluation + pm25Evaluation
  );

  // 최종 점수(total)에 따라 사용자에게 보여줄 코멘트를 결정합니다.
  let comment = '';
  if (total >= 80) {
    comment = "산책하기 아주 좋은 날씨예요! 🐾";
  } else if (total >= 50) {
    comment = "산책하기 괜찮은 날씨예요.";
  } else {
    comment = "산책은 잠시 미루는 게 좋겠어요.";
  }

  // time 인자가 제공되었는지 여부에 따라 반환하는 객체의 구조를 다르게 합니다.
  return time
    ? { time, score: total, comment } // time이 있으면 포함하여 반환
    : { score: total, comment };      // time이 없으면 점수와 코멘트만 반환
};
