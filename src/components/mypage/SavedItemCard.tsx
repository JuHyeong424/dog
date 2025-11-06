"use client";

import Image from 'next/image';
import { FaYoutube, FaShoppingBag, FaGlobe, FaMapMarkerAlt, FaTimes } from 'react-icons/fa';

// 다양한 콘텐츠 타입(장소, 상품 등)의 메타데이터 구조를 정의합니다.
interface ContentData {
  name: string;
  vicinity?: string; // 장소 주소
  photo_reference?: string; // 장소 사진 참조 ID
  image?: string; // 상품/유튜브 이미지 URL
  price?: string; // 상품 가격
  mallName?: string; // 상품 쇼핑몰 이름
  thumbnailUrl?: string; // 유튜브 썸네일 URL
  channelTitle?: string; // 유튜브 채널명
  link?: string; // 상품/유튜브/웹 링크
  snippet?: string; // 웹 페이지 요약
  displayLink?: string; // 웹 페이지 도메인
}

// DB에 저장된 개별 아이템의 전체 데이터 구조를 정의합니다.
interface SavedItem {
  id: string; // DB의 고유 ID
  content_type: 'place' | 'product' | 'youtube' | 'web'; // 콘텐츠 타입
  content_id: string; // 원본 콘텐츠의 ID (예: place_id)
  content_data: ContentData; // 콘텐츠 메타데이터
}

// SavedItemCard 컴포넌트가 받는 props의 타입을 정의합니다.
interface SavedItemCardProps {
  item: SavedItem; // 표시할 아이템 데이터
  onItemClick: (placeId: string) => void; // 장소 카드 클릭 시 실행될 함수
  onDelete: (itemId: string) => void; // 삭제 버튼 클릭 시 실행될 함수
  onMouseEnter?: () => void; // 마우스 진입 시 실행될 함수 (지도 연동용)
  onMouseLeave?: () => void; // 마우스 이탈 시 실행될 함수 (지도 연동용)
}

// Google Places API의 사진 참조 ID를 사용하여 실제 이미지 URL을 생성하는 함수입니다.
const getGooglePhotoUrl = (ref: string) => `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${ref}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`;

// 모든 카드에 공통적으로 사용될 래퍼(Wrapper) 컴포넌트입니다.
// link prop이 있으면 <a> 태그로, 없으면 <div> 태그로 렌더링하여 클릭 동작을 다르게 처리합니다.
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

// 콘텐츠 타입에 따라 적절한 아이콘을 표시하는 컴포넌트입니다.
const TypeIcon = ({ type }: { type: string }) => {
  const icons = {
    place: <FaMapMarkerAlt className="text-red-500" />,
    product: <FaShoppingBag className="text-blue-500" />,
    youtube: <FaYoutube className="text-red-600" />,
    web: <FaGlobe className="text-green-500" />,
  };
  return <div className="absolute top-2 left-2 z-10 bg-white p-1.5 rounded-full shadow">{icons[type as keyof typeof icons]}</div>;
};

// 마이페이지에 표시될 개별 저장 항목 카드 컴포넌트입니다.
export default function SavedItemCard({ item, onItemClick, onDelete, onMouseEnter, onMouseLeave }: SavedItemCardProps) {
  const { content_type, content_data } = item;

  // 삭제 버튼 클릭 시 실행되는 함수입니다.
  const handleDeleteClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault(); // 부모 요소(<a>)의 기본 동작(링크 이동)을 막습니다.
    e.stopPropagation(); // 이벤트가 부모로 전파되는 것(이벤트 버블링)을 막습니다.
    // 사용자에게 삭제 여부를 확인한 후, 부모로부터 받은 onDelete 함수를 호출합니다.
    if (window.confirm("정말로 이 항목을 삭제하시겠습니까?")) {
      onDelete(item.id);
    }
  };

  // 모든 카드에 공통으로 들어가는 헤더 부분(타입 아이콘, 삭제 버튼)입니다.
  const commonHeader = (
    <>
      <TypeIcon type={content_type} />
      <button
        onClick={handleDeleteClick}
        className="absolute top-2 right-2 z-10 bg-white p-1.5 rounded-full shadow text-gray-500 hover:text-red-500 hover:scale-110 transition-all"
        aria-label="삭제하기"
      >
        <FaTimes size={14} />
      </button>
    </>
  );

  // 콘텐츠 타입에 따라 다른 UI를 렌더링합니다.
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
    // 일치하는 타입이 없으면 아무것도 렌더링하지 않습니다.
    default:
      return null;
  }
}
