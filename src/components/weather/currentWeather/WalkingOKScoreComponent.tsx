// WalkingOKScoreComponent가 부모로부터 받을 props의 타입을 정의하는 인터페이스입니다.
interface WalkingOKScoreProps {
  label: string;  // 표시할 항목의 이름 (예: "온도", "습도")
  status: string; // 항목의 상태 텍스트 (예: "좋음", "주의")
}

// 개별 날씨/환경 요소(온도, 습도 등)의 상태를 텍스트로 표시하는 간단한 UI 컴포넌트입니다.
export default function WalkingOKScoreComponent({ label, status }: WalkingOKScoreProps) {
  // status 텍스트 값에 따라 적절한 Tailwind CSS 텍스트 색상 클래스를 반환하는 함수입니다.
  const getScoreFontColor = (status: string) => {
    if (status === "매우 좋음") return "text-green-500";
    if (status === "좋음") return "text-blue-500";
    if (status === "보통") return "text-yellow-500";
    return "text-red-500"; // "주의" 또는 그 외의 경우
  };

  return (
    // 라벨과 상태 텍스트를 양쪽 끝에 배치하는 flex 컨테이너입니다.
    <div className="flex justify-between py-1">
      {/* 왼쪽에는 회색으로 라벨 텍스트를 표시합니다. */}
      <span className="text-gray-400">{label}</span>
      {/* 오른쪽에는 상태에 따라 동적으로 색상이 변경되는 상태 텍스트를 굵게 표시합니다. */}
      <span className={`font-bold ${getScoreFontColor(status)}`}>{status}</span>
    </div>
  )
}
