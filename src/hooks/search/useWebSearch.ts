import { useInfiniteQuery } from '@tanstack/react-query';
import axios from 'axios';

// 개별 블로그 검색 결과의 데이터 구조를 정의하는 인터페이스입니다.
export interface Blog {
  title: string;
  link: string;
  snippet: string;
  displayLink: string;
}

// 웹 검색 API 응답 데이터의 구조를 정의하는 인터페이스입니다.
interface WebSearchResponse {
  blogs: Blog[];
  nextStartIndex?: number; // 다음 페이지를 불러올 때 사용할 시작 인덱스
}

/**
 * 검색어를 기반으로 웹(블로그) 검색 결과를 무한 스크롤로 가져오는 React Query 커스텀 훅입니다.
 * @param {string} query - 검색어
 * @returns React Query의 무한 쿼리 객체 ({ data, fetchNextPage, hasNextPage, ... })
 */
export function useWebSearch(query: string) {
  // useInfiniteQuery 훅을 사용하여 무한 스크롤 관련 로직을 처리합니다.
  return useInfiniteQuery<WebSearchResponse>({
    // 쿼리 키: 이 쿼리를 고유하게 식별합니다. 검색어(query)가 변경되면 쿼리가 다시 시작됩니다.
    queryKey: ['webSearch', query],

    // 데이터 fetching 함수: pageParam(여기서는 'startIndex')을 인자로 받아 API를 호출합니다.
    queryFn: async ({ pageParam = 1 }) => {
      // 우리 서버의 Next.js API 라우트(/api/websearch)로 GET 요청을 보냅니다.
      // 검색어(query)와 시작 인덱스(startIndex)를 쿼리 파라미터로 전달합니다.
      const { data } = await axios.get(`/api/websearch`, {
        params: { query, startIndex: pageParam },
      });
      return data;
    },

    // 다음 페이지 파라미터를 가져오는 함수:
    // 마지막으로 성공적으로 불러온 페이지(lastPage)의 nextStartIndex 값을 반환합니다.
    // nextStartIndex가 없으면(nullish coalescing `??` operator), undefined를 반환하여 더 이상 다음 페이지가 없음을 알립니다.
    getNextPageParam: (lastPage) => lastPage.nextStartIndex ?? undefined,

    // 초기 페이지 파라미터: 첫 번째 페이지를 불러올 때 사용할 startIndex 값으로 1을 설정합니다.
    initialPageParam: 1,

    // enabled 옵션: 검색어(query)가 존재할 때(truthy)만 이 쿼리를 활성화합니다.
    enabled: !!query,
  });
}
