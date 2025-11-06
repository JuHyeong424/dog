"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';

// 컨텍스트 타입 정의
interface AuthContextType {
  user: User | null;
  isLoading: boolean; // isLoading 상태 추가
}

// 컨텍스트 생성 (초기값에 isLoading 추가)
const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
});

// AuthProvider 컴포넌트
export function AuthProvider({ children }: { children: ReactNode }) {
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true); // isLoading 상태 관리

  useEffect(() => {
    // onAuthStateChange: 인증 상태가 바뀔 때마다(로그인, 로그아웃 등) 호출되는 리스너
    // 페이지가 처음 로드될 때도 현재 세션 정보를 가져오기 위해 한 번 실행됩니다.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      setIsLoading(false); // 세션 확인이 끝나면 로딩 상태를 false로 변경
    });

    // 컴포넌트가 언마운트될 때 리스너를 정리합니다.
    return () => {
      subscription.unsubscribe();
    };
  }, [supabase.auth]);

  const value = {
    user,
    isLoading, // value에 isLoading 포함
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// useAuth 훅 (반환 타입에 isLoading 추가)
export const useAuth = (): AuthContextType => {
  return useContext(AuthContext);
};
