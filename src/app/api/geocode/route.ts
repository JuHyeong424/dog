import { NextResponse } from 'next/server';
import axios from 'axios';

// GET 요청을 처리하는 비동기 API 라우트 핸들러입니다.
export async function GET(request: Request) {
  // 요청 URL에서 위도(lat), 경도(lon), 검색어(query)를 추출합니다.
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');
  const query = searchParams.get('query');

  // 필수 파라미터가 없으면 400 에러를 반환합니다.
  if (!lat || !lon || !query) {
    return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
  }

  // 환경 변수에서 Google Maps API 키를 가져옵니다.
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  try {
    // 1. Google Places API로 주변 장소를 검색합니다.
    const placesResponse = await axios.get(
      `https://maps.googleapis.com/maps/api/place/nearbysearch/json`, {
        params: {
          location: `${lat},${lon}`, // 검색 중심 좌표
          radius: 5000, // 5km 반경
          keyword: query, // 검색어
          language: 'ko', // 응답 언어
          key: apiKey,
        },
      }
    );

    // 검색 결과가 없는 경우 빈 배열을 반환합니다.
    if (placesResponse.data.status === 'ZERO_RESULTS') {
      return NextResponse.json([]);
    }
    // API 요청이 실패한 경우 에러를 발생시킵니다.
    if (placesResponse.data.status !== 'OK') {
      throw new Error(`Google Places API Error: ${placesResponse.data.status} - ${placesResponse.data.error_message || ''}`);
    }

    const places = placesResponse.data.results;
    // 결과 배열이 비어있으면 빈 배열을 반환합니다.
    if (places.length === 0) {
      return NextResponse.json([]);
    }

    // 2. Distance Matrix API로 각 장소까지의 거리와 시간을 계산합니다.
    // 검색된 장소들의 좌표를 '|'로 연결하여 목적지 문자열을 만듭니다.
    const destinations = places.map((p: any) => `${p.geometry.location.lat},${p.geometry.location.lng}`).join('|');
    const distanceResponse = await axios.get(
      `https://maps.googleapis.com/maps/api/distancematrix/json`, {
        params: {
          origins: `${lat},${lon}`, // 출발지 (현재 위치)
          destinations: destinations, // 목적지 (검색된 장소들)
          mode: 'transit', // 이동 수단 (대중교통)
          language: 'ko',
          key: apiKey,
        },
      }
    );

    // 3. Places API 결과와 Distance Matrix API 결과를 합칩니다.
    const combinedResults = places.map((place: any, index: number) => {
      // 각 장소에 해당하는 거리 및 시간 정보를 가져옵니다.
      const distanceInfo = distanceResponse.data.rows[0]?.elements[index];
      return {
        id: place.place_id,
        name: place.name,
        vicinity: place.vicinity,
        distance: distanceInfo?.distance?.text || 'N/A', // 거리 정보
        duration: distanceInfo?.duration?.text || 'N/A', // 소요 시간 정보
        geometry: place.geometry, // 지도에 마커를 표시하기 위한 좌표 정보
      };
    });

    // 최종적으로 합쳐진 결과를 클라이언트에 반환합니다.
    return NextResponse.json(combinedResults);

  } catch (error) {
    // 에러 발생 시 서버 콘솔에 로그를 남기고 500 에러를 반환합니다.
    console.error("Error in /api/places route:", error);
    return NextResponse.json({ error: "Failed to fetch places" }, { status: 500 });
  }
}
