import { NextResponse } from 'next/server';
import axios, { isAxiosError } from 'axios';

// GET 요청을 처리하는 비동기 API 라우트 핸들러입니다.
export async function GET(request: Request) {
  // 요청 URL에서 'query'(검색어)와 'pageToken'(다음 페이지 토큰)을 추출합니다.
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');
  const pageToken = searchParams.get('pageToken');

  // 검색어가 없으면 400 에러를 반환합니다.
  if (!query) {
    return NextResponse.json({ error: 'Query is required' }, { status: 400 });
  }

  // 환경 변수에서 YouTube API 키를 가져옵니다.
  const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
  // API 키가 설정되지 않았으면 500 에러를 반환합니다.
  if (!YOUTUBE_API_KEY) {
    return NextResponse.json({ error: 'YouTube API key is not configured' }, { status: 500 });
  }

  try {
    // YouTube Data API v3 (search)에 GET 요청을 보냅니다.
    const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
      params: {
        key: YOUTUBE_API_KEY,
        part: 'snippet',          // 비디오의 기본 정보(제목, 설명, 썸네일 등)를 요청합니다.
        q: `강아지 ${query}`,     // 검색어 앞에 '강아지'를 추가하여 검색 범위를 좁힙니다.
        type: 'video',            // 비디오만 검색 결과에 포함시킵니다.
        maxResults: 9,            // 한 페이지에 9개의 결과를 가져옵니다.
        pageToken: pageToken || undefined, // 다음 페이지 토큰이 있으면 전달합니다.
      },
    });

    // API 응답에서 필요한 데이터(ID, 제목, 썸네일 등)만 추출하여 비디오 목록을 생성합니다.
    const videos = response.data.items?.map((item: any) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      thumbnailUrl: item.snippet.thumbnails.high.url, // 고화질 썸네일 사용
      channelTitle: item.snippet.channelTitle,
    })) ?? []; // 결과가 없으면 빈 배열로 초기화합니다.

    // 최종적으로 비디오 목록과 다음 페이지를 위한 토큰을 반환합니다.
    return NextResponse.json({
      videos,
      nextPageToken: response.data.nextPageToken,
    });

  } catch (error) {
    // Axios 관련 에러가 발생한 경우, 상세 응답 데이터를 로그로 남깁니다.
    if (isAxiosError(error)) {
      console.error("Axios Error fetching from YouTube:", error.response?.data);
      return NextResponse.json({ error: 'Failed to fetch videos from YouTube', details: error.response?.data }, { status: 500 });
    }
    // 그 외의 에러가 발생한 경우, 일반 에러 로그를 남깁니다.
    console.error("Unknown Error fetching from YouTube:", error);
    return NextResponse.json({ error: 'An unknown error occurred' }, { status: 500 });
  }
}
