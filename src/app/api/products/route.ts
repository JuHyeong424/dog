import { NextRequest, NextResponse } from 'next/server';
import { categorizeProductByTitle } from "@/lib/product-categorizer";
import { Product } from '@/types/products';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('query');
  // --- [핵심 수정 1] ---
  // 클라이언트에서 'start' 파라미터를 받습니다. 없으면 1로 시작합니다.
  const start = parseInt(searchParams.get('start') || '1', 10);
  const display = 20; // 한 번에 20개씩 불러옵니다.
  // --- [수정 끝] ---

  if (!query) {
    return NextResponse.json({ error: '검색어가 필요합니다.' }, { status: 400 });
  }

  try {
    const clientId = process.env.NAVER_CLIENT_ID;
    const clientSecret = process.env.NAVER_CLIENT_SECRET;

    if (!clientId || !clientSecret) throw new Error('네이버 API 자격 증명이 설정되지 않았습니다.');

    const searchQuery = `강아지 ${query}`;
    // --- [핵심 수정 2] ---
    // API URL에 display와 start 파라미터를 추가합니다.
    const apiURL = `https://openapi.naver.com/v1/search/shop.json?query=${encodeURI(
      searchQuery
    )}&display=${display}&start=${start}&sort=sim`;
    // --- [수정 끝] ---

    const response = await fetch(apiURL, {
      method: 'GET',
      headers: { 'X-Naver-Client-Id': clientId, 'X-Naver-Client-Secret': clientSecret },
      cache: 'no-store',
    });

    if (!response.ok) throw new Error(`API 요청 실패: ${response.statusText}`);

    const data = await response.json();

    const categorizedProducts: Product[] = data.items.map((item: any) => ({
      ...item,
      categories: categorizeProductByTitle(item.title),
    }));

    // --- [핵심 수정 3] ---
    // 다음 페이지가 있는지 계산하여 'nextStart' 값을 함께 반환합니다.
    const totalResults = data.total;
    const nextStart = start + display <= totalResults ? start + display : undefined;

    return NextResponse.json({
      products: categorizedProducts,
      nextStart: nextStart,
    });

  } catch (error) {
    if (error instanceof Error) {
      console.error("Naver Products API fetch error:", error.message);
    } else {
      console.error("Naver Products API fetch error:", error);
    }

    return NextResponse.json(
      { error: "Failed to fetch Naver Products" },
      { status: 500 }
    );
  }
}

