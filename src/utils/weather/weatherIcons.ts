export function getWeatherIcon(main: string) {
  switch (main) {
    case "Thunderstorm":
      return "⛈️"; // 뇌우
    case "Drizzle":
      return "🌦️"; // 이슬비
    case "Rain":
      return "🌧️"; // 비
    case "Snow":
      return "❄️"; // 눈
    case "Mist":
      return "🌫️"; // 옅은 안개
    case "Smoke":
      return "💨"; // 연기
    case "Haze":
      return "🌁"; // 실안개
    case "Dust":
      return "🌪️"; // 먼지
    case "Fog":
      return "🌫️"; // 짙은 안개
    case "Sand":
      return "🏜️"; // 모래
    case "Ash":
      return "🌋"; // 화산재
    case "Squall":
      return "🌬️"; // 돌풍
    case "Tornado":
      return "🌪️"; // 토네이도
    case "Clear":
      return "☀️"; // 맑음
    case "Clouds":
      return "☁️"; // 흐림
    default:
      return "🌡️"; // 알 수 없는 날씨
  }
}
