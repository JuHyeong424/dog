"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { createClient } from '@/lib/supabase/client';
import { FaBookmark, FaRegBookmark } from 'react-icons/fa';
import { CgSpinner } from 'react-icons/cg';
import { useRouter } from 'next/navigation';

// SaveButton 컴포넌트가 받을 props의 타입을 정의합니다.
interface SaveButtonProps {
  contentType: 'product' | 'youtube' | 'web' | 'place'; // 저장할 콘텐츠의 종류
  contentId: string; // 저장할 콘텐츠의 고유 ID
  contentData: object; // 저장할 콘텐츠의 메타데이터 (제목, 이미지 등)
}

// 콘텐츠를 저장하거나 저장 취소하는 버튼 컴포넌트
export default function SaveButton({ contentType, contentId, contentData }: SaveButtonProps) {
  // --- 훅 및 클라이언트 초기화 ---
  // 전역 AuthContext에서 현재 로그인된 사용자 정보를 가져옵니다.
  const { user } = useAuth();
  // Supabase 클라이언트 인스턴스를 생성합니다.
  const supabase = createClient();
  // 페이지 이동을 위한 Next.js 라우터 훅을 사용합니다.
  const router = useRouter();

  // --- 상태 관리 ---
  // 현재 콘텐츠가 저장되었는지 여부
  const [isSaved, setIsSaved] = useState(false);
  // 데이터를 확인하거나 변경하는 중인지 여부 (로딩 상태)
  const [isLoading, setIsLoading] = useState(true);

  // --- useEffect 훅 ---
  // 컴포넌트가 렌더링되거나 사용자, 콘텐츠 정보가 변경될 때 저장 여부를 확인합니다.
  useEffect(() => {
    setIsLoading(true);
    const checkIfSaved = async () => {
      // 사용자가 로그인하지 않았으면 확인을 중단합니다.
      if (!user) {
        setIsLoading(false);
        return;
      }
      // Supabase DB에서 현재 사용자가 이 콘텐츠를 저장했는지 조회합니다.
      const { data } = await supabase
        .from('user_saves') // 'user_saves' 테이블에서
        .select('id') // id 컬럼만 선택하여
        .eq('user_id', user.id) // 현재 사용자의 id와
        .eq('content_id', contentId) // 현재 콘텐츠의 id와
        .eq('content_type', contentType) // 현재 콘텐츠의 타입이 일치하는 데이터를
        .maybeSingle(); // 최대 1개의 결과만 가져옵니다.

      // 조회된 데이터가 있으면 isSaved를 true로, 없으면 false로 설정합니다.
      setIsSaved(!!data);
      setIsLoading(false);
    };
    checkIfSaved();
  }, [user, contentId, contentType, supabase]); // 의존성 배열: 이 값들이 변경될 때만 함수를 다시 실행합니다.

  // --- 이벤트 핸들러 ---
  // 저장 버튼 클릭 시 실행되는 함수
  const handleSaveClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault(); // 부모 요소(예: <a> 태그)의 기본 동작(페이지 이동 등)을 막습니다.
    e.stopPropagation(); // 이벤트가 상위 요소로 전파되는 것(이벤트 버블링)을 막습니다.

    // 로그인이 되어있지 않으면 알림을 띄우고 로그인 페이지로 이동시킵니다.
    if (!user) {
      alert('로그인이 필요합니다.');
      router.push('/login');
      return;
    }

    setIsLoading(true);

    if (isSaved) {
      // 이미 저장된 상태라면, '저장 취소'(DELETE) 로직을 실행합니다.
      const { error } = await supabase
        .from('user_saves')
        .delete()
        .eq('user_id', user.id)
        .eq('content_id', contentId);
      // 에러가 없었다면, UI 상태를 '저장 안 됨'으로 변경합니다.
      if (!error) setIsSaved(false);
    } else {
      // 저장되지 않은 상태라면, '새로 저장'(INSERT) 로직을 실행합니다.
      const { error } = await supabase
        .from('user_saves')
        .insert({
          user_id: user.id,
          content_type: contentType,
          content_id: contentId,
          content_data: contentData,
        });
      // 에러가 없었다면, UI 상태를 '저장됨'으로 변경합니다.
      if (!error) setIsSaved(true);
    }
    setIsLoading(false);
  };

  // --- 렌더링 ---
  return (
    <button
      onClick={handleSaveClick}
      disabled={isLoading} // 로딩 중에는 버튼 비활성화
      // 버튼 스타일링: 카드 오른쪽 상단에 절대 위치로 고정
      className="absolute top-2 right-2 z-10 p-2 bg-black bg-opacity-50 rounded-full text-white hover:bg-opacity-75 transition-all disabled:opacity-50"
      aria-label={isSaved ? '저장 취소' : '저장하기'} // 웹 접근성을 위한 라벨
    >
      {isLoading ? (
        // 로딩 중일 때: 스피너 아이콘 표시
        <CgSpinner className="animate-spin" size={18} />
      ) : isSaved ? (
        // 저장된 상태일 때: 채워진 북마크 아이콘 표시
        <FaBookmark size={18} color="#3b82f6" />
      ) : (
        // 저장되지 않은 상태일 때: 빈 북마크 아이콘 표시
        <FaRegBookmark size={18} />
      )}
    </button>
  );
}
