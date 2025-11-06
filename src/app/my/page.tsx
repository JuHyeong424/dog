"use client";

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

import PlaceDetailModal from '@/components/places/PlaceDetailModal';
import SavedItemCard from '@/components/mypage/SavedItemCard';
import SavedPlacesMap from '@/components/mypage/SavedPlacesMap';

interface SavedItem {
  id: string;
  content_type: 'place' | 'product' | 'youtube' | 'web';
  content_id: string;
  content_data: any;
}
interface Location {
  lat: number;
  lng: number;
}
const Section = ({ title, items, children }: { title: string, items: SavedItem[], children: React.ReactNode }) => {
  if (items.length === 0) return null;
  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold text-gray-800 border-b-2 pb-2 mb-6">{title}</h2>
      {children}
    </section>
  );
};


export default function MyPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const supabase = createClient();
  const router = useRouter();

  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
  const [isItemsLoading, setIsItemsLoading] = useState(true);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [hoveredPlaceId, setHoveredPlaceId] = useState<string | null>(null);
  const [showAllPlaces, setShowAllPlaces] = useState(false);
  const INITIAL_PLACE_COUNT = 4;

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => setCurrentLocation({ lat: position.coords.latitude, lng: position.coords.longitude }),
        () => setCurrentLocation({ lat: 37.5665, lng: 126.9780 })
      );
    } else {
      setCurrentLocation({ lat: 37.5665, lng: 126.9780 });
    }
  }, []);

  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.push('/login');
      return;
    }
    if (user) {
      fetchSavedItems();
    }
  }, [user, isAuthLoading, router]);

  const fetchSavedItems = async () => {
    if (!user) return;
    setIsItemsLoading(true);
    const { data, error } = await supabase
      .from('user_saves')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (data) {
      const parsedData = data.map(item => {
        if (item.content_data && typeof item.content_data === 'string') {
          try {
            return { ...item, content_data: JSON.parse(item.content_data) };
          } catch (e) { return item; }
        }
        return item;
      });
      setSavedItems(parsedData);
    }
    setIsItemsLoading(false);
  };

  const handleDeleteItem = async (itemId: string) => {
    setSavedItems(prevItems => prevItems.filter(item => item.id !== itemId));
    const { error } = await supabase.from('user_saves').delete().eq('id', itemId);
    if (error) {
      alert("삭제에 실패했습니다.");
      fetchSavedItems();
    }
  };

  const handleItemClick = (placeId: string) => setSelectedPlaceId(placeId);

  const places = useMemo(() => savedItems.filter(item => item.content_type === 'place'), [savedItems]);
  const products = useMemo(() => savedItems.filter(item => item.content_type === 'product'), [savedItems]);
  const youtubeVideos = useMemo(() => savedItems.filter(item => item.content_type === 'youtube'), [savedItems]);
  const webPages = useMemo(() => savedItems.filter(item => item.content_type === 'web'), [savedItems]);

  const visiblePlaces = useMemo(() => {
    return showAllPlaces ? places : places.slice(0, INITIAL_PLACE_COUNT);
  }, [places, showAllPlaces]);

  if (isAuthLoading || isItemsLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-xl font-semibold">로딩 중...</div>
      </div>
    );
  }

  const renderItemGrid = (items: SavedItem[]) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {items.map(item => (
        <SavedItemCard
          key={item.id}
          item={item}
          onItemClick={() => {}}
          onDelete={handleDeleteItem}
        />
      ))}
    </div>
  );

  return (
    <>
      <div className="max-w-7xl mx-auto p-4 sm:p-6 md:p-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">마이페이지</h1>
          <p className="text-lg text-gray-600">내가 저장한 모든 콘텐츠 목록입니다.</p>
        </header>

        {savedItems.length > 0 ? (
          <div>
            <Section title="저장한 장소" items={places}>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-8 relative">

                {/* 1. 왼쪽 지도 영역 (md 화면 이상에서 2/5 차지) */}
                <div className="md:col-span-2 md:sticky md:top-24 h-[400px] md:h-[calc(100vh-8rem)] rounded-lg overflow-hidden shadow-lg">
                  {currentLocation ? (
                    <SavedPlacesMap
                      places={places}
                      currentLocation={currentLocation}
                      onPlaceClick={handleItemClick}
                      hoveredPlaceId={hoveredPlaceId}
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">위치 정보 로딩 중...</div>
                  )}
                </div>

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

            <Section title="저장한 상품" items={products}>{renderItemGrid(products)}</Section>
            <Section title="저장한 YouTube 영상" items={youtubeVideos}>{renderItemGrid(youtubeVideos)}</Section>
            <Section title="저장한 웹 페이지" items={webPages}>{renderItemGrid(webPages)}</Section>
          </div>
        ) : (
          <div className="text-center py-16 border-2 border-dashed rounded-lg">
            <p className="text-gray-500 text-lg">저장한 항목이 없습니다.</p>
          </div>
        )}
      </div>

      {selectedPlaceId && (
        <PlaceDetailModal
          placeId={selectedPlaceId}
          onClose={() => setSelectedPlaceId(null)}
          currentLocation={currentLocation}
        />
      )}
    </>
  );
}
