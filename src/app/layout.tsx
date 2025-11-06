"use client"; // AuthProvider를 사용하므로 클라이언트 컴포넌트로 유지합니다.

import Link from "next/link";
import "@/app/globals.css";
import Providers from "@/app/providers";
import ProductSearchBar from "@/components/search/ProductSearchBar";
import { AuthProvider } from "@/context/AuthContext";
// --- [추가] --- 방금 만든 AuthNav 컴포넌트를 가져옵니다.
import AuthNav from "@/components/layout/AuthNav";

export default function RootLayout({children}: { children: React.ReactNode }) {

  return (
    <html lang="en">
    <body className="min-h-screen flex flex-col">
    <Providers>
      <AuthProvider>
        <header className="sticky top-0 z-50 flex items-center h-20 px-4 sm:px-6 md:px-8 shadow-md bg-white w-full">
          {/* 왼쪽 구역 (로고) */}
          <div className="flex-1 flex justify-start">
            <Link href="/" className="font-bold text-xl">로고</Link>
          </div>

          {/* 중앙 구역 (검색창) */}
          <div className="flex-1 flex justify-center min-w-[280px] sm:min-w-[400px] md:min-w-[500px] px-4">
            <ProductSearchBar/>
          </div>

          {/* --- [수정] --- 오른쪽 구역 (메뉴) */}
          <div className="flex-1 flex justify-end items-center">
            <AuthNav />
          </div>
          {/* --- [수정 끝] --- */}

        </header>

        <main className="flex-grow flex justify-center bg-gray-100">
          <div className="w-full">
            {children}
          </div>
        </main>
      </AuthProvider>
    </Providers>
    </body>
    </html>
  );
}
