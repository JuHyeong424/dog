import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

// GET 요청을 처리하는 API 라우트 핸들러입니다.
export async function GET(req: NextRequest) {
  // URL 쿼리에서 위도(lat)와 경도(lon)를 추출합니다.
  const { searchParams } = new URL(req.url);
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');
  // 환경 변수에서 구글맵 API 키를 가져옵니다.
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  // 위도, 경도 값이 없으면 에러를 반환합니다.
  if (!lat || !lon) {
    return NextResponse.json({ error: 'Latitude and longitude are required' }, { status: 400 });
  }

  // 좌표를 주소로 변환하기 위한 Google Geocoding API 요청 URL을 생성합니다.
  const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lon}&key=${apiKey}&language=ko`;

  try {
    // axios로 Google API에 GET 요청을 보냅니다.
    const response = await axios.get(url);
    const data = response.data;

    // 응답이 유효하지 않으면 '주소를 찾을 수 없음'을 반환합니다.
    if (data.status !== 'OK' || !data.results?.[0]) {
      return NextResponse.json({ address: '주소를 찾을 수 없습니다.' });
    }

    // 결과에서 가장 정확한 주소 하나를 추출합니다.
    const address = data.results[0].formatted_address;
    // 추출한 주소를 JSON 형태로 반환합니다.
    return NextResponse.json({ address });

  } catch (error) {
    // API 요청 중 에러 발생 시 서버 에러를 반환합니다.
    console.error('Geocoding API error:', error);
    return NextResponse.json({ error: 'Failed to fetch address' }, { status: 500 });
  }
}
