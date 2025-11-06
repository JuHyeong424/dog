interface WalkingOKScoreProps {
  label: string;
  status: string;
}

export default function WalkingOKScoreComponent({ label, status }: WalkingOKScoreProps) {
  const getScoreFontColor = (status: string) => {
    if (status === "매우 좋음") return "text-green-500";
    if (status === "좋음") return "text-blue-500";
    if (status === "보통") return "text-yellow-500";
    return "text-red-500";
  };

  return (
    <div className="flex justify-between py-1">
      <span className="text-gray-400">{label}</span>
      <span className={`font-bold ${getScoreFontColor(status)}`}>{status}</span>
    </div>
  )
}
