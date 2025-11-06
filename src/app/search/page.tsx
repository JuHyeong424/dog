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

type ActiveTab = 'products' | 'youtube' | 'web';

const filterOptions = {
  food: '사료',
  toy: '강아지 장난감',
  hygiene: '강아지 샴푸',
  apparel: '강아지 옷',
  health: '슬개골 탈구',
  behavior: '짖음 훈련',
  walking: '산책 팁',
};

function SearchResultList() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const searchTerm = searchParams.get('q') || '';

  const [activeTab, setActiveTab] = useState<ActiveTab>('products');
  const { ref, inView } = useInView();

  const {
    data: productsData,
    fetchNextPage: fetchNextProducts,
    hasNextPage: hasNextProductsPage,
    isFetching: isFetchingProducts,
    isFetchingNextPage: isFetchingNextProductsPage,
  } = useProducts(searchTerm);

  const {
    data: youtubeData,
    fetchNextPage: fetchNextYouTube,
    hasNextPage: hasNextYouTubePage,
    isFetching: isFetchingYouTube,
    isFetchingNextPage: isFetchingNextYouTubePage,
  } = useYouTubeSearch(searchTerm);

  const {
    data: webData,
    fetchNextPage: fetchNextWeb,
    hasNextPage: hasNextWebPage,
    isFetching: isFetchingWeb,
    isFetchingNextPage: isFetchingNextWebPage,
  } = useWebSearch(searchTerm);

  const stripHtml = (html: string) => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || "";
  }

  const allProducts = productsData?.pages.flatMap(page => page.products) ?? [];
  const allVideos = youtubeData?.pages.flatMap(page => page.videos) ?? [];
  const allBlogs = webData?.pages.flatMap(page => page.blogs) ?? [];

  const isFetching = (isFetchingProducts && !isFetchingNextProductsPage) ||
    (isFetchingYouTube && !isFetchingNextYouTubePage) ||
    (isFetchingWeb && !isFetchingNextWebPage);
  const hasResults = allProducts.length > 0 || allVideos.length > 0 || allBlogs.length > 0;

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

  useEffect(() => {
    if (!searchTerm) return;
    if (activeTab === 'products' && allProducts.length === 0) {
      if (allVideos.length > 0) setActiveTab('youtube');
      else if (allBlogs.length > 0) setActiveTab('web');
    }
  }, [searchTerm, activeTab, allProducts.length, allVideos.length, allBlogs.length]);

  const handleFilterClick = (categoryLabel: string) => {
    if (searchTerm === categoryLabel) {
      router.push('/search');
    } else {
      router.push(`/search?q=${categoryLabel}`);
    }
  };


  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
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
        {isFetching ? (
          <div className="text-center">검색 결과를 불러오는 중...</div>
        ) : !searchTerm ? (
          <div className="text-center text-gray-500 py-20">
            <h2 className="text-2xl font-semibold">궁금한 내용을 검색하거나 추천 카테고리를 선택해 보세요.</h2>
            <p>예: 슬개골 탈구, 강아지 사료, 짖음 훈련</p>
          </div>
        ) : hasResults ? (
          <>
            <h2 className="text-2xl font-bold mb-6 text-center">"{searchTerm}" 검색 결과</h2>

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

            {/* 검색 결과 */}
            <div>
              {activeTab === 'products' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {allProducts.map((product: Product, index: number) => (
                    <div key={`${product.productId}-${index}`} className="relative border rounded-lg overflow-hidden shadow-lg transition-transform hover:scale-105 bg-white">
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
                      <a href={product.link} target="_blank" rel="noopener noreferrer">
                        <div className="relative w-full h-48">
                          <Image src={product.image} alt={stripHtml(product.title)} fill className="object-cover" sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw, 100vw" priority={index < 4} />
                        </div>
                        <div className="p-4">
                          <p className="text-xs text-gray-500 mb-1">{product.mallName}</p>
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

            <div ref={ref} className="text-center py-8">
              {activeTab === 'products' && isFetchingNextProductsPage && '더 많은 상품을 불러오는 중...'}
              {activeTab === 'youtube' && isFetchingNextYouTubePage && '더 많은 YouTube 결과를 불러오는 중...'}
              {activeTab === 'web' && isFetchingNextWebPage && '더 많은 웹 검색 결과를 불러오는 중...'}
            </div>
          </>
        ) : (
          <div className="text-center py-20">"{searchTerm}"에 대한 검색 결과가 없습니다.</div>
        )}
      </section>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SearchResultList />
    </Suspense>
  )
}
