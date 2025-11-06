/**
 * 현재 시간을 "Asia/Seoul" 시간대에 맞춰 한국어 형식의 문자열로 반환하는 커스텀 훅입니다.
 * @returns {string} 포맷팅된 날짜 및 시간 문자열 (예: "2023년 10월 27일 금 오전 10:30:00")
 */
export default function useCurrentDate() {
  // 현재 시간을 나타내는 Date 객체를 생성합니다.
  const now = new Date();

  // JavaScript의 국제화 API(Intl.DateTimeFormat)를 사용하여 날짜와 시간의 형식을 지정합니다.
  const koreaTime = new Intl.DateTimeFormat("ko-KR", { // 로케일(언어 및 국가)을 한국으로 설정
    // 날짜 및 시간 형식에 대한 상세 옵션
    year: "numeric",    // 년도 (숫자)
    month: "long",      // 월 (긴 형식, 예: "10월")
    day: "numeric",     // 일 (숫자)
    weekday: "short",   // 요일 (짧은 형식, 예: "금")
    hour: "numeric",    // 시 (숫자)
    minute: "numeric",  // 분 (숫자)
    second: "numeric",  // 초 (숫자)
    hour12: true,       // 12시간제 사용 (오전/오후)
    timeZone: "Asia/Seoul", // 시간대를 서울로 고정
  }).format(now); // 생성된 Date 객체에 위에서 정의한 형식을 적용합니다.

  // 최종적으로 포맷팅된 시간 문자열을 반환합니다.
  return koreaTime;
}
