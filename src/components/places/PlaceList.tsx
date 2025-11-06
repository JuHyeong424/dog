"use client";

import { FaTree, FaCoffee } from 'react-icons/fa';
import { Place } from '@/types/place';

// PlaceList 컴포넌트가 부모로부터 받을 props의 타입을 정의하는 인터페이스입니다.
interface PlaceListProps {
  places: Place[];                          // 지도에 표시될 장소 객체들의 배열
  isGoodWeather: boolean;                   // 날씨가 좋은지 여부 (true/false)
  onPlaceClick: (placeId: string) => void;  // 장소 목록 항목을 클릭했을 때 실행될 콜백 함수
  onPlaceMouseEnter: (place: Place) => void; // 목록 항목에 마우스를 올렸을 때 실행될 콜백 함수
  onPlaceMouseLeave: () => void;            // 목록 항목에서 마우스가 벗어났을 때 실행될 콜백 함수
}

// 날씨에 따라 추천된 장소 목록을 UI에 표시하는 컴포넌트입니다.
export default function PlaceList({ places, isGoodWeather, onPlaceClick, onPlaceMouseEnter, onPlaceMouseLeave }: PlaceListProps) {
  // isGoodWeather 값에 따라 목록의 제목과 아이콘을 동적으로 결정합니다.
  const title = isGoodWeather ? "실외 산책 장소" : "실내 추천 장소";
  const icon = isGoodWeather
    ? <FaTree className="text-green-500" />   // 날씨가 좋으면 나무 아이콘
    : <FaCoffee className="text-blue-500" />; // 날씨가 나쁘면 커피 아이콘

  return (
    // 전체 목록을 감싸는 컨테이너
    <div>
      {/* 동적으로 결정된 아이콘과 제목을 표시하는 헤더 */}
      <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
        {icon}
        {title}
      </h2>
      {/* 장소 목록을 표시하는 리스트 */}
      <ul className="space-y-2">
        {places.length > 0 ? (
          // places 배열을 순회하면서 각 장소에 대한 리스트 아이템(li)을 생성합니다.
          places.map(place => (
            <li
              key={place.id} // React가 각 항목을 식별하기 위한 고유한 key
              onClick={() => onPlaceClick(place.id)} // 클릭 시 상세 정보 모달을 엽니다.
              onMouseEnter={() => onPlaceMouseEnter(place)} // 마우스를 올리면 지도와 연동됩니다.
              onMouseLeave={onPlaceMouseLeave} // 마우스가 벗어나면 연동을 해제합니다.
              className="p-3 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
            >
              <h3 className="font-bold">{place.name}</h3>
              <p className="text-sm text-gray-500">{place.vicinity}</p>
              <p className="text-xs text-gray-400">{place.distance} • {place.duration}</p>
            </li>
          ))
        ) : (
          // 표시할 장소가 없을 경우 메시지를 보여줍니다.
          <li className="p-3 text-gray-500">주변에 추천 장소가 없습니다.</li>
        )}
      </ul>
    </div>
  );
}
