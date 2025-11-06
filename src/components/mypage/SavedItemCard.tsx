"use client";

import Image from 'next/image';
import { FaYoutube, FaShoppingBag, FaGlobe, FaMapMarkerAlt, FaTimes } from 'react-icons/fa';

interface ContentData {
  name: string;
  vicinity?: string;
  photo_reference?: string;
  image?: string;
  price?: string;
  mallName?: string;
  thumbnailUrl?: string;
  channelTitle?: string;
  link?: string;
  snippet?: string;
  displayLink?: string;
}

interface SavedItem {
  id: string;
  content_type: 'place' | 'product' | 'youtube' | 'web';
  content_id: string;
  content_data: ContentData;
}


interface SavedItemCardProps {
  item: SavedItem;
  onItemClick: (placeId: string) => void;
  onDelete: (itemId: string) => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

const getGooglePhotoUrl = (ref: string) => `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${ref}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`;

const CardWrapper = ({ children, link, onClick, onMouseEnter, onMouseLeave }: {
  children: React.ReactNode,
  link?: string,
  onClick?: () => void,
  onMouseEnter?: () => void,
  onMouseLeave?: () => void,
}) => {
  const commonClasses = "group relative bg-white border rounded-lg shadow-md overflow-hidden transform hover:-translate-y-1 transition-transform duration-300 flex flex-col";

  if (link) {
    return <a href={link} target="_blank" rel="noopener noreferrer" className={commonClasses}>{children}</a>;
  }
  return (
    <div
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={`${commonClasses} cursor-pointer`}
    >
      {children}
    </div>
  );
};

const TypeIcon = ({ type }: { type: string }) => {
  const icons = {
    place: <FaMapMarkerAlt className="text-red-500" />,
    product: <FaShoppingBag className="text-blue-500" />,
    youtube: <FaYoutube className="text-red-600" />,
    web: <FaGlobe className="text-green-500" />,
  };
  return <div className="absolute top-2 left-2 z-10 bg-white p-1.5 rounded-full shadow">{icons[type as keyof typeof icons]}</div>;
};

export default function SavedItemCard({ item, onItemClick, onDelete, onMouseEnter, onMouseLeave }: SavedItemCardProps) {
  const { content_type, content_data } = item;

  const handleDeleteClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm("정말로 이 항목을 삭제하시겠습니까?")) {
      onDelete(item.id);
    }
  };

  const commonHeader = (
    <>
      <TypeIcon type={content_type} />
      <button onClick={handleDeleteClick} /* ... */ >
        <FaTimes size={14} />
      </button>
    </>
  );

  switch (content_type) {
    case 'place':
      return (
        <CardWrapper
          onClick={() => onItemClick(item.content_id)}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
        >
          {commonHeader}
          <div className="relative w-full h-40">
            {content_data.photo_reference ? (
              <Image src={getGooglePhotoUrl(content_data.photo_reference)} alt={content_data.name} layout="fill" objectFit="cover" />
            ) : (
              <div className="bg-gray-200 h-full flex items-center justify-center text-gray-500">이미지 없음</div>
            )}
          </div>
          <div className="p-4 flex-grow">
            <h3 className="font-bold truncate">{content_data.name}</h3>
            <p className="text-sm text-gray-600 truncate">{content_data.vicinity}</p>
          </div>
        </CardWrapper>
      );
    case 'product':
      return (
        <CardWrapper link={content_data.link}>
          {commonHeader}
          <div className="relative w-full h-40">
            {content_data.image ? (
              <Image src={content_data.image} alt={content_data.name} layout="fill" objectFit="cover" />
            ) : (
              <div className="bg-gray-200 h-full flex items-center justify-center text-gray-500">이미지 없음</div>
            )}
          </div>
          <div className="p-4 flex-grow flex flex-col">
            <p className="text-xs text-gray-500">{content_data.mallName}</p>
            <h3 className="font-bold line-clamp-2 my-1 flex-grow">{content_data.name}</h3>
            <p className="font-semibold text-red-500 mt-auto">{Number(content_data.price).toLocaleString()}원</p>
          </div>
        </CardWrapper>
      );

    case 'youtube':
      return (
        <CardWrapper link={content_data.link}>
          {commonHeader}
          <div className="relative w-full h-40">
            {content_data.thumbnailUrl ? (
              <Image src={content_data.thumbnailUrl} alt={content_data.name} layout="fill" objectFit="cover" />
            ) : (
              <div className="bg-gray-200 h-full flex items-center justify-center text-gray-500">이미지 없음</div>
            )}
          </div>
          <div className="p-4 flex-grow flex flex-col">
            <h3 className="font-bold line-clamp-2 mb-1 flex-grow">{content_data.name}</h3>
            <p className="text-sm text-gray-600 mt-auto">{content_data.channelTitle}</p>
          </div>
        </CardWrapper>
      );

    case 'web':
      return (
        <CardWrapper link={content_data.link}>
          {commonHeader}
          <div className="p-4 h-full flex flex-col">
            <p className="text-xs text-gray-500 mt-8">{content_data.displayLink}</p>
            <h3 className="font-bold my-2">{content_data.name}</h3>
            <p className="text-sm text-gray-600 line-clamp-4 flex-grow">{content_data.snippet}</p>
          </div>
        </CardWrapper>
      );
    default:
      return null;
  }
}
