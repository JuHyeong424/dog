"use client";

import { useState, useMemo } from "react";
import useCurrentLocation from "@/hooks/useCurrentLocation";
import { usePlaces } from "@/hooks/places/usePlaces";
import RecommendPlaces from "@/components/places/RecommendPlaces";
import PlaceList from "@/components/places/PlaceList";
import PlaceDetailModal from "@/components/places/PlaceDetailModal";
import { FaMapMarkedAlt, FaListUl } from 'react-icons/fa';
import { Place } from '@/types/place';
import { useOpenWeather } from "@/hooks/weather/useOpenWeather";
import { useAirPollution } from "@/hooks/weather/useAirPollution";
import { checkHumidity, checkPM10, checkPM25, checkTemp, checkWind } from "@/utils/weather/walkingScores";
import totalWalkingScore from "@/utils/weather/totalWalkingScore";

export default function PlacesPage() {
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const [hoveredPlaceId, setHoveredPlaceId] = useState<string | null>(null);
  const [panToLocation, setPanToLocation] = useState<google.maps.LatLngLiteral | null>(null);

  const { currentLocation, error: locationError } = useCurrentLocation();
  const { data: weather, isLoading: isWeatherLoading } = useOpenWeather({ lat: currentLocation?.lat, lon: currentLocation?.lng });
  const { data: airPollution, isLoading: isAirPollutionLoading } = useAirPollution({ lat: currentLocation?.lat, lon: currentLocation?.lng });

  const { isGoodWeather, recommendedSearchQuery } = useMemo(() => {
    if (!weather || !airPollution) {
      return { isGoodWeather: true, recommendedSearchQuery: "" };
    }
    const tempScore = checkTemp(weather.main.temp - 273.15);
    const humidityScore = checkHumidity(weather.main.humidity);
    const windScore = checkWind(weather.wind.speed);
    const pm10Score = checkPM10(airPollution.list[0].components.pm10);
    const pm25Score = checkPM25(airPollution.list[0].components.pm2_5);
    const score = totalWalkingScore({ tempScore, humidityScore, windScore, pm10Score, pm25Score }).score;
    const goodWeather = score >= 60;
    const query = goodWeather ? "공원 산책로" : "애견 동반 카페";
    return { isGoodWeather: goodWeather, recommendedSearchQuery: query };
  }, [weather, airPollution]);

  // 이제 이 코드는 usePlaces 훅의 정의와 일치하므로 오류가 발생하지 않습니다.
  const { data: recommendedPlaces = [], isLoading: isPlacesLoading } = usePlaces({
    lat: currentLocation?.lat,
    lon: currentLocation?.lng,
    query: recommendedSearchQuery,
    enabled: !!currentLocation && !!recommendedSearchQuery,
  });

  const handlePlaceClick = (placeId: string) => setSelectedPlaceId(placeId);
  const handleCloseModal = () => setSelectedPlaceId(null);
  const handlePlaceMouseEnter = (place: Place) => {
    setHoveredPlaceId(place.id);
    setPanToLocation(place.geometry.location);
  };
  const handlePlaceMouseLeave = () => setHoveredPlaceId(null);

  if (locationError) return <div className="p-10 text-center">위치 정보를 가져올 수 없습니다.</div>;
  if (!currentLocation) return <div className="p-10 text-center">현재 위치를 파악하는 중입니다...</div>;

  const isLoading = isWeatherLoading || isAirPollutionLoading || isPlacesLoading;

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="text-center mb-10 mt-4">
        <h1 className="text-4xl font-bold">추천 장소 둘러보기</h1>
        <p className="text-gray-500 mt-2">현재 날씨에 딱 맞는 추천 장소를 확인해 보세요.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 bg-white rounded-2xl shadow-lg p-4">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 px-2">
            <FaMapMarkedAlt className="text-blue-500" /> 지도
          </h2>
          <div className="h-[70vh] rounded-xl overflow-hidden">
            {isLoading ? <div className="h-full w-full flex items-center justify-center bg-gray-100"><p>지도 로딩 중...</p></div> : (
              <RecommendPlaces
                center={currentLocation}
                places={recommendedPlaces}
                isGoodWeather={isGoodWeather}
                hoveredPlaceId={hoveredPlaceId}
                panTo={panToLocation}
                onPlaceClick={handlePlaceClick}
              />
            )}
          </div>
        </div>
        <div className="md:col-span-1 bg-white rounded-2xl shadow-lg p-4">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 px-2">
            <FaListUl className="text-green-500" /> 장소 목록
          </h2>
          <div className="h-[70vh] overflow-y-auto custom-scrollbar pr-2">
            {isLoading ? <div className="h-full w-full flex items-center justify-center"><p>장소 목록을 불러오는 중...</p></div> : (
              <PlaceList
                places={recommendedPlaces}
                isGoodWeather={isGoodWeather}
                onPlaceClick={handlePlaceClick}
                onPlaceMouseEnter={handlePlaceMouseEnter}
                onPlaceMouseLeave={handlePlaceMouseLeave}
              />
            )}
          </div>
        </div>
      </div>
      {selectedPlaceId && (
        <PlaceDetailModal
          placeId={selectedPlaceId}
          onClose={handleCloseModal}
          currentLocation={currentLocation}
        />
      )}
    </div>
  );
}
