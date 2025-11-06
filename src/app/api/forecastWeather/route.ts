import {NextResponse} from "next/server";
import axios from "axios";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");

  if (!lat || !lon) {
    return NextResponse.json({ error: "lat or lon error"}, { status: 400 });
  }

  try {
    const apiKey = process.env.OPEN_WEATHER_API_KEY;
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&lang=kr`
    );

    return NextResponse.json(response.data);
  } catch (error) {
    if (error instanceof Error) {
      console.error("Forecast Weather API fetch error:", error.message);
    } else {
      console.error("Forecast Weather API fetch error:", error);
    }

    return NextResponse.json(
      { error: "Failed to fetch forecast weather" },
      { status: 500 }
    );
  }
}
