import { NextResponse } from 'next/server';
import axios, { isAxiosError } from 'axios';

// GET 요청을 처리하는 비동기 API 라우트 핸들러입니다.
export async function GET(request: Request) {
  // 요청 URL에서 'query'(검색어)와 'startIndex'(시작 위치) 파라미터를 추출합니다.
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');
  const startIndex = searchParams.get('startIndex');

  // 검색어가 없으면 400 에러를 반환합니다.
  if (!query) {
    return NextResponse.json({ error: 'Query is required' }, { status: 400 });
  }

  // 환경 변수에서 Google Custom Search API 키와 검색 엔진 ID를 가져옵니다.
  const CUSTOM_SEARCH_API_KEY = process.env.CUSTOM_SEARCH_API_KEY;
  const SEARCH_ENGINE_ID = process.env.SEARCH_ENGINE_ID;

  // API 키 또는 검색 엔진 ID가 설정되지 않았으면 500 에러를 반환합니다.
  if (!CUSTOM_SEARCH_API_KEY || !SEARCH_ENGINE_ID) {
    return NextResponse.json({ error: 'API key or Search Engine ID is not configured' }, { status: 500 });
  }

  // 한 페이지에 표시할 결과의 수를 9개로 설정합니다.
  const resultsPerPage = 9;

  try {
    // Google Custom Search API에 GET 요청을 보냅니다.
    const response = await axios.get('https://www.googleapis.com/customsearch/v1', {
      params: {
        key: CUSTOM_SEARCH_API_KEY,
        cx: SEARCH_ENGINE_ID,
        q: `강아지 ${query}`, // 검색어 앞에 '강아지'를 추가하여 검색 범위를 좁힙니다.
        num: resultsPerPage,    // 가져올 결과 수
        start: startIndex || 1, // 검색 시작 위치
      },
    });

    // API 응답에서 필요한 데이터(제목, 링크, 요약 등)만 추출하여 블로그 목록을 생성합니다.
    const blogs = response.data.items?.map((item: any) => ({
      title: item.title,
      link: item.link,
      snippet: item.snippet,
      displayLink: item.displayLink,
    })) ?? []; // 결과가 없으면 빈 배열로 초기화합니다.

    // 전체 검색 결과 수를 가져옵니다.
    const totalResults = parseInt(response.data.searchInformation?.totalResults || '0', 10);
    // 현재 검색 시작 위치를 숫자로 변환합니다.
    const currentStartIndex = parseInt(startIndex || '1', 10);

    // 다음 페이지를 불러올 시작 위치를 계산합니다.
    const nextStartIndex = currentStartIndex + resultsPerPage;

    // 최종적으로 블로그 목록과 다음 페이지 시작 위치를 반환합니다.
    // 더 이상 결과가 없으면 nextStartIndex는 undefined가 됩니다.
    return NextResponse.json({
      blogs,
      nextStartIndex: nextStartIndex <= totalResults && blogs.length > 0 ? nextStartIndex : undefined,
    });
  } catch (error) {
    // Axios 관련 에러가 발생한 경우, 상세 응답 데이터를 로그로 남깁니다.
    if (isAxiosError(error)) {
      console.error("Axios Error fetching from Web Search:", error.response?.data);
      return NextResponse.json({ error: 'Failed to fetch web results', details: error.response?.data }, { status: 500 });
    }
    // 그 외의 에러가 발생한 경우, 일반 에러 로그를 남깁니다.
    console.error("Unknown Error fetching from Web Search:", error);
    return NextResponse.json({ error: 'An unknown error occurred' }, { status: 500 });
  }
}
