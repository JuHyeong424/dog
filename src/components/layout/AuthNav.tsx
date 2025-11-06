"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/lib/supabase/client";
import { FaUserCircle, FaSignInAlt, FaSignOutAlt } from "react-icons/fa";

// 인증 상태(로그인/비로그인)에 따라 다른 네비게이션 UI를 보여주는 컴포넌트
export default function AuthNav() {
  // 전역 AuthContext에서 현재 사용자 정보를 가져옵니다. user 객체가 있으면 로그인 상태입니다.
  const { user } = useAuth();
  // Supabase 클라이언트 인스턴스를 생성합니다.
  const supabase = createClient();
  // 페이지 이동 및 새로고침을 위한 Next.js 라우터 훅을 사용합니다.
  const router = useRouter();

  // 로그아웃 버튼 클릭 시 실행되는 비동기 함수
  const handleLogout = async () => {
    // Supabase의 로그아웃 기능을 호출합니다.
    await supabase.auth.signOut();
    // 페이지를 새로고침하여 서버의 인증 상태를 UI에 즉시 반영합니다.
    router.refresh();
  };

  return (
    // 네비게이션 메뉴의 전체 컨테이너
    <nav className="flex items-center gap-3 sm:gap-4 font-semibold">
      {user ? (
        // --- 1. 사용자가 로그인한 경우 ---
        <>
          {/* 마이페이지로 이동하는 링크 */}
          <Link href="/my" className="text-gray-600 hover:text-blue-600 transition-colors">
            {/* sm(small) 사이즈보다 작은 화면에서는 유저 아이콘만 표시 */}
            <FaUserCircle size={24} className="block sm:hidden" />
            {/* sm 사이즈 이상 화면에서는 '마이페이지' 텍스트를 표시 */}
            <span className="hidden sm:block">마이페이지</span>
          </Link>

          {/* 로그아웃 버튼 */}
          <button
            onClick={handleLogout}
            // 반응형 스타일: 화면 크기에 따라 버튼 모양이 원형에서 사각형으로 바뀝니다.
            className="flex items-center justify-center bg-gray-500 text-white rounded-full sm:rounded-md hover:bg-gray-600 transition-colors w-10 h-10 sm:w-auto sm:h-auto sm:px-4 sm:py-2"
            aria-label="로그아웃" // 스크린 리더 등 웹 접근성을 위한 라벨
          >
            {/* sm 사이즈보다 작은 화면에서는 로그아웃 아이콘만 표시 */}
            <FaSignOutAlt size={18} className="block sm:hidden" />
            {/* sm 사이즈 이상 화면에서는 '로그아웃' 텍스트를 표시 */}
            <span className="hidden sm:block">로그아웃</span>
          </button>
        </>
      ) : (
        // --- 2. 사용자가 로그인하지 않은 경우 ---
        <Link href="/login">
          <button
            // 반응형 스타일: 화면 크기에 따라 버튼 모양이 원형에서 사각형으로 바뀝니다.
            className="flex items-center justify-center bg-blue-500 text-white rounded-full sm:rounded-md hover:bg-blue-600 transition-colors w-10 h-10 sm:w-auto sm:h-auto sm:px-4 sm:py-2"
            aria-label="로그인" // 스크린 리더 등 웹 접근성을 위한 라벨
          >
            {/* sm 사이즈보다 작은 화면에서는 로그인 아이콘만 표시 */}
            <FaSignInAlt size={18} className="block sm:hidden" />
            {/* sm 사이즈 이상 화면에서는 '로그인' 텍스트를 표시 */}
            <span className="hidden sm:block">로그인</span>
          </button>
        </Link>
      )}
    </nav>
  );
}
