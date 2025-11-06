"use client";

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

import PlaceDetailModal from '@/components/places/PlaceDetailModal';
import SavedItemCard from '@/components/mypage/SavedItemCard';
import SavedPlacesMap from '@/components/mypage/SavedPlacesMap';

// 저장된 아이템의 데이터 구조를 정의합니다.
interface SavedItem {
  id: string; // 고유 ID
  content_type: 'place' | 'product' | 'youtube' | 'web'; // 콘텐츠 타입
  content_id: string; // 원본 콘텐츠 ID (예: 장소 ID, 상품 ID)
  content_data: any; // 원본 콘텐츠 데이터 (JSON)
}
// 위치 정보(위도, 경도)의 데이터 구조를 정의합니다.
interface Location {
  lat: number;
  lng: number;
}

// 콘텐츠 섹션을 렌더링하는 재사용 컴포넌트입니다.
// 아이템이 없을 경우 섹션 전체를 렌더링하지 않습니다.
const Section = ({ title, items, children }: { title: string, items: SavedItem[], children: React.ReactNode }) => {
  if (items.length === 0) return null;
  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold text-gray-800 border-b-2 pb-2 mb-6">{title}</h2>
      {children}
    </section>
  );
};


// 마이페이지 컴포넌트
export default function MyPage() {
  // 전역 AuthContext에서 사용자 정보와 인증 로딩 상태를 가져옵니다.
  const { user, isLoading: isAuthLoading } = useAuth();
  // Supabase 클라이언트 인스턴스를 생성합니다.
  const supabase = createClient();
  // 페이지 이동을 위한 Next.js 라우터 훅을 사용합니다.
  const router = useRouter();

  // --- 상태 관리 ---
  // 사용자가 저장한 모든 아이템 목록
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
  // 저장된 아이템을 불러오는 중인지 여부
  const [isItemsLoading, setIsItemsLoading] = useState(true);
  // 사용자가 클릭하여 상세 정보를 볼 장소의 ID
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  // 사용자의 현재 위치 정보 (위도, 경도)
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  // 사용자가 마우스를 올린 장소 카드의 ID (지도와 연동)
  const [hoveredPlaceId, setHoveredPlaceId] = useState<string | null>(null);
  // 저장된 장소 목록을 모두 보여줄지 여부
  const [showAllPlaces, setShowAllPlaces] = useState(false);
  // 처음에 보여줄 장소의 개수
  const INITIAL_PLACE_COUNT = 4;

  // --- useEffect 훅 ---
  // 컴포넌트가 마운트될 때 사용자의 현재 위치를 가져옵니다.
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        // 성공 시: 현재 위치로 상태 업데이트
        (position) => setCurrentLocation({ lat: position.coords.latitude, lng: position.coords.longitude }),
        // 실패 시: 기본 위치(서울 시청)로 설정
        () => setCurrentLocation({ lat: 37.5665, lng: 126.9780 })
      );
    } else {
      // Geolocation API를 지원하지 않는 경우 기본 위치로 설정
      setCurrentLocation({ lat: 37.5665, lng: 126.9780 });
    }
  }, []);

  useEffect(() => {
    // isAuthLoading이 true이면, 아직 인증 상태를 확인 중이므로 아무것도 하지 않고 반환합니다.
    if (isAuthLoading) {
      return;
    }

    // 로딩이 끝났는데도 user가 없다면, 그때 로그인 페이지로 리디렉션합니다.
    if (!user) {
      router.push('/login');
      return;
    }

    // 사용자가 있으면 저장된 아이템을 불러옵니다.
    if (user) {
      fetchSavedItems();
    }
    // 의존성 배열에 user와 isAuthLoading을 유지합니다.
  }, [user, isAuthLoading, router]);

  // --- 데이터 처리 함수 ---
  // Supabase에서 사용자가 저장한 아이템 목록을 가져오는 함수
  const fetchSavedItems = async () => {
    if (!user) return;
    setIsItemsLoading(true);
    const { data, error } = await supabase
      .from('user_saves') // 'user_saves' 테이블에서
      .select('*') // 모든 컬럼을
      .eq('user_id', user.id) // 현재 로그인된 사용자의 ID와 일치하는
      .order('created_at', { ascending: false }); // 최신순으로 정렬하여 가져옵니다.

    if (data) {
      // DB에 JSON 문자열로 저장된 content_data를 객체로 파싱합니다.
      const parsedData = data.map(item => {
        if (item.content_data && typeof item.content_data === 'string') {
          try {
            return { ...item, content_data: JSON.parse(item.content_data) };
          } catch (e) { return item; } // 파싱 실패 시 원본 데이터 반환
        }
        return item;
      });
      setSavedItems(parsedData);
    }
    setIsItemsLoading(false);
  };

  // 아이템을 삭제하는 함수
  const handleDeleteItem = async (itemId: string) => {
    // UI에서 먼저 아이템을 제거하여 즉각적인 피드백을 줍니다.
    setSavedItems(prevItems => prevItems.filter(item => item.id !== itemId));
    // Supabase DB에서 해당 아이템을 삭제합니다.
    const { error } = await supabase.from('user_saves').delete().eq('id', itemId);
    if (error) {
      // 삭제 실패 시 사용자에게 알리고, 목록을 다시 불러와 동기화합니다.
      alert("삭제에 실패했습니다.");
      fetchSavedItems();
    }
  };

  // 장소 카드를 클릭했을 때 상세 정보 모달을 열기 위한 함수
  const handleItemClick = (placeId: string) => setSelectedPlaceId(placeId);

  // --- useMemo 훅 (성능 최적화) ---
  // savedItems가 변경될 때만 각 카테고리별로 아이템을 필터링합니다.
  const places = useMemo(() => savedItems.filter(item => item.content_type === 'place'), [savedItems]);
  const products = useMemo(() => savedItems.filter(item => item.content_type === 'product'), [savedItems]);
  const youtubeVideos = useMemo(() => savedItems.filter(item => item.content_type === 'youtube'), [savedItems]);
  const webPages = useMemo(() => savedItems.filter(item => item.content_type === 'web'), [savedItems]);

  // '더보기' 상태에 따라 화면에 보여줄 장소 목록을 계산합니다.
  const visiblePlaces = useMemo(() => {
    return showAllPlaces ? places : places.slice(0, INITIAL_PLACE_COUNT);
  }, [places, showAllPlaces]);

  // --- 렌더링 ---
  // 인증 정보나 아이템 목록을 불러오는 중일 때 로딩 화면을 표시합니다.
  if (isAuthLoading || isItemsLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-xl font-semibold">로딩 중...</div>
      </div>
    );
  }

  // 아이템 목록을 그리드 형태로 렌더링하는 함수
  const renderItemGrid = (items: SavedItem[]) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {items.map(item => (
        <SavedItemCard
          key={item.id}
          item={item}
          onItemClick={() => {}} // 장소 외 다른 아이템은 클릭 이벤트 없음
          onDelete={handleDeleteItem}
        />
      ))}
    </div>
  );

  return (
    <>
      <div className="max-w-7xl mx-auto p-4 sm:p-6 md:p-8">
        {/* 페이지 헤더 */}
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">마이페이지</h1>
          <p className="text-lg text-gray-600">내가 저장한 모든 콘텐츠 목록입니다.</p>
        </header>

        {/* 저장된 아이템이 있을 경우 목록을 표시 */}
        {savedItems.length > 0 ? (
          <div>
            {/* 저장한 장소 섹션 */}
            <Section title="저장한 장소" items={places}>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-8 relative">
                {/* 왼쪽 지도 영역 (화면이 클 때 고정) */}
                <div className="md:col-span-2 md:sticky md:top-24 h-[400px] md:h-[calc(100vh-8rem)] rounded-lg overflow-hidden shadow-lg">
                  {currentLocation ? (
                    <SavedPlacesMap
                      places={places}
                      currentLocation={currentLocation}
                      onPlaceClick={handleItemClick} // 마커 클릭 시 모달 열기
                      hoveredPlaceId={hoveredPlaceId} // 호버된 카드에 해당하는 마커 하이라이트
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">위치 정보 로딩 중...</div>
                  )}
                </div>

                {/* 오른쪽 장소 카드 목록 영역 */}
                <div className="md:col-span-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {visiblePlaces.map(item => (
                      <SavedItemCard
                        key={item.id}
                        item={item}
                        onItemClick={handleItemClick}
                        onDelete={handleDeleteItem}
                        onMouseEnter={() => setHoveredPlaceId(item.content_id)}
                        onMouseLeave={() => setHoveredPlaceId(null)}
                      />
                    ))}
                  </div>

                  {/* 장소가 일정 개수 이상일 때 '더보기/접기' 버튼 표시 */}
                  {places.length > INITIAL_PLACE_COUNT && (
                    <div className="mt-8 text-center">
                      <button
                        onClick={() => setShowAllPlaces(!showAllPlaces)}
                        className="px-6 py-2 font-semibold text-blue-600 bg-white border-2 border-blue-500 rounded-full hover:bg-blue-50"
                      >
                        {showAllPlaces ? '접기' : `더보기 (${places.length - INITIAL_PLACE_COUNT}개)`}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </Section>

            {/* 다른 카테고리 섹션들 */}
            <Section title="저장한 상품" items={products}>{renderItemGrid(products)}</Section>
            <Section title="저장한 YouTube 영상" items={youtubeVideos}>{renderItemGrid(youtubeVideos)}</Section>
            <Section title="저장한 웹 페이지" items={webPages}>{renderItemGrid(webPages)}</Section>
          </div>
        ) : (
          // 저장된 아이템이 없을 경우 표시할 메시지
          <div className="text-center py-16 border-2 border-dashed rounded-lg">
            <p className="text-gray-500 text-lg">저장한 항목이 없습니다.</p>
          </div>
        )}
      </div>

      {/* selectedPlaceId가 있을 때만 장소 상세 정보 모달을 렌더링 */}
      {selectedPlaceId && (
        <PlaceDetailModal
          placeId={selectedPlaceId}
          onClose={() => setSelectedPlaceId(null)} // 모달 닫기
          currentLocation={currentLocation}
        />
      )}
    </>
  );
}
