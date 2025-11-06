"use client";

import Image from 'next/image';

// 개별 유튜브 채널의 데이터 구조를 정의하는 인터페이스입니다.
export interface Channel {
  id: string;          // 채널의 고유 ID
  name: string;        // 채널 이름
  description: string; // 채널 설명
  imageUrl: string;    // 채널 프로필 이미지 URL
  channelUrl: string;  // 채널로 바로 갈 수 있는 URL
}

// RecommendedChannelCard 컴포넌트가 부모로부터 받을 props의 타입을 정의하는 인터페이스입니다.
interface RecommendedChannelCardProps {
  channel: Channel; // 표시할 단일 채널의 데이터
}

// 추천 유튜브 채널 하나를 보여주는 카드 형태의 UI 컴포넌트입니다.
export default function RecommendedChannelCard({ channel }: RecommendedChannelCardProps) {
  return (
    // 카드 전체를 클릭 가능한 링크(<a>)로 만듭니다.
    // target="_blank"는 새 탭에서 링크를 열도록 합니다.
    <a
      href={channel.channelUrl}
      target="_blank"
      rel="noopener noreferrer" // 보안 및 성능상의 이점을 위해 추가
      className="group flex items-center gap-4 p-4 bg-white rounded-xl shadow-md hover:shadow-xl hover:scale-105 transition-all duration-300"
    >
      {/* 채널 프로필 이미지를 감싸는 컨테이너입니다. */}
      <div className="flex-shrink-0 w-20 h-20 relative">
        {/* Next.js의 Image 컴포넌트를 사용하여 이미지를 렌더링합니다. */}
        <Image
          src={channel.imageUrl}
          alt={`${channel.name} channel logo`}
          fill // 부모 요소에 꽉 차도록 이미지를 조절합니다.
          style={{ objectFit: 'cover' }} // 이미지 비율을 유지하면서 컨테이너를 채웁니다.
          className="rounded-full" // 이미지를 원형으로 만듭니다.
        />
      </div>
      {/* 채널 이름, 설명 등 텍스트 정보를 담는 컨테이너입니다. */}
      <div className="flex-grow">
        {/* 채널 이름을 표시합니다. */}
        <h3 className="text-lg font-bold text-gray-800">{channel.name}</h3>
        {/* 채널 설명을 표시합니다. 최대 2줄까지 보여주고 나머지는 말줄임표로 처리됩니다. */}
        <p className="text-sm text-gray-600 line-clamp-2">{channel.description}</p>
        {/* '채널 바로가기' 텍스트입니다. group-hover를 사용하여 카드 전체에 마우스를 올리면 밑줄이 생깁니다. */}
        <span className="text-xs text-blue-500 font-semibold mt-1 inline-block group-hover:underline">
          채널 바로가기 &rarr;
        </span>
      </div>
    </a>
  );
}
