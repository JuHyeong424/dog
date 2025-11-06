// src/components/PlaceDetailModal.tsx (수정된 전체 파일)

"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePlaceDetails } from '@/hooks/places/usePlaceDetails';
import { useAuth } from '@/context/AuthContext';
import { createClient } from '@/lib/supabase/client';
import { FaTimes, FaStar, FaBookmark, FaRegBookmark } from 'react-icons/fa';
import { CgSpinner } from 'react-icons/cg'; // 로딩 아이콘 추가

// 네이버 지도 아이콘 SVG
const NaverMapIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 11.1v2.4l5.4 3.6V6.9L4 11.1zm10.6-4.2v10.2l5.4-3.6V6.9L14.6 6.9z" fill="#FFFFFF"/>
  </svg>
);

// WGS84 -> Web Mercator 좌표 변환 함수
const convertWGS84ToWebMercator = (lat: number, lng: number) => {
  const x = lng * 20037508.34 / 180;
  let y = Math.log(Math.tan((90 + lat) * Math.PI / 360)) / (Math.PI / 180);
  y = y * 20037508.34 / 180;
  return { x, y };
};

interface PlaceDetailModalProps {
  placeId: string;
  onClose: () => void;
  currentLocation: { lat: number; lng: number; } | null;
}

export default function PlaceDetailModal({ placeId, onClose, currentLocation }: PlaceDetailModalProps) {
  const { data: place, isLoading, isError } = usePlaceDetails(placeId);

  const { user } = useAuth();
  const supabase = createClient();
  const router = useRouter();
  const [isSaved, setIsSaved] = useState(false);
  const [isCheckingSave, setIsCheckingSave] = useState(true); // [추가] 저장 여부 확인 중 로딩 상태
  const [isSaving, setIsSaving] = useState(false); // [추가] 저장/취소 API 요청 중 로딩 상태

  useEffect(() => {
    setIsSaved(false);
    setIsCheckingSave(true); // 확인 시작

    const checkIfSaved = async () => {
      if (!user || !placeId) {
        setIsCheckingSave(false);
        return;
      }

      const { data } = await supabase
        .from('user_saves')
        .select('id')
        .eq('user_id', user.id)
        .eq('content_type', 'place')
        .eq('content_id', placeId)
        .maybeSingle();

      if (data) {
        setIsSaved(true);
      }
      setIsCheckingSave(false); // 확인 완료
    };

    checkIfSaved();
  }, [user, placeId, supabase]);

  const getPhotoUrl = (photoReference: string) => {
    return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photoReference}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`;
  };

  const handleNaverDirectionsClick = () => {
    if (!currentLocation || !place?.geometry?.location) {
      alert("위치 정보가 없어 길찾기를 시작할 수 없습니다.");
      return;
    }

    const startConverted = convertWGS84ToWebMercator(currentLocation.lat, currentLocation.lng);
    const goalConverted = convertWGS84ToWebMercator(place.geometry.location.lat, place.geometry.location.lng);

    const startCoords = `${startConverted.x},${startConverted.y}`;
    const goalCoords = `${goalConverted.x},${goalConverted.y}`;
    const startName = encodeURIComponent('현재 위치');
    const goalName = encodeURIComponent(place.name);

    const naverMapsUrl = `https://map.naver.com/p/directions/${startCoords},${startName}/${goalCoords},${goalName}/-/transit`;
    window.open(naverMapsUrl, '_blank');
  };

  const handleSaveClick = async () => {
    if (!place || isSaving) return;
    if (!user) {
      alert('로그인이 필요합니다.');
      router.push('/login');
      return;
    }
    setIsSaving(true);

    if (isSaved) {
      // 저장 취소 로직
      const { error } = await supabase.from('user_saves').delete().match({ user_id: user.id, content_id: placeId });
      if (!error) setIsSaved(false);
    } else {
      // 새로 저장하는 로직
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-11/12 max-w-lg p-6 relative" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 z-10">
          <FaTimes size={24} />
        </button>

        {isLoading && <p className="text-center">상세 정보를 불러오는 중...</p>}
        {isError && <p className="text-center text-red-500">상세 정보를 불러오지 못했습니다.</p>}
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
                disabled={isCheckingSave || isSaving} // [수정] 저장 여부 확인 중이거나, 저장/취소 API 요청 중일 때 버튼 비활성화
                className={`flex items-center justify-center gap-2 w-full max-w-xs px-5 py-3 rounded-full font-bold transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed
                  ${isSaved
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
                }`}
              >
                {/* [수정] 로딩 상태에 따라 아이콘과 텍스트 변경 */}
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
