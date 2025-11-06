import { NextRequest, NextResponse } from 'next/server';
import { categorizeProductByTitle } from "@/lib/product-categorizer";
import { Product } from '@/types/products';

// GET 요청을 처리하는 비동기 API 라우트 핸들러입니다.
export async function GET(request: NextRequest) {
  // 요청 URL에서 'query'(검색어)와 'start'(시작 위치) 파라미터를 추출합니다.
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('query');
  const start = parseInt(searchParams.get('start') || '1', 10);
  // 한 번의 API 호출로 가져올 상품 개수를 20개로 고정합니다.
  const display = 20;

  // 검색어가 없으면 400 에러를 반환합니다.
  if (!query) {
    return NextResponse.json({ error: '검색어가 필요합니다.' }, { status: 400 });
  }

  try {
    // 환경 변수에서 네이버 API 클라이언트 ID와 시크릿을 가져옵니다.
    const clientId = process.env.NAVER_CLIENT_ID;
    const clientSecret = process.env.NAVER_CLIENT_SECRET;

    // API 자격 증명이 없으면 에러를 발생시킵니다.
    if (!clientId || !clientSecret) throw new Error('네이버 API 자격 증명이 설정되지 않았습니다.');

    // 실제 검색어 앞에 '강아지'를 붙여 검색 범위를 한정합니다.
    const searchQuery = `강아지 ${query}`;
    // 네이버 쇼핑 검색 API URL을 생성합니다. (display: 개수, start: 시작 위치, sort: 정확도순)
    const apiURL = `https://openapi.naver.com/v1/search/shop.json?query=${encodeURI(
      searchQuery
    )}&display=${display}&start=${start}&sort=sim`;

    // fetch를 사용하여 네이버 API를 호출합니다.
    const response = await fetch(apiURL, {
      method: 'GET',
      headers: { 'X-Naver-Client-Id': clientId, 'X-Naver-Client-Secret': clientSecret },
      cache: 'no-store', // API 호출 결과를 캐시하지 않도록 설정합니다.
    });

    // API 응답이 실패하면 에러를 발생시킵니다.
    if (!response.ok) throw new Error(`API 요청 실패: ${response.statusText}`);

    // 응답 데이터를 JSON 형태로 파싱합니다.
    const data = await response.json();

    // 각 상품의 제목(title)을 분석하여 카테고리를 부여합니다.
    const categorizedProducts: Product[] = data.items.map((item: any) => ({
      ...item, // 기존 상품 정보 유지
      categories: categorizeProductByTitle(item.title), // 카테고리 정보 추가
    }));

    // 전체 검색 결과 수를 가져옵니다.
    const totalResults = data.total;
    // 다음 페이지를 불러올 시작 위치를 계산합니다. 더 이상 결과가 없으면 undefined가 됩니다.
    const nextStart = start + display <= totalResults ? start + display : undefined;

    // 최종적으로 카테고리화된 상품 목록과 다음 페이지 시작 위치를 반환합니다.
    return NextResponse.json({
      products: categorizedProducts,
      nextStart: nextStart,
    });

  } catch (error) {
    // 에러 발생 시 서버 콘솔에 로그를 남깁니다.
    if (error instanceof Error) {
      console.error("Naver Products API fetch error:", error.message);
    } else {
      console.error("Naver Products API fetch error:", error);
    }

    // 클라이언트에게는 500 서버 에러와 함께 실패 메시지를 반환합니다.
    return NextResponse.json(
      { error: "Failed to fetch Naver Products" },
      { status: 500 }
    );
  }
}
