import { NextResponse, NextRequest } from 'next/server';
import axios from 'axios';

export async function GET(request: NextRequest) {
  const url = new URL(request.url);

  const pathnameParts = url.pathname.split('/');
  const place_id = pathnameParts[pathnameParts.length - 1];

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  if (!place_id || typeof place_id !== 'string') {
    return NextResponse.json({ error: 'Valid Place ID is required' }, { status: 400 });
  }

  try {
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/place/details/json`, {
        params: {
          place_id: place_id,
          language: 'ko',
          // --- 바로 이 부분에 'geometry'를 추가합니다! ---
          fields: 'name,vicinity,formatted_phone_number,photos,rating,reviews,opening_hours,geometry',
          // ------------------------------------------------
          key: apiKey,
        },
      }
    );

    if (response.data.status !== 'OK') {
      throw new Error(`Google Place Details API Error: ${response.data.status} - ${response.data.error_message || 'No error message'}`);
    }

    return NextResponse.json(response.data.result);
  } catch (error) {
    console.error(`Failed to fetch place details for ${place_id}:`, error);
    return NextResponse.json({ error: 'Failed to fetch place details' }, { status: 500 });
  }
}
