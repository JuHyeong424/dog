import { NextResponse } from 'next/server';
import axios, { isAxiosError } from 'axios';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');
  const pageToken = searchParams.get('pageToken');

  if (!query) {
    return NextResponse.json({ error: 'Query is required' }, { status: 400 });
  }

  const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
  if (!YOUTUBE_API_KEY) {
    return NextResponse.json({ error: 'YouTube API key is not configured' }, { status: 500 });
  }

  try {
    const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
      params: {
        key: YOUTUBE_API_KEY,
        part: 'snippet',
        q: `강아지 ${query}`,
        type: 'video',
        maxResults: 9, // 한 페이지에 9개씩
        pageToken: pageToken || undefined,
      },
    });

    const videos = response.data.items?.map((item: any) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      thumbnailUrl: item.snippet.thumbnails.high.url,
      channelTitle: item.snippet.channelTitle,
    })) ?? [];

    return NextResponse.json({
      videos,
      nextPageToken: response.data.nextPageToken,
    });

  } catch (error) {
    // ... (에러 처리 부분은 이전과 동일)
    if (isAxiosError(error)) {
      console.error("Axios Error fetching from YouTube:", error.response?.data);
      return NextResponse.json({ error: 'Failed to fetch videos from YouTube', details: error.response?.data }, { status: 500 });
    }
    console.error("Unknown Error fetching from YouTube:", error);
    return NextResponse.json({ error: 'An unknown error occurred' }, { status: 500 });
  }
}
