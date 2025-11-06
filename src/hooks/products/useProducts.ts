import { useInfiniteQuery } from '@tanstack/react-query';
import { Product } from "@/types/products";

// API 응답 데이터의 구조를 정의하는 인터페이스입니다.
interface ProductsApiResponse {
  products: Product[]; // 상품 목록 배열
  nextStart?: number;  // 다음 페이지를 불러올 때 사용할 시작 인덱스
}

/**
 * 특정 페이지(start 인덱스)의 상품 데이터를 가져오는 비동기 함수입니다.
 * @param {string} query - 검색어
 *- @param {number} pageParam - 불러올 페이지의 시작 인덱스 (기본값 1)
 * @returns {Promise<ProductsApiResponse>} 상품 목록과 다음 페이지 시작 인덱스를 포함하는 객체
 */
const fetchProducts = async (query: string, pageParam: number = 1): Promise<ProductsApiResponse> => {
  // 검색어가 없으면 빈 결과를 반환합니다.
  if (!query) {
    return { products: [], nextStart: undefined };
  }
  // 우리 서버의 Next.js API 라우트(/api/products)로 GET 요청을 보냅니다.
  // 검색어(query)와 시작 인덱스(start)를 쿼리 파라미터로 전달합니다.
  const response = await fetch(`/api/products?query=${query}&start=${pageParam}`);

  if (!response.ok) {
    throw new Error('네트워크 응답이 올바르지 않습니다.');
  }

  return response.json();
};

/**
 * 검색어를 기반으로 상품 목록을 무한 스크롤로 가져오는 React Query 커스텀 훅입니다.
 * @param {string} query - 검색어
 * @returns React Query의 무한 쿼리 객체 ({ data, fetchNextPage, hasNextPage, ... })
 */
export function useProducts(query: string) {
  // useInfiniteQuery 훅을 사용하여 무한 스크롤 관련 로직을 처리합니다.
  return useInfiniteQuery({
    // 쿼리 키: 이 쿼리를 고유하게 식별합니다. 검색어(query)가 변경되면 쿼리가 다시 시작됩니다.
    queryKey: ['products', query],

    // 데이터 fetching 함수: pageParam(여기서는 'start' 값)을 인자로 받아 fetchProducts 함수를 호출합니다.
    queryFn: ({ pageParam }) => fetchProducts(query, pageParam),

    // 초기 페이지 파라미터: 첫 번째 페이지를 불러올 때 사용할 start 값으로 1을 설정합니다.
    initialPageParam: 1,

    // 다음 페이지 파라미터를 가져오는 함수:
    // 이 함수는 마지막으로 성공적으로 불러온 페이지(lastPage) 데이터를 인자로 받습니다.
    // API 응답에 포함된 nextStart 값을 반환하여 다음 페이지를 불러올 때 사용할 파라미터로 지정합니다.
    // nextStart가 없으면(undefined) 더 이상 다음 페이지가 없음을 의미(hasNextPage = false)합니다.
    getNextPageParam: (lastPage) => lastPage.nextStart,

    // enabled 옵션: 검색어(query)가 존재할 때(truthy)만 이 쿼리를 활성화합니다.
    enabled: !!query,
  });
}
