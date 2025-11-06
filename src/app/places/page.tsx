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

// 추천 장소 페이지 컴포넌트
export default function PlacesPage() {
  // --- 상태 관리 ---
  // 사용자가 클릭한 장소의 ID (상세 정보 모달을 열기 위해 사용)
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  // 목록에서 마우스가 올라간 장소의 ID (지도에서 하이라이트하기 위해 사용)
  const [hoveredPlaceId, setHoveredPlaceId] = useState<string | null>(null);
  // 목록에 마우스를 올렸을 때 지도를 해당 위치로 이동시키기 위한 좌표
  const [panToLocation, setPanToLocation] = useState<google.maps.LatLngLiteral | null>(null);

  // --- 커스텀 훅을 이용한 데이터 Fetching ---
  // 사용자의 현재 위치를 가져오는 훅
  const { currentLocation, error: locationError } = useCurrentLocation();
  // 현재 위치 기반으로 날씨 정보를 가져오는 훅
  const { data: weather, isLoading: isWeatherLoading } = useOpenWeather({ lat: currentLocation?.lat, lon: currentLocation?.lng });
  // 현재 위치 기반으로 대기오염 정보를 가져오는 훅
  const { data: airPollution, isLoading: isAirPollutionLoading } = useAirPollution({ lat: currentLocation?.lat, lon: currentLocation?.lng });

  // --- useMemo를 이용한 날씨 기반 추천 로직 (성능 최적화) ---
  // 날씨 또는 대기오염 데이터가 변경될 때만 재계산됩니다.
  const { isGoodWeather, recommendedSearchQuery } = useMemo(() => {
    // 데이터가 아직 없으면 기본값을 반환합니다.
    if (!weather || !airPollution) {
      return { isGoodWeather: true, recommendedSearchQuery: "" };
    }
    // 각 날씨 요소를 점수화합니다.
    const tempScore = checkTemp(weather.main.temp - 273.15); // 켈빈을 섭씨로 변환
    const humidityScore = checkHumidity(weather.main.humidity);
    const windScore = checkWind(weather.wind.speed);
    const pm10Score = checkPM10(airPollution.list[0].components.pm10);
    const pm25Score = checkPM25(airPollution.list[0].components.pm2_5);
    // 종합 '산책 점수'를 계산합니다.
    const score = totalWalkingScore({ tempScore, humidityScore, windScore, pm10Score, pm25Score }).score;
    // 점수가 60점 이상이면 '좋은 날씨'로 판단합니다.
    const goodWeather = score >= 60;
    // 날씨 상태에 따라 추천 장소 검색어를 결정합니다.
    const query = goodWeather ? "공원 산책로" : "애견 동반 카페";
    return { isGoodWeather: goodWeather, recommendedSearchQuery: query };
  }, [weather, airPollution]);

  // --- 날씨 기반 추천 장소 데이터 Fetching ---
  // 위에서 결정된 검색어로 장소 목록을 가져오는 훅
  const { data: recommendedPlaces = [], isLoading: isPlacesLoading } = usePlaces({
    lat: currentLocation?.lat,
    lon: currentLocation?.lng,
    query: recommendedSearchQuery,
    // 현재 위치와 검색어가 모두 준비되었을 때만 API를 호출합니다.
    enabled: !!currentLocation && !!recommendedSearchQuery,
  });

  // --- 이벤트 핸들러 ---
  // 장소 클릭 시: 상세 정보 모달을 엽니다.
  const handlePlaceClick = (placeId: string) => setSelectedPlaceId(placeId);
  // 모달 닫기 시: 선택된 장소 ID를 초기화합니다.
  const handleCloseModal = () => setSelectedPlaceId(null);
  // 장소 목록에 마우스 진입 시: 호버 ID와 지도 이동 좌표를 설정합니다.
  const handlePlaceMouseEnter = (place: Place) => {
    setHoveredPlaceId(place.id);
    setPanToLocation(place.geometry.location);
  };
  // 장소 목록에서 마우스 이탈 시: 호버 ID를 초기화합니다.
  const handlePlaceMouseLeave = () => setHoveredPlaceId(null);

  // --- 로딩 및 에러 처리 ---
  if (locationError) return <div className="p-10 text-center">위치 정보를 가져올 수 없습니다.</div>;
  if (!currentLocation) return <div className="p-10 text-center">현재 위치를 파악하는 중입니다...</div>;

  // 모든 데이터 fetching이 완료되었는지 확인하는 플래그
  const isLoading = isWeatherLoading || isAirPollutionLoading || isPlacesLoading;

  // --- 렌더링 ---
  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* 페이지 헤더 */}
      <div className="text-center mb-10 mt-4">
        <h1 className="text-4xl font-bold">추천 장소 둘러보기</h1>
        <p className="text-gray-500 mt-2">현재 날씨에 딱 맞는 추천 장소를 확인해 보세요.</p>
      </div>
      {/* 메인 컨텐츠 (지도 + 목록) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* 왼쪽: 지도 영역 */}
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
        {/* 오른쪽: 장소 목록 영역 */}
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
      {/* 장소 상세 정보 모달 (선택된 장소가 있을 때만 렌더링) */}
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
