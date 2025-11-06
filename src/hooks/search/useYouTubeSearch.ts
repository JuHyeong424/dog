import { useInfiniteQuery } from '@tanstack/react-query';
import axios from 'axios';

// 개별 유튜브 비디오 검색 결과의 데이터 구조를 정의하는 인터페이스입니다.
export interface Video {
  id: string;
  title: string;
  thumbnailUrl: string;
  channelTitle: string;
}

// 유튜브 검색 API 응답 데이터의 구조를 정의하는 인터페이스입니다.
interface YouTubeSearchResponse {
  videos: Video[];
  nextPageToken?: string; // 다음 페이지를 불러올 때 사용할 페이지 토큰
}

/**
 * 검색어를 기반으로 유튜브 비디오 검색 결과를 무한 스크롤로 가져오는 React Query 커스텀 훅입니다.
 * @param {string} query - 검색어
 * @returns React Query의 무한 쿼리 객체 ({ data, fetchNextPage, hasNextPage, ... })
 */
export function useYouTubeSearch(query: string) {
  // useInfiniteQuery 훅을 사용하여 무한 스크롤 관련 로직을 처리합니다.
  return useInfiniteQuery<YouTubeSearchResponse>({
    // 쿼리 키: 이 쿼리를 고유하게 식별합니다. 검색어(query)가 변경되면 쿼리가 다시 시작됩니다.
    queryKey: ['youtubeSearch', query],

    // 데이터 fetching 함수: pageParam(여기서는 'pageToken')을 인자로 받아 API를 호출합니다.
    queryFn: async ({ pageParam }) => { // pageParam은 getNextPageParam에서 반환된 nextPageToken 값입니다.
      // 우리 서버의 Next.js API 라우트(/api/youtube)로 GET 요청을 보냅니다.
      // 검색어(query)와 페이지 토큰(pageToken)을 쿼리 파라미터로 전달합니다.
      const { data } = await axios.get(`/api/youtube`, {
        params: { query, pageToken: pageParam },
      });
      return data;
    },

    // 다음 페이지 파라미터를 가져오는 함수:
    // 마지막으로 성공적으로 불러온 페이지(lastPage)의 nextPageToken 값을 반환합니다.
    // nextPageToken이 없으면(nullish coalescing `??` operator), undefined를 반환하여 더 이상 다음 페이지가 없음을 알립니다.
    getNextPageParam: (lastPage) => lastPage.nextPageToken ?? undefined,

    // 초기 페이지 파라미터:
    // YouTube API의 경우 첫 페이지 요청 시에는 pageToken이 필요 없으므로 undefined로 설정합니다.
    initialPageParam: undefined,

    // enabled 옵션: 검색어(query)가 존재할 때(truthy)만 이 쿼리를 활성화합니다.
    enabled: !!query,
  });
}
