"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePlaceDetails } from '@/hooks/places/usePlaceDetails';
import { useAuth } from '@/context/AuthContext';
import { createClient } from '@/lib/supabase/client';
import { FaTimes, FaStar, FaBookmark, FaRegBookmark } from 'react-icons/fa';
import { CgSpinner } from 'react-icons/cg';

// 네이버 지도 아이콘을 표시하는 SVG 컴포넌트
const NaverMapIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 11.1v2.4l5.4 3.6V6.9L4 11.1zm10.6-4.2v10.2l5.4-3.6V6.9L14.6 6.9z" fill="#FFFFFF"/>
  </svg>
);

// 네이버 지도에서 사용하는 좌표계(Web Mercator)로 변환하는 함수
// Google의 WGS84 좌표계를 네이버 지도 URL에 맞게 변환하기 위해 필요합니다.
const convertWGS84ToWebMercator = (lat: number, lng: number) => {
  const x = lng * 20037508.34 / 180;
  let y = Math.log(Math.tan((90 + lat) * Math.PI / 360)) / (Math.PI / 180);
  y = y * 20037508.34 / 180;
  return { x, y };
};

// PlaceDetailModal 컴포넌트가 받을 props의 타입을 정의합니다.
interface PlaceDetailModalProps {
  placeId: string; // 상세 정보를 조회할 장소의 ID
  onClose: () => void; // 모달을 닫을 때 호출될 함수
  currentLocation: { lat: number; lng: number; } | null; // 길찾기를 위한 현재 위치
}

// 장소의 상세 정보를 보여주는 모달 컴포넌트
export default function PlaceDetailModal({ placeId, onClose, currentLocation }: PlaceDetailModalProps) {
  // --- 훅 및 클라이언트 초기화 ---
  // placeId를 사용하여 Google Place Details API로부터 장소의 상세 정보를 가져오는 커스텀 훅
  const { data: place, isLoading, isError } = usePlaceDetails(placeId);
  // 전역 컨텍스트에서 사용자 인증 정보를 가져옵니다.
  const { user } = useAuth();
  // Supabase 클라이언트 인스턴스를 생성합니다.
  const supabase = createClient();
  // 페이지 이동을 위한 Next.js 라우터 훅을 사용합니다.
  const router = useRouter();

  // --- 상태 관리 ---
  // 현재 장소가 저장되었는지 여부
  const [isSaved, setIsSaved] = useState(false);
  // 저장 여부를 DB에서 확인하는 동안의 로딩 상태
  const [isCheckingSave, setIsCheckingSave] = useState(true);
  // 저장 또는 취소 요청을 보내는 동안의 로딩 상태
  const [isSaving, setIsSaving] = useState(false);

  // --- useEffect 훅 ---
  // 컴포넌트가 마운트되거나 placeId가 변경될 때마다 해당 장소의 저장 여부를 확인합니다.
  useEffect(() => {
    setIsSaved(false);
    setIsCheckingSave(true); // 확인 시작

    const checkIfSaved = async () => {
      // 사용자나 placeId가 없으면 확인을 중단합니다.
      if (!user || !placeId) {
        setIsCheckingSave(false);
        return;
      }
      // Supabase DB에서 현재 사용자가 이 장소를 저장했는지 조회합니다.
      const { data } = await supabase
        .from('user_saves')
        .select('id')
        .eq('user_id', user.id)
        .eq('content_type', 'place')
        .eq('content_id', placeId)
        .maybeSingle(); // 최대 1개의 결과만 가져옵니다.

      if (data) setIsSaved(true); // 데이터가 있으면 저장된 상태로 설정
      setIsCheckingSave(false); // 확인 완료
    };
    checkIfSaved();
  }, [user, placeId, supabase]);

  // --- 유틸리티 및 이벤트 핸들러 ---
  // Google Places API 사진 참조 ID로 실제 이미지 URL을 생성하는 함수
  const getPhotoUrl = (photoReference: string) => {
    return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photoReference}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`;
  };

  // '네이버 지도로 길찾기' 버튼 클릭 시 실행되는 함수
  const handleNaverDirectionsClick = () => {
    if (!currentLocation || !place?.geometry?.location) {
      alert("위치 정보가 없어 길찾기를 시작할 수 없습니다.");
      return;
    }
    // 출발지와 도착지 좌표를 Web Mercator 좌표계로 변환합니다.
    const startConverted = convertWGS84ToWebMercator(currentLocation.lat, currentLocation.lng);
    const goalConverted = convertWGS84ToWebMercator(place.geometry.location.lat, place.geometry.location.lng);

    // 네이버 지도 길찾기 URL을 생성하여 새 탭에서 엽니다.
    const startCoords = `${startConverted.x},${startConverted.y}`;
    const goalCoords = `${goalConverted.x},${goalConverted.y}`;
    const startName = encodeURIComponent('현재 위치');
    const goalName = encodeURIComponent(place.name);
    const naverMapsUrl = `https://map.naver.com/p/directions/${startCoords},${startName}/${goalCoords},${goalName}/-/transit`;
    window.open(naverMapsUrl, '_blank');
  };

  // '저장하기'/'저장됨' 버튼 클릭 시 실행되는 함수
  const handleSaveClick = async () => {
    if (!place || isSaving) return;
    if (!user) {
      alert('로그인이 필요합니다.');
      router.push('/login');
      return;
    }
    setIsSaving(true);

    if (isSaved) {
      // 저장 취소 로직 (DELETE)
      const { error } = await supabase.from('user_saves').delete().match({ user_id: user.id, content_id: placeId });
      if (!error) setIsSaved(false);
    } else {
      // 새로 저장하는 로직 (INSERT)
      const { error } = await supabase.from('user_saves').insert({
        user_id: user.id,
        content_type: 'place',
        content_id: placeId,
        content_data: {
          name: place.name,
          vicinity: place.vicinity,
          photo_reference: place?.photos?.[0]?.photo_reference,
          geometry: place.geometry,
        }
      });
      if (!error) setIsSaved(true);
    }
    setIsSaving(false);
  };

  // --- 렌더링 ---
  return (
    // 모달 배경 (클릭 시 모달이 닫힘)
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50" onClick={onClose}>
      {/* 모달 컨텐츠 (클릭 이벤트가 배경으로 전파되는 것을 막음) */}
      <div className="bg-white rounded-lg shadow-xl w-11/12 max-w-lg p-6 relative" onClick={(e) => e.stopPropagation()}>
        {/* 닫기 버튼 */}
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 z-10">
          <FaTimes size={24} />
        </button>

        {/* 로딩 및 에러 상태 표시 */}
        {isLoading && <p className="text-center">상세 정보를 불러오는 중...</p>}
        {isError && <p className="text-center text-red-500">상세 정보를 불러오지 못했습니다.</p>}

        {/* 장소 정보가 성공적으로 로드되었을 때 표시될 내용 */}
        {place && (
          <div>
            {place.photos && (
              <img
                src={getPhotoUrl(place.photos[0].photo_reference)}
                alt={place.name}
                className="w-full h-48 object-cover rounded-md mb-4 bg-gray-200"
              />
            )}
            <h2 className="text-3xl font-bold mb-2">{place.name}</h2>
            <div className="flex items-center mb-4">
              <span className="text-yellow-500 flex items-center mr-2">
                <FaStar />
                <span className="ml-1 font-bold">{place.rating || 'N/A'}</span>
              </span>
              <span className="text-gray-600">{place.reviews?.length || 0}개의 리뷰</span>
            </div>
            <p className="text-gray-700 mb-2">{place.vicinity}</p>
            <p className="text-blue-600 font-semibold mb-4">{place.formatted_phone_number || '전화번호 정보 없음'}</p>

            {/* 영업 시간 정보가 있을 경우 표시 */}
            {place.opening_hours && (
              <div className="mt-4 pt-4 border-t">
                <h3 className="font-bold mb-2">영업 시간</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  {place.opening_hours.weekday_text.map((line, index) => (
                    <li key={index}>{line}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* 길찾기 및 저장하기 버튼 */}
            <div className="mt-6 pt-4 border-t flex flex-col sm:flex-row justify-center items-center gap-4">
              <button
                onClick={handleNaverDirectionsClick}
                className="flex items-center justify-center gap-2 w-full max-w-xs px-5 py-3 text-white bg-[#00C73C] rounded-full font-bold hover:opacity-90 transition-opacity"
              >
                <NaverMapIcon />
                네이버 지도로 길찾기
              </button>

              <button
                onClick={handleSaveClick}
                disabled={isCheckingSave || isSaving}
                className={`flex items-center justify-center gap-2 w-full max-w-xs px-5 py-3 rounded-full font-bold transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed
                  ${isSaved
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
                }`}
              >
                {isSaving ? (
                  <CgSpinner className="animate-spin" />
                ) : isSaved ? (
                  <FaBookmark />
                ) : (
                  <FaRegBookmark />
                )}
                {isSaving ? '처리 중...' : isSaved ? '저장됨' : '저장하기'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
