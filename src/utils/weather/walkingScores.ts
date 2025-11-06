export const checkTemp = (t: number): "좋음" | "보통" | "주의" => {
  if (t >= 15 && t <= 25) return "좋음";
  if ((t >= 7 && t < 15) || (t > 25 && t <= 28)) return "보통";
  return "주의";
};

export const checkHumidity = (h: number): "좋음" | "보통" | "주의" => {
  if (h >= 40 && h <= 60) return "좋음";
  if ((h > 30 && h < 40) || (h > 60 && h <= 80)) return "보통";
  return "주의";
};

export const checkWind = (w: number): "좋음" | "보통" | "주의" => {
  if (w < 5) return "좋음";
  if (w >= 5 && w < 10) return "보통";
  return "주의";
};

export const checkPM10 = (v: number): "좋음" | "보통" | "주의" => {
  if (v <= 30) return "좋음";
  if (v <= 50) return "보통";
  return "주의";
};

export const checkPM25 = (v: number): "좋음" | "보통" | "주의" => {
  if (v <= 15) return "좋음";
  if (v <= 35) return "보통";
  return "주의";
};

export const scoreColorMap: Record<string, string> = {
  "좋음": "text-green-500",
  "보통": "text-yellow-500",
  "주의": "text-red-500",
};
