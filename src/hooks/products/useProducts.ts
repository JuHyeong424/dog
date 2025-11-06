import { useInfiniteQuery } from '@tanstack/react-query';
import { Product } from "@/types/products";

interface ProductsApiResponse {
  products: Product[];
  nextStart?: number;
}

const fetchProducts = async (query: string, pageParam: number = 1): Promise<ProductsApiResponse> => {
  if (!query) {
    return { products: [], nextStart: undefined };
  }
  // API 요청 시 start 파라미터를 넘겨줍니다.
  const response = await fetch(`/api/products?query=${query}&start=${pageParam}`);

  if (!response.ok) {
    throw new Error('네트워크 응답이 올바르지 않습니다.');
  }

  return response.json();
};

export function useProducts(query: string) {
  return useInfiniteQuery({
    queryKey: ['products', query],
    // queryFn은 pageParam(여기서는 'start' 값)을 인자로 받습니다.
    queryFn: ({ pageParam }) => fetchProducts(query, pageParam),
    // 첫 페이지의 start 값은 1입니다.
    initialPageParam: 1,
    // getNextPageParam은 마지막으로 불러온 페이지(lastPage)에서
    // 다음 페이지를 불러올 때 사용할 파라미터(nextStart)를 반환합니다.
    // undefined가 반환되면 더 이상 다음 페이지가 없다는 의미입니다.
    getNextPageParam: (lastPage) => lastPage.nextStart,
    // query가 있을 때만 쿼리를 활성화합니다.
    enabled: !!query,
  });
}
