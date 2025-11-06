import {useQuery} from "@tanstack/react-query";
import axios from "axios";

interface useForecastAirPollutionProps {
  lon: number | undefined;
  lat: number | undefined;
}

export function useForecastAirPollution({ lon, lat }: useForecastAirPollutionProps) {
  return useQuery({
    queryKey: ["forecastAirPollution", lat, lon],
    queryFn: async() => {
      const res = await axios.get(`/api/forecastAirPollution?lat=${lat}&lon=${lon}`);
      return res.data;
    },
    enabled: !!lat && !! lon,
    staleTime: 1000 * 60  * 5,
  });
}
