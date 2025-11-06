"use client";

import Link from "next/link";
import { FaTree, FaStore, FaMapMarkerAlt } from "react-icons/fa";

// 개별 장소 데이터의 구조를 정의합니다.
interface Place {
  id: string;
  name: string;
  vicinity: string; // 주소
  distance: string; // 거리
  duration: string; // 소요 시간
}

// RecommendedPlaces 컴포넌트가 부모로부터 받을 props의 타입을 정의합니다.
interface RecommendedPlacesProps {
  places: Place[];
  isGoodWeather: boolean; // 날씨가 좋은지 여부
  limit?: number; // 목록에 표시할 최대 장소 수 (선택 사항)
  onPlaceClick: (placeId: string) => void; // 장소 클릭 시 실행될 콜백 함수
}

// 각 목록 항목을 꾸미기 위한 아이콘, 태그, 색상 정보를 담은 배열입니다.
// 목록을 순회하면서 순서대로 적용됩니다.
const placesDetails = [
  { icon: <FaTree size={24} className="text-green-500" />, tag: "추천", tagColor: "text-green-500" },
  { icon: <FaStore size={24} className="text-blue-500" />, tag: "인기", tagColor: "text-blue-500" },
  { icon: <FaMapMarkerAlt size={24} className="text-purple-500" />, tag: "신규", tagColor: "text-purple-500" },
];

// 날씨에 따라 추천 장소를 목록 형태로 보여주는 컴포넌트입니다.
export default function RecommendedPlaces({ places, isGoodWeather, limit, onPlaceClick }: RecommendedPlacesProps) {
  // isGoodWeather 값에 따라 컴포넌트의 제목을 동적으로 설정합니다.
  const title = isGoodWeather ? "추천 산책 장소" : "비 올 때 추천 장소";
  // limit prop이 주어지면 places 배열을 잘라서 해당 개수만큼만 사용하고, 아니면 전체를 사용합니다.
  const placesToShow = limit ? places.slice(0, limit) : places;

  return (
    // 전체 컴포넌트를 감싸는 카드 형태의 컨테이너
    <div className="bg-white rounded-xl shadow-md p-6 h-full">
      {/* 컴포넌트 헤더 (제목과 '더보기' 링크) */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">{title}</h2>
        <Link href="/places" className="text-blue-500 font-semibold text-sm">더보기 &rarr;</Link>
      </div>
      {/* 장소 목록 */}
      <ul className="space-y-3">
        {placesToShow.length === 0 ? (
          // 표시할 장소가 없을 경우 메시지를 렌더링합니다.
          <li className="text-gray-500">추천 장소가 없습니다.</li>
        ) : (
          // placesToShow 배열을 순회하며 각 장소에 대한 리스트 아이템(li)을 생성합니다.
          placesToShow.map((place, index) => {
            // 나머지 연산자(%)를 사용하여 placesDetails 배열을 순환하며 꾸밈 정보를 가져옵니다.
            const detail = placesDetails[index % placesDetails.length];
            // 날씨에 따라 장소 설명을 다르게 설정합니다.
            const description = isGoodWeather
              ? `산책로 • ${place.distance}`
              : `실내 공간 • ${place.distance}`;

            return (
              <li
                key={place.id} // React가 각 항목을 식별하기 위한 고유한 key
                className="flex items-center p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => onPlaceClick(place.id)} // 클릭 시 부모로부터 받은 함수를 호출하여 모달을 엽니다.
              >
                {/* 아이콘 영역 */}
                <div className={`mr-3 p-3 rounded-lg bg-opacity-20 ${
                  index % 3 === 0 ? 'bg-green-100' : index % 3 === 1 ? 'bg-blue-100' : 'bg-purple-100'
                }`}>
                  {detail.icon}
                </div>
                {/* 장소 이름 및 설명 영역 */}
                <div className="flex-grow">
                  <h3 className="font-bold text-md">{place.name}</h3>
                  <p className="text-gray-500 text-xs">{description}</p>
                </div>
                {/* 태그 및 소요 시간 영역 */}
                <div className="text-right text-xs">
                  <span className={`font-bold ${detail.tagColor}`}>{detail.tag}</span>
                  <p className="text-gray-500">{place.duration}</p>
                </div>
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
}
