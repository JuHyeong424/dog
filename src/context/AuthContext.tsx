"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
});

// AuthProvider 컴포넌트
export function AuthProvider({ children }: { children: ReactNode }) {
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);
  // isLoading의 이름을 initialLoading으로 변경하여 역할을 명확히 합니다.
  // 이 상태는 앱이 처음 로드될 때 단 한 번의 세션 확인이 끝났는지만 추적합니다.
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    // onAuthStateChange 리스너를 한 번만 설정합니다.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      // 로그인, 로그아웃, 토큰 갱신 등 모든 인증 상태 변경 시 user 상태를 업데이트합니다.
      setUser(session?.user ?? null);

      // 중요한 변경: initialLoading은 첫 세션 확인 시에만 false로 설정합니다.
      // 이후의 onAuthStateChange 호출에서는 이 상태를 변경하지 않습니다.
      // 이렇게 하면 탭 포커스 변경으로 인한 불필요한 로딩 상태 변경을 막을 수 있습니다.
      if (initialLoading) {
        setInitialLoading(false);
      }
    });

    // 컴포넌트가 언마운트될 때 리스너를 정리합니다.
    return () => {
      subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 의존성 배열을 비워 최초 렌더링 시 한 번만 실행되도록 합니다.

  const value = {
    user,
    isLoading: initialLoading, // 컨텍스트에는 initialLoading 상태를 isLoading으로 전달합니다.
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// useAuth 훅
export const useAuth = (): AuthContextType => {
  return useContext(AuthContext);
};
