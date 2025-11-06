import {useQuery} from "@tanstack/react-query";
import axios from "axios";

interface useOpenWeatherProps {
  lon: number | undefined;
  lat: number | undefined;
}

export function useOpenWeather({ lon, lat }: useOpenWeatherProps) {
  return useQuery({
    queryKey: ["openWeather", lat, lon],
    queryFn: async () => {
      const res = await axios.get(`/api/openWeather?lat=${lat}&lon=${lon}`);
      return res.data;
    },
    enabled: !!lat && !!lon,
    staleTime: 1000 * 60 * 5,
  });
}
