"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { createClient } from '@/lib/supabase/client';
import { FaBookmark, FaRegBookmark } from 'react-icons/fa';
import { CgSpinner } from 'react-icons/cg';
import { useRouter } from 'next/navigation';

interface SaveButtonProps {
  contentType: 'product' | 'youtube' | 'web' | 'place';
  contentId: string;
  contentData: object; // 저장할 메타데이터
}

export default function SaveButton({ contentType, contentId, contentData }: SaveButtonProps) {
  const { user } = useAuth();
  const supabase = createClient();
  const router = useRouter();

  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 컴포넌트 마운트 시 저장 여부 확인
  useEffect(() => {
    setIsLoading(true);
    const checkIfSaved = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }
      const { data } = await supabase
        .from('user_saves')
        .select('id')
        .eq('user_id', user.id)
        .eq('content_id', contentId)
        .eq('content_type', contentType)
        .maybeSingle();

      setIsSaved(!!data);
      setIsLoading(false);
    };
    checkIfSaved();
  }, [user, contentId, contentType, supabase]);

  const handleSaveClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault(); // 부모 요소(링크)의 클릭 이벤트를 막음
    e.stopPropagation(); // 이벤트 버블링을 막음

    if (!user) {
      alert('로그인이 필요합니다.');
      router.push('/login');
      return;
    }

    setIsLoading(true);

    if (isSaved) {
      // 저장 취소
      const { error } = await supabase
        .from('user_saves')
        .delete()
        .eq('user_id', user.id)
        .eq('content_id', contentId);
      if (!error) setIsSaved(false);
    } else {
      // 새로 저장
      const { error } = await supabase
        .from('user_saves')
        .insert({
          user_id: user.id,
          content_type: contentType,
          content_id: contentId,
          content_data: contentData,
        });
      if (!error) setIsSaved(true);
    }
    setIsLoading(false);
  };

  return (
    <button
      onClick={handleSaveClick}
      disabled={isLoading}
      className="absolute top-2 right-2 z-10 p-2 bg-black bg-opacity-50 rounded-full text-white hover:bg-opacity-75 transition-all disabled:opacity-50"
      aria-label={isSaved ? '저장 취소' : '저장하기'}
    >
      {isLoading ? (
        <CgSpinner className="animate-spin" size={18} />
      ) : isSaved ? (
        <FaBookmark size={18} color="#3b82f6" />
      ) : (
        <FaRegBookmark size={18} />
      )}
    </button>
  );
}
