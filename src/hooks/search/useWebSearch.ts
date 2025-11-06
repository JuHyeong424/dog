import { useInfiniteQuery } from '@tanstack/react-query';
import axios from 'axios';

export interface Blog {
  title: string;
  link: string;
  snippet: string;
  displayLink: string;
}

interface WebSearchResponse {
  blogs: Blog[];
  nextStartIndex?: number;
}

export function useWebSearch(query: string) {
  return useInfiniteQuery<WebSearchResponse>({
    queryKey: ['webSearch', query],
    queryFn: async ({ pageParam = 1 }) => { // pageParam 기본값을 1로 설정
      const { data } = await axios.get(`/api/websearch`, {
        params: { query, startIndex: pageParam },
      });
      return data;
    },
    getNextPageParam: (lastPage) => lastPage.nextStartIndex ?? undefined,
    initialPageParam: 1, // 시작 페이지는 1
    enabled: !!query,
  });
}
