import { useInfiniteQuery } from '@tanstack/react-query';
import axios from 'axios';

export interface Video {
  id: string;
  title: string;
  thumbnailUrl: string;
  channelTitle: string;
}

interface YouTubeSearchResponse {
  videos: Video[];
  nextPageToken?: string;
}

export function useYouTubeSearch(query: string) {
  return useInfiniteQuery<YouTubeSearchResponse>({
    queryKey: ['youtubeSearch', query],
    queryFn: async ({ pageParam }) => {
      const { data } = await axios.get(`/api/youtube`, {
        params: { query, pageToken: pageParam },
      });
      return data;
    },
    getNextPageParam: (lastPage) => lastPage.nextPageToken ?? undefined,
    initialPageParam: undefined,
    enabled: !!query,
  });
}
