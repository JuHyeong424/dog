import {buildStyles, CircularProgressbar} from "react-circular-progressbar";

interface WalkingOKGraphProps {
  totalScore: number;
}

export default function WalkingOKGraphComponent({ totalScore }: WalkingOKGraphProps) {
  const totalScoreComment = (totalScore: number) => {
    if (totalScore >= 80) return "매우 좋음";
    if (totalScore >= 60) return "좋음";
    if (totalScore >= 40) return "보통";
    return "주의";
  }

  const getScoreClass = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-blue-500";
    if (score >= 40) return "text-yellow-500";
    return "text-red-500";
  };

  return (
    <div>
      <div className="relative w-48 h-48 mx-auto m-4">
        <CircularProgressbar
          value={totalScore}
          styles={buildStyles({
            pathColor: '#4ade80',
            trailColor: '#d1d5db',
          })}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1 -translate-y-1"
          style={{transform: 'translate(-50%, -50%)'}}
        >
          <span className="text-5xl font-bold text-black">{totalScore}</span>
        </div>
      </div>
      <div className="flex items-center justify-center">
        <p className={`text-xl font-bold ${getScoreClass(totalScore)}`}>{totalScoreComment(totalScore)}</p>
      </div>
    </div>
  )
}
