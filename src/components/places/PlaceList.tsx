"use client";

import { FaTree, FaCoffee } from 'react-icons/fa';
import { Place } from '@/types/place';

interface PlaceListProps {
  places: Place[];
  isGoodWeather: boolean;
  onPlaceClick: (placeId: string) => void;
  onPlaceMouseEnter: (place: Place) => void;
  onPlaceMouseLeave: () => void;
}

export default function PlaceList({ places, isGoodWeather, onPlaceClick, onPlaceMouseEnter, onPlaceMouseLeave }: PlaceListProps) {
  const title = isGoodWeather ? "실외 산책 장소" : "실내 추천 장소";
  const icon = isGoodWeather
    ? <FaTree className="text-green-500" />
    : <FaCoffee className="text-blue-500" />;

  return (
    <div>
      <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
        {icon}
        {title}
      </h2>
      <ul className="space-y-2">
        {places.length > 0 ? (
          places.map(place => (
            <li
              key={place.id}
              onClick={() => onPlaceClick(place.id)}
              onMouseEnter={() => onPlaceMouseEnter(place)}
              onMouseLeave={onPlaceMouseLeave}
              className="p-3 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
            >
              <h3 className="font-bold">{place.name}</h3>
              <p className="text-sm text-gray-500">{place.vicinity}</p>
              <p className="text-xs text-gray-400">{place.distance} • {place.duration}</p>
            </li>
          ))
        ) : (
          <li className="p-3 text-gray-500">주변에 추천 장소가 없습니다.</li>
        )}
      </ul>
    </div>
  );
}
