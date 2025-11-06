import { NextResponse, NextRequest } from 'next/server';
import axios from 'axios';

// GET 요청을 처리하는 비동기 API 라우트 핸들러입니다.
export async function GET(request: NextRequest) {
  // 요청 URL 객체를 생성합니다.
  const url = new URL(request.url);

  // URL 경로(pathname)를 '/' 기준으로 나누어 맨 마지막 부분(place_id)을 추출합니다.
  // 예: /api/places/ChIJ... -> 'ChIJ...'
  const pathnameParts = url.pathname.split('/');
  const place_id = pathnameParts[pathnameParts.length - 1];

  // 환경 변수에서 Google Maps API 키를 가져옵니다.
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  // place_id가 유효하지 않으면 400 에러를 반환합니다.
  if (!place_id || typeof place_id !== 'string') {
    return NextResponse.json({ error: 'Valid Place ID is required' }, { status: 400 });
  }

  try {
    // Google Place Details API에 GET 요청을 보냅니다.
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/place/details/json`, {
        params: {
          place_id: place_id, // 장소의 고유 ID
          language: 'ko',     // 응답 언어 (한국어)
          // 요청할 데이터 필드를 명시하여 비용을 최적화합니다.
          fields: 'name,vicinity,formatted_phone_number,photos,rating,reviews,opening_hours,geometry',
          key: apiKey,
        },
      }
    );

    // API 응답 상태가 'OK'가 아니면 에러를 발생시킵니다.
    if (response.data.status !== 'OK') {
      throw new Error(`Google Place Details API Error: ${response.data.status} - ${response.data.error_message || 'No error message'}`);
    }

    // API로부터 받은 장소 상세 정보를 클라이언트에 JSON 형태로 반환합니다.
    return NextResponse.json(response.data.result);
  } catch (error) {
    // 에러 발생 시 서버 콘솔에 로그를 남기고 500 에러를 반환합니다.
    console.error(`Failed to fetch place details for ${place_id}:`, error);
    return NextResponse.json({ error: 'Failed to fetch place details' }, { status: 500 });
  }
}
