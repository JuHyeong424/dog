import {NextResponse} from "next/server";
import axios from "axios";

// GET 요청을 처리하는 비동기 API 라우트 핸들러입니다.
export async function GET(request: Request) {
  // 요청 URL에서 쿼리 파라미터(lat, lon)를 추출합니다.
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");

  // 위도 또는 경도 값이 없으면 400 에러를 반환합니다.
  if (!lat || !lon) {
    return NextResponse.json({ error: "lat or lon error"}, { status: 400 });
  }

  try {
    // 환경 변수에서 OpenWeatherMap API 키를 가져옵니다.
    const apiKey = process.env.OPEN_WEATHER_API_KEY;
    // OpenWeatherMap의 현재 날씨 API에 GET 요청을 보냅니다.
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}`
    );

    // API로부터 받은 현재 날씨 데이터를 그대로 클라이언트에 JSON 형태로 반환합니다.
    return NextResponse.json(response.data);
  } catch (error) {
    // 에러가 발생한 경우, 서버 콘솔에 에러 메시지를 기록합니다.
    if (error instanceof Error) {
      console.error("Open Weather API fetch error:", error.message);
    } else {
      console.error("Open Weather API fetch error:", error);
    }

    // 클라이언트에게는 500 서버 에러와 함께 실패 메시지를 반환합니다.
    return NextResponse.json(
      { error: "Failed to fetch open weather" },
      { status: 500 }
    );
  }
}
