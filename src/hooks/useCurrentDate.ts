export default function useCurrentDate() {
  const now = new Date();
  const koreaTime = new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: true,
    timeZone: "Asia/Seoul",
  }).format(now);

  return koreaTime;
}
