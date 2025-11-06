"use client";

import Image from 'next/image';

export interface Channel {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  channelUrl: string;
}

interface RecommendedChannelCardProps {
  channel: Channel;
}

export default function RecommendedChannelCard({ channel }: RecommendedChannelCardProps) {
  return (
    <a
      href={channel.channelUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center gap-4 p-4 bg-white rounded-xl shadow-md hover:shadow-xl hover:scale-105 transition-all duration-300"
    >
      <div className="flex-shrink-0 w-20 h-20 relative">
        <Image
          src={channel.imageUrl}
          alt={`${channel.name} channel logo`}
          fill
          style={{ objectFit: 'cover' }}
          className="rounded-full"
        />
      </div>
      <div className="flex-grow">
        <h3 className="text-lg font-bold text-gray-800">{channel.name}</h3>
        <p className="text-sm text-gray-600 line-clamp-2">{channel.description}</p>
        <span className="text-xs text-blue-500 font-semibold mt-1 inline-block group-hover:underline">
          채널 바로가기 &rarr;
        </span>
      </div>
    </a>
  );
}
