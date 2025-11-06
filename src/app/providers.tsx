"use client";

import {PropsWithChildren, useState} from "react";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

// React Query 설정을 앱 전체에 제공하는 프로바이더 컴포넌트입니다.
export default function Providers({ children }: PropsWithChildren) {
  // useState를 사용하여 QueryClient 인스턴스를 생성합니다.
  // 컴포넌트가 리렌더링되어도 QueryClient가 새로 생성되지 않도록 보장합니다.
  const [queryClient] = useState(() => new QueryClient({
    // 모든 쿼리에 대한 전역 기본 옵션을 설정합니다.
    defaultOptions: {
      queries: {
        // staleTime: 데이터를 'fresh' 상태로 유지할 시간을 설정합니다.
        // 60000ms (1분) 동안은 fresh 상태로 간주되어, 다시 fetch 하지 않습니다.
        staleTime: 60 * 1000,
      },
    },
  }));

  return (
    // QueryClientProvider는 생성된 queryClient를 앱의 모든 자식 컴포넌트에서 사용할 수 있도록 합니다.
    <QueryClientProvider client={queryClient}>
      {/* 이 프로바이더로 감싸진 자식 컴포넌트들이 렌더링됩니다. (앱의 전체 내용) */}
      {children}
      {/* React Query 개발자 도구입니다. 개발 환경에서 쿼리 상태를 시각적으로 디버깅할 수 있습니다. */}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
