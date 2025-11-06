"use client";

import Link from "next/link";
import "@/app/globals.css"; // 전역 CSS 스타일
import Providers from "@/app/providers"; // React Query 등 전역 프로바이더
import ProductSearchBar from "@/components/search/ProductSearchBar"; // 검색창 컴포넌트
import { AuthProvider } from "@/context/AuthContext"; // 인증 컨텍스트
import AuthNav from "@/components/layout/AuthNav"; // 인증 관련 네비게이션 (로그인/로그아웃 버튼 등)

// 모든 페이지에 공통적으로 적용될 최상위 레이아웃 컴포넌트입니다.
export default function RootLayout({children}: { children: React.ReactNode }) {

  return (
    <html lang="en">
    <body className="min-h-screen flex flex-col">
    {/* React Query와 같은 프로바이더들을 앱 전체에 제공합니다. */}
    <Providers>
      {/* 인증 상태(로그인 여부, 사용자 정보 등)를 앱 전체에 제공합니다. */}
      <AuthProvider>
        {/* 헤더: 상단에 고정되는 네비게이션 바 */}
        <header className="sticky top-0 z-50 flex items-center h-20 px-4 sm:px-6 md:px-8 shadow-md bg-white w-full">
          {/* 왼쪽: 로고 */}
          <div className="flex-1 flex justify-start">
            <Link href="/" className="font-bold text-xl">로고</Link>
          </div>

          {/* 중앙: 검색창 */}
          <div className="flex-1 flex justify-center min-w-[280px] sm:min-w-[400px] md:min-w-[500px] px-4">
            <ProductSearchBar/>
          </div>

          {/* 오른쪽: 인증 관련 네비게이션 (로그인, 마이페이지 등) */}
          <div className="flex-1 flex justify-end items-center">
            <AuthNav />
          </div>
        </header>

        {/* 메인 컨텐츠 영역 */}
        <main className="flex-grow flex justify-center bg-gray-100">
          <div className="w-full">
            {/* 각 페이지의 실제 내용이 이 부분에 렌더링됩니다. */}
            {children}
          </div>
        </main>
      </AuthProvider>
    </Providers>
    </body>
    </html>
  );
}
