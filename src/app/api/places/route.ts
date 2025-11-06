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
    const placesResponse = await axios.get(
      `https://maps.googleapis.com/maps/api/place/nearbysearch/json`, {
        params: {
          location: `${lat},${lon}`,
          radius: 5000,
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

    const combinedResults = places.map((place: any, index: number) => {
      const distanceInfo = distanceResponse.data.rows[0]?.elements[index];
      return {
        id: place.place_id,
        name: place.name,
        vicinity: place.vicinity,
        distance: distanceInfo?.distance?.text || 'N/A',
        duration: distanceInfo?.duration?.text || 'N/A',
        geometry: place.geometry,
      };
    });

    return NextResponse.json(combinedResults);

  } catch (error) {
    console.error("Error in /api/places route:", error);
    return NextResponse.json({ error: "Failed to fetch places" }, { status: 500 });
  }
}
