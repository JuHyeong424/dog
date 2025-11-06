"use client";

import { useEffect, useState } from 'react';
import Image from "next/image";
import { useProducts } from "@/hooks/products/useProducts";
import { Product } from '@/types/products';
import { FaSearch } from 'react-icons/fa';
import { useInView } from "react-intersection-observer";

const filterOptions = {
  food: '음식',
  toy: '장난감',
  hygiene: '위생/미용',
  apparel: '의류/악세사리',
  walking: '산책용품',
  home: '집/안전용품',
};

export default function ProductsPage() {
  const [inputValue, setInputValue] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const {
    data,
    error,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetching, // 'isLoading' 대신 'isFetching'을 사용합니다.
    isFetchingNextPage
  } = useProducts(searchTerm);

  const { ref, inView } = useInView();

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage, isFetchingNextPage]);

  const handleFilterClick = (categoryLabel: string) => {
    if (searchTerm === categoryLabel) {
      setSearchTerm('');
      setInputValue('');
    } else {
      setInputValue(categoryLabel);
      setSearchTerm(categoryLabel);
    }
  };

  const handleManualSearch = () => {
    if (!inputValue.trim()) {
      alert("검색어를 입력해주세요.");
      return;
    }
    setSearchTerm(inputValue);
  };

  const allProducts = data?.pages.flatMap(page => page.products) ?? [];

  return (
    <div className="p-8 md:p-20">
      <h1 className="text-3xl font-bold mb-4 text-center">반려견 상품 검색</h1>

      {/* 검색 바 */}
      <div className="flex justify-center mb-8">
        <input
          type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleManualSearch()}
          className="w-full max-w-md border p-3 rounded-l-lg focus:ring-2 focus:ring-blue-500"
          placeholder="예: 사료, 장난감, 배변패드"
        />
        <button onClick={handleManualSearch} className="bg-blue-500 text-white px-5 rounded-r-lg hover:bg-blue-600 flex items-center justify-center">
          <FaSearch />
        </button>
      </div>

      {/* 카테고리 필터 */}
      <div className="flex justify-center flex-wrap gap-3 mb-10">
        {Object.entries(filterOptions).map(([key, label]) => (
          <button
            key={key}
            onClick={() => handleFilterClick(label)}
            className={`px-4 py-2 text-sm rounded-full font-semibold transition-all duration-200 ${
              searchTerm === label ? 'bg-blue-600 text-white shadow-md scale-105' : 'bg-white text-gray-800 hover:bg-gray-100 border border-gray-300'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {/* --- [핵심 수정 1] --- */}
        {/* 'isLoading'을 'isFetching'으로 변경합니다. */}
        {isFetching && !isFetchingNextPage ? (
          <div className="text-center py-10">상품을 찾고 있습니다...</div>
        ) : isError ? (
          <div className="text-center py-10 text-red-500">오류가 발생했습니다: {error?.message}</div>
        ) : !searchTerm ? (
          <div className="text-center py-20 bg-gray-50 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-700">찾고 싶은 반려견 상품을 검색해 보세요!</h2>
            <p className="text-gray-500 mt-2">원하는 카테고리 버튼을 눌러 바로 검색할 수도 있습니다.</p>
          </div>
        ) : (
          <>
            <h2 className="text-xl font-bold mb-4">"{searchTerm}" 검색 결과 ({allProducts.length}개)</h2>
            {allProducts.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {/* --- [핵심 수정 2] --- */}
                  {/* 주석 처리된 부분을 실제 상품 카드 렌더링 코드로 복원합니다. */}
                  {allProducts.map((product: Product, index: number) => (
                    <div key={`${product.productId}-${index}`} className="border rounded-lg overflow-hidden shadow-lg transition-transform hover:scale-105 bg-white">
                      <a href={product.link} target="_blank" rel="noopener noreferrer">
                        <div className="relative w-full h-48">
                          <Image
                            src={product.image} alt={product.title.replace(/<[^>]*>?/gm, '')} fill
                            className="object-cover"
                            sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw, 100vw"
                            priority={index < 4}
                          />
                        </div>
                        <div className="p-4">
                          <p className="text-xs text-gray-500 mb-1">{product.mallName}</p>
                          <h2 className="text-base font-semibold h-12 overflow-hidden text-ellipsis" dangerouslySetInnerHTML={{ __html: product.title }} />
                          <p className="text-lg font-bold mt-2 text-red-500">{Number(product.lprice).toLocaleString()}원</p>
                        </div>
                      </a>
                    </div>
                  ))}
                  {/* --- [수정 끝] --- */}
                </div>

                <div ref={ref} className="h-10 mt-8 text-center">
                  {isFetchingNextPage && '더 많은 상품을 불러오는 중...'}
                  {!hasNextPage && allProducts.length > 0 && searchTerm && '더 이상 상품이 없습니다.'}
                </div>
              </>
            ) : (
              <div className="text-center py-20 bg-gray-50 rounded-lg">
                <h2 className="text-xl font-semibold text-gray-700">"{searchTerm}"에 대한 검색 결과가 없습니다.</h2>
                <p className="text-gray-500 mt-2">다른 검색어나 카테고리로 다시 시도해 보세요.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
