"use client";

import CurrentWeatherComponent from "@/components/weather/currentWeather/CurrentWeatherComponent";
import RecommendedPlaces from "@/components/places/RecommendedPlaces";
import PlaceDetailModal from "@/components/places/PlaceDetailModal";
import PlacesMap from "@/components/places/PlaceMap";
import Categories, { Category } from "@/components/places/Categories";
import useCurrentLocation from "@/hooks/useCurrentLocation";
import { useOpenWeather } from "@/hooks/weather/useOpenWeather";
import { useAirPollution } from "@/hooks/weather/useAirPollution";
import useCurrentDate from "@/hooks/useCurrentDate";
import { usePlaces } from "@/hooks/places/usePlaces";
import { useMemo, useState } from "react";
import { checkHumidity, checkPM10, checkPM25, checkTemp, checkWind } from "@/utils/weather/walkingScores";
import totalWalkingScore from "@/utils/weather/totalWalkingScore";
import { FaCoffee, FaHospital, FaShoppingBag, FaTree } from 'react-icons/fa';

const CATEGORIES: Category[] = [
  { label: '공원/산책로', query: '공원 산책로', color: '#34a853', icon: <FaTree /> },
  { label: '애견 동반 카페', query: '애견 동반 카페', color: '#1a73e8', icon: <FaCoffee /> },
  { label: '동물병원', query: '동물병원', color: '#fbbc05', icon: <FaHospital /> },
  { label: '애견 용품점', query: '애견 용품점', color: '#ea4335', icon: <FaShoppingBag /> },
];

export default function Home() {
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>(CATEGORIES[0].query);

  const { currentLocation, error: locationError } = useCurrentLocation();
  const koreaTime = useCurrentDate();
  const { data: weather, isLoading: isWeatherLoading } = useOpenWeather({ lat: currentLocation?.lat, lon: currentLocation?.lng });
  const { data: airPollution, isLoading: isAirPollutionLoading } = useAirPollution({ lat: currentLocation?.lat, lon: currentLocation?.lng });
  const { data: parkPlaces = [], isLoading: isParkLoading } = usePlaces({ lat: currentLocation?.lat, lon: currentLocation?.lng, query: '공원 산책로' });
  const { data: cafePlaces = [], isLoading: isCafeLoading } = usePlaces({ lat: currentLocation?.lat, lon: currentLocation?.lng, query: '애견 동반 카페' });
  const { data: hospitalPlaces = [], isLoading: isHospitalLoading } = usePlaces({ lat: currentLocation?.lat, lon: currentLocation?.lng, query: '동물병원' });
  const { data: storePlaces = [], isLoading: isStoreLoading } = usePlaces({ lat: currentLocation?.lat, lon: currentLocation?.lng, query: '애견 용품점' });
  const isPlacesLoading = isParkLoading || isCafeLoading || isHospitalLoading || isStoreLoading;

  const { placesToShow, colorToShow } = useMemo(() => {
    switch (selectedCategory) {
      case '공원 산책로': return { placesToShow: parkPlaces, colorToShow: '#34a853' };
      case '애견 동반 카페': return { placesToShow: cafePlaces, colorToShow: '#1a73e8' };
      case '동물병원': return { placesToShow: hospitalPlaces, colorToShow: '#fbbc05' };
      case '애견 용품점': return { placesToShow: storePlaces, colorToShow: '#7d35ea' };
      default: return { placesToShow: [], colorToShow: '#808080' };
    }
  }, [selectedCategory, parkPlaces, cafePlaces, hospitalPlaces, storePlaces]);

  const { isGoodWeather } = useMemo(() => {
    if (!weather || !airPollution) return { isGoodWeather: true };
    const tempScore = checkTemp(weather.main.temp - 273.15);
    const humidityScore = checkHumidity(weather.main.humidity);
    const windScore = checkWind(weather.wind.speed);
    const pm10Score = checkPM10(airPollution.list[0].components.pm10);
    const pm25Score = checkPM25(airPollution.list[0].components.pm2_5);
    const score = totalWalkingScore({ tempScore, humidityScore, windScore, pm10Score, pm25Score }).score;
    return { isGoodWeather: score >= 60 };
  }, [weather, airPollution]);

  const recommendedPlaces = isGoodWeather ? parkPlaces : cafePlaces;
  const isRecPlacesLoading = isGoodWeather ? isParkLoading : isCafeLoading;

  const handlePlaceClick = (placeId: string) => setSelectedPlaceId(placeId);
  const handleCloseModal = () => setSelectedPlaceId(null);
  const handleCategorySelect = (query: string) => setSelectedCategory(query);

  if (locationError) return <div className="p-10 text-center">위치 정보를 가져올 수 없습니다.</div>;
  if (!currentLocation) return <div className="p-10 text-center">현재 위치를 파악하는 중입니다...</div>;

  return (
    <div className="bg-gray-100 flex flex-col items-center gap-10 w-full min-h-screen">
      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 flex-grow">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold">날씨 기반 산책 적합도</h1>
          <p className="text-gray-500 mt-2">실시간 기상 정보를 바탕으로 최적 산책 시간을 확인하세요</p>
        </div>
        <section className="grid grid-cols-1 lg:grid-cols-10 gap-8 items-start">
          <div className="lg:col-span-5">
            {(isWeatherLoading || isAirPollutionLoading) ? <div className="bg-white rounded-xl shadow-md h-full flex items-center justify-center p-6"><p>날씨 로딩 중...</p></div> : weather && airPollution && (
              <CurrentWeatherComponent
                weather={weather}
                airPollution={airPollution}
                koreaTime={koreaTime}
                currentLocation={currentLocation} isWeatherLoading={isWeatherLoading} isWeatherError={false} isAirPollutionLoading={isAirPollutionLoading} isAirPollutionError={false}
              />
            )}
          </div>
          <div className="lg:col-span-5">
            {isRecPlacesLoading ? (
              <div className="bg-white rounded-xl shadow-md h-full flex items-center justify-center p-6"><p>추천 장소 로딩 중...</p></div>
            ) : (
              <RecommendedPlaces
                places={recommendedPlaces}
                isGoodWeather={isGoodWeather}
                onPlaceClick={handlePlaceClick}
                limit={3}
              />
            )}
          </div>
        </section>

        <section className="w-full mt-16">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold">주변 장소 지도</h1>
            <p className="text-gray-500 mt-2">찾고 싶은 장소의 카테고리를 선택해 주세요</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4">
            <Categories
              categories={CATEGORIES}
              selectedCategory={selectedCategory}
              onSelectCategory={handleCategorySelect}
            />
            <div className="relative p-4">
              {isPlacesLoading ? (
                <div className="h-[600px] flex justify-center items-center">지도 데이터를 불러오는 중...</div>
              ) : (
                <PlacesMap
                  center={currentLocation}
                  places={placesToShow}
                  color={colorToShow}
                  onPlaceClick={handlePlaceClick}
                />
              )}
            </div>
          </div>
        </section>
      </main>

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
