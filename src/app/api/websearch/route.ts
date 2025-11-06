import { NextResponse } from 'next/server';
import axios, { isAxiosError } from 'axios';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');
  const startIndex = searchParams.get('startIndex'); // pageToken 대신 startIndex

  if (!query) {
    return NextResponse.json({ error: 'Query is required' }, { status: 400 });
  }

  const CUSTOM_SEARCH_API_KEY = process.env.CUSTOM_SEARCH_API_KEY;
  const SEARCH_ENGINE_ID = process.env.SEARCH_ENGINE_ID;

  if (!CUSTOM_SEARCH_API_KEY || !SEARCH_ENGINE_ID) {
    return NextResponse.json({ error: 'API key or Search Engine ID is not configured' }, { status: 500 });
  }

  const resultsPerPage = 9;

  try {
    const response = await axios.get('https://www.googleapis.com/customsearch/v1', {
      params: {
        key: CUSTOM_SEARCH_API_KEY,
        cx: SEARCH_ENGINE_ID,
        q: `강아지 ${query}`,
        num: resultsPerPage,
        start: startIndex || 1, // startIndex가 없으면 1부터 시작
      },
    });

    const blogs = response.data.items?.map((item: any) => ({
      title: item.title,
      link: item.link,
      snippet: item.snippet,
      displayLink: item.displayLink,
    })) ?? [];

    const totalResults = parseInt(response.data.searchInformation?.totalResults || '0', 10);
    const currentStartIndex = parseInt(startIndex || '1', 10);

    // 다음 페이지가 있는지 계산하여 nextStartIndex를 반환
    const nextStartIndex = currentStartIndex + resultsPerPage;

    return NextResponse.json({
      blogs,
      nextStartIndex: nextStartIndex <= totalResults && blogs.length > 0 ? nextStartIndex : undefined,
    });
  } catch (error) {
    // ... (에러 처리 부분은 이전과 동일)
    if (isAxiosError(error)) {
      console.error("Axios Error fetching from Web Search:", error.response?.data);
      return NextResponse.json({ error: 'Failed to fetch web results', details: error.response?.data }, { status: 500 });
    }
    console.error("Unknown Error fetching from Web Search:", error);
    return NextResponse.json({ error: 'An unknown error occurred' }, { status: 500 });
  }
}
