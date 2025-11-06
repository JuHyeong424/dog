import { NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');
  const query = searchParams.get('query');

  if (!lat || !lon || !query) {
    return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  try {
    // 1. Places API로 주변 장소 검색 (radius 방식 사용)
    const placesResponse = await axios.get(
      `https://maps.googleapis.com/maps/api/place/nearbysearch/json`, {
        params: {
          location: `${lat},${lon}`,
          radius: 5000, // 5km 반경
          keyword: query,
          language: 'ko',
          key: apiKey,
        },
      }
    );

    if (placesResponse.data.status === 'ZERO_RESULTS') {
      return NextResponse.json([]);
    }
    if (placesResponse.data.status !== 'OK') {
      throw new Error(`Google Places API Error: ${placesResponse.data.status} - ${placesResponse.data.error_message || ''}`);
    }

    const places = placesResponse.data.results;
    if (places.length === 0) {
      return NextResponse.json([]);
    }

    // 2. Distance Matrix API로 거리/시간 계산
    const destinations = places.map((p: any) => `${p.geometry.location.lat},${p.geometry.location.lng}`).join('|');
    const distanceResponse = await axios.get(
      `https://maps.googleapis.com/maps/api/distancematrix/json`, {
        params: {
          origins: `${lat},${lon}`,
          destinations: destinations,
          mode: 'transit',
          language: 'ko',
          key: apiKey,
        },
      }
    );

    // 3. 두 API 결과를 합칠 때, geometry를 반드시 포함시킵니다.
    const combinedResults = places.map((place: any, index: number) => {
      const distanceInfo = distanceResponse.data.rows[0]?.elements[index];
      return {
        id: place.place_id,
        name: place.name,
        vicinity: place.vicinity,
        distance: distanceInfo?.distance?.text || 'N/A',
        duration: distanceInfo?.duration?.text || 'N/A',
        // --- 바로 이 줄이 핵심입니다! ---
        geometry: place.geometry,
        // ---------------------------------
      };
    });

    return NextResponse.json(combinedResults);

  } catch (error) {
    console.error("Error in /api/places route:", error);
    return NextResponse.json({ error: "Failed to fetch places" }, { status: 500 });
  }
}
