import {useQuery} from "@tanstack/react-query";
import axios from "axios";

export function useAirPollution(props: {
  lat: number | undefined,
  lon: number | undefined
}) {
  return useQuery({
    queryKey: ["airPollution", props.lat, props.lon],
    queryFn: async() => {
      const res = await axios.get(`/api/air_pollution?lat=${props.lat}&lon=${props.lon}`);
      return res.data;
    },
    enabled: !!props.lat && !! props.lon,
    staleTime: 1000 * 60  * 5,
  });
}
