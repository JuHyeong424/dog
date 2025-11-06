"use client";

import Link from "next/link";
import "@/app/globals.css";
import Providers from "@/app/providers";
import ProductSearchBar from "@/components/search/ProductSearchBar";
import { AuthProvider } from "@/context/AuthContext";
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

          <div className="flex-1 flex justify-end items-center">
            <AuthNav />
          </div>
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
