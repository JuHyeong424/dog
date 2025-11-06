"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useInView } from "react-intersection-observer";
import Image from "next/image";

import { useProducts } from "@/hooks/products/useProducts";
import { useYouTubeSearch, Video } from '@/hooks/search/useYouTubeSearch';
import { useWebSearch, Blog } from '@/hooks/search/useWebSearch';
import { Product } from '@/types/products';

import { FaYoutube, FaGlobe, FaShoppingBag } from 'react-icons/fa';
import VideoResultCard from '@/components/search/VideoResultCard';
import BlogResultCard from '@/components/search/BlogResultCard';
import SaveButton from '@/components/common/SaveButton';

// 탭 종류를 정의합니다.
type ActiveTab = 'products' | 'youtube' | 'web';

// 미리 정의된 추천 검색어 필터 목록입니다.
const filterOptions = {
  food: '사료',
  toy: '강아지 장난감',
  hygiene: '강아지 샴푸',
  apparel: '강아지 옷',
  health: '슬개골 탈구',
  behavior: '짖음 훈련',
  walking: '산책 팁',
};

// 검색 결과 목록을 렌더링하는 메인 컴포넌트
function SearchResultList() {
  // --- 훅 초기화 ---
  // URL의 쿼리 파라미터를 읽기 위한 훅
  const searchParams = useSearchParams();
  // 페이지 이동을 위한 훅
  const router = useRouter();
  // URL에서 'q' 파라미터(검색어)를 가져옵니다.
  const searchTerm = searchParams.get('q') || '';

  // --- 상태 관리 ---
  // 현재 활성화된 탭 (상품, 유튜브, 웹)을 관리합니다.
  const [activeTab, setActiveTab] = useState<ActiveTab>('products');
  // 무한 스크롤을 위해 특정 요소가 화면에 보이는지 감지하는 훅
  const { ref, inView } = useInView();

  // --- 데이터 Fetching (react-query 커스텀 훅 사용) ---
  // 상품 검색 결과를 가져옵니다.
  const {
    data: productsData,
    fetchNextPage: fetchNextProducts,
    hasNextPage: hasNextProductsPage,
    isFetching: isFetchingProducts,
    isFetchingNextPage: isFetchingNextProductsPage,
  } = useProducts(searchTerm);

  // 유튜브 검색 결과를 가져옵니다.
  const {
    data: youtubeData,
    fetchNextPage: fetchNextYouTube,
    hasNextPage: hasNextYouTubePage,
    isFetching: isFetchingYouTube,
    isFetchingNextPage: isFetchingNextYouTubePage,
  } = useYouTubeSearch(searchTerm);

  // 웹(블로그) 검색 결과를 가져옵니다.
  const {
    data: webData,
    fetchNextPage: fetchNextWeb,
    hasNextPage: hasNextWebPage,
    isFetching: isFetchingWeb,
    isFetchingNextPage: isFetchingNextWebPage,
  } = useWebSearch(searchTerm);

  // --- 유틸리티 함수 ---
  // HTML 문자열에서 태그를 제거하는 함수
  const stripHtml = (html: string) => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || "";
  }

  // --- 데이터 가공 ---
  // 여러 페이지로 나뉘어 있는 데이터를 하나의 배열로 합칩니다.
  const allProducts = productsData?.pages.flatMap(page => page.products) ?? [];
  const allVideos = youtubeData?.pages.flatMap(page => page.videos) ?? [];
  const allBlogs = webData?.pages.flatMap(page => page.blogs) ?? [];

  // --- 상태 변수 ---
  // 초기 데이터 로딩 중인지 여부 (다음 페이지 로딩은 제외)
  const isFetching = (isFetchingProducts && !isFetchingNextProductsPage) ||
    (isFetchingYouTube && !isFetchingNextYouTubePage) ||
    (isFetchingWeb && !isFetchingNextWebPage);
  // 검색 결과가 하나라도 있는지 여부
  const hasResults = allProducts.length > 0 || allVideos.length > 0 || allBlogs.length > 0;

  // --- useEffect 훅 ---
  // 무한 스크롤 로직: ref 요소가 화면에 보이면 다음 페이지를 불러옵니다.
  useEffect(() => {
    if (inView) {
      if (activeTab === 'products' && hasNextProductsPage && !isFetchingNextProductsPage) {
        fetchNextProducts();
      } else if (activeTab === 'youtube' && hasNextYouTubePage && !isFetchingNextYouTubePage) {
        fetchNextYouTube();
      } else if (activeTab === 'web' && hasNextWebPage && !isFetchingNextWebPage) {
        fetchNextWeb();
      }
    }
  }, [inView, activeTab, fetchNextProducts, fetchNextYouTube, fetchNextWeb, hasNextProductsPage, hasNextYouTubePage, hasNextWebPage, isFetchingNextProductsPage, isFetchingNextYouTubePage, isFetchingNextWebPage]);

  // 검색어가 있을 때, 현재 활성화된 탭에 결과가 없으면 결과가 있는 다른 탭으로 자동 전환합니다.
  useEffect(() => {
    if (!searchTerm) return;
    if (activeTab === 'products' && allProducts.length === 0) {
      if (allVideos.length > 0) setActiveTab('youtube');
      else if (allBlogs.length > 0) setActiveTab('web');
    }
  }, [searchTerm, activeTab, allProducts.length, allVideos.length, allBlogs.length]);

  // --- 이벤트 핸들러 ---
  // 추천 필터 버튼 클릭 시 해당 검색어로 URL을 변경합니다.
  const handleFilterClick = (categoryLabel: string) => {
    // 이미 선택된 필터를 다시 클릭하면 검색어를 초기화합니다.
    if (searchTerm === categoryLabel) {
      router.push('/search');
    } else {
      router.push(`/search?q=${categoryLabel}`);
    }
  };


  // --- 렌더링 ---
  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* 추천 검색어 필터 버튼 목록 */}
      <div className="flex justify-center flex-wrap gap-3 mb-12">
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

      <section>
        {/* 초기 로딩 중일 때 */}
        {isFetching ? (
          <div className="text-center">검색 결과를 불러오는 중...</div>
          // 검색어가 없을 때
        ) : !searchTerm ? (
          <div className="text-center text-gray-500 py-20">
            <h2 className="text-2xl font-semibold">궁금한 내용을 검색하거나 추천 카테고리를 선택해 보세요.</h2>
            <p>예: 슬개골 탈구, 강아지 사료, 짖음 훈련</p>
          </div>
          // 검색 결과가 있을 때
        ) : hasResults ? (
          <>
            <h2 className="text-2xl font-bold mb-6 text-center">"{searchTerm}" 검색 결과</h2>

            {/* 결과 종류를 선택하는 탭 메뉴 */}
            <div className="flex justify-center border-b border-gray-200 mb-8">
              <button
                onClick={() => setActiveTab('products')}
                disabled={allProducts.length === 0}
                className={`flex items-center gap-2 px-4 py-3 text-lg font-semibold transition-colors duration-200 ${activeTab === 'products' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500 hover:text-blue-500'} disabled:text-gray-300 disabled:cursor-not-allowed`}
              >
                <FaShoppingBag />
                <span>상품</span>
                <span className="text-sm bg-gray-200 text-gray-700 rounded-full px-2 py-0.5">{allProducts.length}</span>
              </button>
              <button
                onClick={() => setActiveTab('youtube')}
                disabled={allVideos.length === 0}
                className={`flex items-center gap-2 px-4 py-3 text-lg font-semibold transition-colors duration-200 ${activeTab === 'youtube' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500 hover:text-blue-500'} disabled:text-gray-300 disabled:cursor-not-allowed`}
              >
                <FaYoutube />
                <span>YouTube</span>
                <span className="text-sm bg-gray-200 text-gray-700 rounded-full px-2 py-0.5">{allVideos.length}</span>
              </button>
              <button
                onClick={() => setActiveTab('web')}
                disabled={allBlogs.length === 0}
                className={`flex items-center gap-2 px-4 py-3 text-lg font-semibold transition-colors duration-200 ${activeTab === 'web' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500 hover:text-blue-500'} disabled:text-gray-300 disabled:cursor-not-allowed`}
              >
                <FaGlobe />
                <span>웹 검색</span>
                <span className="text-sm bg-gray-200 text-gray-700 rounded-full px-2 py-0.5">{allBlogs.length}</span>
              </button>
            </div>

            {/* 활성화된 탭에 따른 검색 결과 렌더링 */}
            <div>
              {activeTab === 'products' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {allProducts.map((product: Product, index: number) => (
                    // 상품 카드
                    <div key={`${product.productId}-${index}`} className="relative border rounded-lg overflow-hidden shadow-lg transition-transform hover:scale-105 bg-white">
                      {/* 저장하기 버튼 */}
                      <SaveButton
                        contentType="product"
                        contentId={product.productId}
                        contentData={{
                          name: stripHtml(product.title),
                          image: product.image,
                          link: product.link,
                          price: product.lprice,
                          mallName: product.mallName
                        }}
                      />
                      {/* 상품 링크 */}
                      <a href={product.link} target="_blank" rel="noopener noreferrer">
                        <div className="relative w-full h-48">
                          <Image src={product.image} alt={stripHtml(product.title)} fill className="object-cover" sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw, 100vw" priority={index < 4} />
                        </div>
                        <div className="p-4">
                          <p className="text-xs text-gray-500 mb-1">{product.mallName}</p>
                          {/* HTML 태그가 포함된 제목을 렌더링 */}
                          <h2 className="text-base font-semibold h-12 overflow-hidden text-ellipsis" dangerouslySetInnerHTML={{ __html: product.title }} />
                          <p className="text-lg font-bold mt-2 text-red-500">{Number(product.lprice).toLocaleString()}원</p>
                        </div>
                      </a>
                    </div>
                  ))}
                </div>
              )}
              {activeTab === 'youtube' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {allVideos.map((video: Video, index: number) => (
                    <VideoResultCard key={`${video.id}-${index}`} video={video} />
                  ))}
                </div>
              )}
              {activeTab === 'web' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {allBlogs.map((blog: Blog, index: number) => (
                    <BlogResultCard key={`${blog.link}-${index}`} blog={blog} />
                  ))}
                </div>
              )}
            </div>

            {/* 무한 스크롤을 위한 감지 요소 및 로딩 인디케이터 */}
            <div ref={ref} className="text-center py-8">
              {activeTab === 'products' && isFetchingNextProductsPage && '더 많은 상품을 불러오는 중...'}
              {activeTab === 'youtube' && isFetchingNextYouTubePage && '더 많은 YouTube 결과를 불러오는 중...'}
              {activeTab === 'web' && isFetchingNextWebPage && '더 많은 웹 검색 결과를 불러오는 중...'}
            </div>
          </>
          // 검색 결과가 없을 때
        ) : (
          <div className="text-center py-20">"{searchTerm}"에 대한 검색 결과가 없습니다.</div>
        )}
      </section>
    </div>
  );
}

// SearchPage 컴포넌트는 Suspense를 사용하여 SearchResultList를 래핑합니다.
// Suspense는 데이터 로딩 중에 fallback UI를 보여주는 역할을 합니다.
export default function SearchPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SearchResultList />
    </Suspense>
  )
}
