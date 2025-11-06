import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Place } from '@/types/place';

interface usePlacesProps {
  lat: number | undefined;
  lon: number | undefined;
  query: string;
  enabled?: boolean;
}

export function usePlaces({ lat, lon, query, enabled = true }: usePlacesProps) {
  return useQuery<Place[]>({
    queryKey: ["places", lat, lon, query],
    queryFn: async () => {
      const { data } = await axios.get(`/api/places`, {
        params: { lat, lon, query },
      });
      return data;
    },
    enabled: !!lat && !!lon && !!query && enabled,
  });
}
