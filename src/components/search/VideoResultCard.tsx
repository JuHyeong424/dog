"use client";

import Image from 'next/image';
import { Video } from '@/hooks/search/useYouTubeSearch'; // 유튜브 비디오의 데이터 타입을 가져옵니다.
import SaveButton from '@/components/common/SaveButton'; // 콘텐츠를 저장하는 버튼 컴포넌트를 가져옵니다.

// VideoResultCard 컴포넌트가 부모로부터 받을 props의 타입을 정의하는 인터페이스입니다.
interface VideoResultCardProps {
  video: Video; // 표시할 단일 유튜브 비디오 데이터
}

// 유튜브 검색 결과를 보여주는 카드 형태의 UI 컴포넌트입니다.
export default function VideoResultCard({ video }: VideoResultCardProps) {
  // 비디오 ID를 사용하여 완전한 유튜브 시청 URL을 생성합니다.
  const videoUrl = `https://www.youtube.com/watch?v=${video.id}`;

  return (
    // 전체 카드를 감싸는 컨테이너입니다. 호버 시 그림자 효과가 강조됩니다.
    <div className="group relative flex flex-col bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden">
      {/* 카드 우측 상단에 위치하는 '저장하기' 버튼 컴포넌트입니다. */}
      <SaveButton
        contentType="youtube" // 저장할 콘텐츠의 종류를 'youtube'로 지정합니다.
        contentId={video.id} // 콘텐츠를 식별할 고유 ID로 비디오 ID를 사용합니다.
        contentData={{ // 마이페이지에서 보여줄 메타데이터를 전달합니다.
          name: video.title,
          thumbnailUrl: video.thumbnailUrl,
          channelTitle: video.channelTitle,
          link: videoUrl
        }}
      />
      {/* 썸네일 이미지를 클릭 가능한 링크로 만듭니다. */}
      <a href={videoUrl} target="_blank" rel="noopener noreferrer">
        <div className="relative w-full h-40">
          {/* Next.js의 Image 컴포넌트를 사용하여 썸네일을 렌더링합니다. */}
          <Image
            src={video.thumbnailUrl}
            alt={video.title}
            fill // 부모 요소에 꽉 차도록 이미지를 조절합니다.
            style={{ objectFit: 'cover' }} // 이미지 비율을 유지하면서 컨테이너를 채웁니다.
            className="transition-transform duration-300 group-hover:scale-105" // 호버 시 이미지가 약간 확대되는 효과
          />
        </div>
      </a>
      {/* 비디오 제목과 채널명을 담는 컨테이너입니다. */}
      <div className="p-4 flex flex-col flex-grow">
        {/* 비디오 제목을 클릭 가능한 링크로 만듭니다. */}
        <a href={videoUrl} target="_blank" rel="noopener noreferrer">
          {/* 비디오 제목을 표시합니다. 최대 2줄까지 보여주고 나머지는 말줄임표로 처리됩니다. */}
          <h3 className="text-base font-bold text-gray-800 mb-2 line-clamp-2 flex-grow hover:text-blue-600">
            {video.title}
          </h3>
        </a>
        {/* 채널명을 표시합니다. */}
        <p className="text-xs text-gray-500">{video.channelTitle}</p>
      </div>
    </div>
  );
}
