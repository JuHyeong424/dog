"use client";

import Link from "next/link";
import { FaTree, FaStore, FaMapMarkerAlt } from "react-icons/fa";

interface Place {
  id: string;
  name: string;
  vicinity: string;
  distance: string;
  duration: string;
}

interface RecommendedPlacesProps {
  places: Place[];
  isGoodWeather: boolean;
  limit?: number;
  onPlaceClick: (placeId: string) => void;
}

const placesDetails = [
  { icon: <FaTree size={24} className="text-green-500" />, tag: "추천", tagColor: "text-green-500" },
  { icon: <FaStore size={24} className="text-blue-500" />, tag: "인기", tagColor: "text-blue-500" },
  { icon: <FaMapMarkerAlt size={24} className="text-purple-500" />, tag: "신규", tagColor: "text-purple-500" },
];

export default function RecommendedPlaces({ places, isGoodWeather, limit, onPlaceClick }: RecommendedPlacesProps) {
  const title = isGoodWeather ? "추천 산책 장소" : "비 올 때 추천 장소";
  const placesToShow = limit ? places.slice(0, limit) : places;

  return (
    <div className="bg-white rounded-xl shadow-md p-6 h-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">{title}</h2>
        <Link href="/places" className="text-blue-500 font-semibold text-sm">더보기 &rarr;</Link>
      </div>
      <ul className="space-y-3">
        {placesToShow.length === 0 ? (
          <li className="text-gray-500">추천 장소가 없습니다.</li>
        ) : (
          placesToShow.map((place, index) => {
            const detail = placesDetails[index % placesDetails.length];
            const description = isGoodWeather
              ? `산책로 • ${place.distance}`
              : `실내 공간 • ${place.distance}`;

            return (
              <li
                key={place.id}
                className="flex items-center p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => onPlaceClick(place.id)}
              >
                <div className={`mr-3 p-3 rounded-lg bg-opacity-20 ${
                  index % 3 === 0 ? 'bg-green-100' : index % 3 === 1 ? 'bg-blue-100' : 'bg-purple-100'
                }`}>
                  {detail.icon}
                </div>
                <div className="flex-grow">
                  <h3 className="font-bold text-md">{place.name}</h3>
                  <p className="text-gray-500 text-xs">{description}</p>
                </div>
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
