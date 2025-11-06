import {useQuery} from "@tanstack/react-query";
import axios from "axios";

interface useForecastWeatherProps {
  lon: number | undefined;
  lat: number | undefined;
}

export default function useForecastWeather({ lon, lat }: useForecastWeatherProps) {
  return useQuery({
    queryKey: ["forecast", lat, lon],
    queryFn: async () => {
      const res = await axios.get(`/api/forecastWeather?lat=${lat}&lon=${lon}`);
      return res.data;
    },
    enabled: !!lat && !!lon,
    staleTime: 1000 * 60 * 5,
  });
}
