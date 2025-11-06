// src/components/search/VideoResultCard.tsx 파일 수정

"use client";

import Image from 'next/image';
import { Video } from '@/hooks/search/useYouTubeSearch';
import SaveButton from '@/components/common/SaveButton'; // SaveButton import 추가

interface VideoResultCardProps {
  video: Video;
}

export default function VideoResultCard({ video }: VideoResultCardProps) {
  const videoUrl = `https://www.youtube.com/watch?v=${video.id}`;
  return (
    // [수정] a 태그를 div로 바꾸고, position: relative 추가
    <div className="group relative flex flex-col bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden">
      {/* [추가] SaveButton 컴포넌트 */}
      <SaveButton
        contentType="youtube"
        contentId={video.id}
        contentData={{
          name: video.title,
          thumbnailUrl: video.thumbnailUrl,
          channelTitle: video.channelTitle,
          link: videoUrl
        }}
      />
      <a href={videoUrl} target="_blank" rel="noopener noreferrer">
        <div className="relative w-full h-40">
          <Image
            src={video.thumbnailUrl}
            alt={video.title}
            fill
            style={{ objectFit: 'cover' }}
            className="transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      </a>
      <div className="p-4 flex flex-col flex-grow">
        <a href={videoUrl} target="_blank" rel="noopener noreferrer">
          <h3 className="text-base font-bold text-gray-800 mb-2 line-clamp-2 flex-grow hover:text-blue-600">
            {video.title}
          </h3>
        </a>
        <p className="text-xs text-gray-500">{video.channelTitle}</p>
      </div>
    </div>
  );
}
