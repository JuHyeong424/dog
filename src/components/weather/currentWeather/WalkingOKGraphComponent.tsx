import {buildStyles, CircularProgressbar} from "react-circular-progressbar";

// WalkingOKGraphComponent가 부모로부터 받을 props의 타입을 정의하는 인터페이스입니다.
interface WalkingOKGraphProps {
  totalScore: number; // 표시할 최종 산책 적합도 점수
}

// 최종 산책 적합도 점수를 원형 그래프와 텍스트로 시각화하는 컴포넌트입니다.
export default function WalkingOKGraphComponent({ totalScore }: WalkingOKGraphProps) {
  // 점수에 따라 "매우 좋음", "좋음", "보통", "주의"와 같은 텍스트 코멘트를 반환하는 함수입니다.
  const totalScoreComment = (totalScore: number) => {
    if (totalScore >= 80) return "매우 좋음";
    if (totalScore >= 60) return "좋음";
    if (totalScore >= 40) return "보통";
    return "주의";
  }

  // 점수에 따라 텍스트 코멘트의 색상을 결정하는 Tailwind CSS 클래스를 반환하는 함수입니다.
  const getScoreClass = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-blue-500";
    if (score >= 40) return "text-yellow-500";
    return "text-red-500";
  };

  return (
    // 전체 그래프와 텍스트를 감싸는 컨테이너
    <div>
      {/* 원형 프로그레스 바를 감싸는 상대 위치 컨테이너 */}
      <div className="relative w-48 h-48 mx-auto m-4">
        {/* 원형 프로그레스 바 컴포넌트 */}
        <CircularProgressbar
          value={totalScore} // 현재 점수를 값으로 전달
          styles={buildStyles({ // 프로그레스 바의 스타일을 정의
            pathColor: '#4ade80',    // 채워지는 부분의 색상 (녹색)
            trailColor: '#d1d5db',  // 비어있는 부분(배경)의 색상 (회색)
          })}
        />
        {/* 프로그레스 바 중앙에 점수를 표시하기 위한 절대 위치 컨테이너 */}
        <div
          className="absolute top-1/2 left-1/2"
          style={{transform: 'translate(-50%, -50%)'}} // 정확한 중앙 정렬을 위한 transform
        >
          <span className="text-5xl font-bold text-black">{totalScore}</span>
        </div>
      </div>
      {/* 그래프 하단에 텍스트 코멘트를 표시하는 부분 */}
      <div className="flex items-center justify-center">
        <p className={`text-xl font-bold ${getScoreClass(totalScore)}`}>
          {totalScoreComment(totalScore)}
        </p>
      </div>
    </div>
  )
}
