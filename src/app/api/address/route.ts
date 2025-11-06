import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!lat || !lon) {
    return NextResponse.json({ error: 'Latitude and longitude are required' }, { status: 400 });
  }

  const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lon}&key=${apiKey}&language=ko`;

  try {
    const response = await axios.get(url);
    const data = response.data;

    if (data.status !== 'OK' || !data.results?.[0]) {
      return NextResponse.json({ address: '주소를 찾을 수 없습니다.' });
    }

    // 가장 정확한 주소 하나를 반환합니다.
    const address = data.results[0].formatted_address;
    return NextResponse.json({ address });

  } catch (error) {
    console.error('Geocoding API error:', error);
    return NextResponse.json({ error: 'Failed to fetch address' }, { status: 500 });
  }
}
