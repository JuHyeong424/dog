import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

export interface PlaceDetails {
  name: string;
  vicinity: string;
  formatted_phone_number?: string;
  photos?: { photo_reference: string }[];
  rating?: number;
  reviews?: any[];
  opening_hours?: { weekday_text: string[] };
  geometry?: {
    location: {
      lat: number;
      lng: number;
    };
  };
}

export function usePlaceDetails(placeId: string | null) {
  return useQuery<PlaceDetails>({
    queryKey: ['placeDetails', placeId],
    queryFn: async () => {
      if (!placeId) return null;
      const response = await axios.get(`/api/places/${placeId}`);
      return response.data.result || response.data;
    },
    enabled: !!placeId,
  });
}
