"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/lib/supabase/client";
// 아이콘을 사용하기 위해 react-icons 라이브러리를 import 합니다.
import { FaUserCircle, FaSignInAlt, FaSignOutAlt } from "react-icons/fa";

export default function AuthNav() {
  const { user } = useAuth();
  const supabase = createClient();
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh();
  };

  return (
    <nav className="flex items-center gap-3 sm:gap-4 font-semibold">
      {user ? (
        // --- 로그인이 된 경우 ---
        <>
          {/* 마이페이지 링크 */}
          <Link href="/my" className="text-gray-600 hover:text-blue-600 transition-colors">
            {/* 작은 화면에서는 유저 아이콘만 표시 */}
            <FaUserCircle size={24} className="block sm:hidden" />
            {/* sm 사이즈 이상 화면에서는 '마이페이지' 텍스트 표시 */}
            <span className="hidden sm:block">마이페이지</span>
          </Link>

          {/* 로그아웃 버튼 */}
          <button
            onClick={handleLogout}
            className="flex items-center justify-center bg-gray-500 text-white rounded-full sm:rounded-md hover:bg-gray-600 transition-colors w-10 h-10 sm:w-auto sm:h-auto sm:px-4 sm:py-2"
            aria-label="로그아웃" // 스크린 리더를 위한 라벨
          >
            {/* 작은 화면에서는 로그아웃 아이콘만 표시 */}
            <FaSignOutAlt size={18} className="block sm:hidden" />
            {/* sm 사이즈 이상 화면에서는 '로그아웃' 텍스트 표시 */}
            <span className="hidden sm:block">로그아웃</span>
          </button>
        </>
      ) : (
        // --- 로그인이 안 된 경우 ---
        <Link href="/login">
          <button
            className="flex items-center justify-center bg-blue-500 text-white rounded-full sm:rounded-md hover:bg-blue-600 transition-colors w-10 h-10 sm:w-auto sm:h-auto sm:px-4 sm:py-2"
            aria-label="로그인" // 스크린 리더를 위한 라벨
          >
            {/* 작은 화면에서는 로그인 아이콘만 표시 */}
            <FaSignInAlt size={18} className="block sm:hidden" />
            {/* sm 사이즈 이상 화면에서는 '로그인' 텍스트 표시 */}
            <span className="hidden sm:block">로그인</span>
          </button>
        </Link>
      )}
    </nav>
  );
}
