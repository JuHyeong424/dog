"use client";

import { createClient } from '@/lib/supabase/client';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  // Supabase 클라이언트 인스턴스를 생성합니다.
  const supabase = createClient();
  // useRouter 훅을 사용하여 router 객체를 가져옵니다.
  const router = useRouter();

  // Supabase의 인증 상태 변경(로그인, 로그아웃 등)을 감지하는 리스너를 설정합니다.
  supabase.auth.onAuthStateChange((event) => {
    // 만약 'SIGNED_IN'(로그인 성공) 이벤트가 발생하면,
    if (event === 'SIGNED_IN') {
      // 메인 페이지('/')로 사용자를 리디렉션합니다.
      router.push('/');
    }
  });

  // 화면에 렌더링될 JSX를 반환합니다.
  return (
    // 화면 전체를 차지하고 내용을 중앙에 배치하는 컨테이너입니다.
    <div className="flex justify-center items-center h-screen">
      {/* 로그인 폼의 스타일을 정의하는 컨테이너입니다. */}
      <div className="w-full max-w-md p-8 rounded-lg shadow-md">
        {/* Supabase 인증 UI 컴포넌트입니다. */}
        <Auth
          supabaseClient={supabase} // 생성된 Supabase 클라이언트를 전달합니다.
          appearance={{ theme: ThemeSupa }} // 기본 Supabase 테마를 적용합니다.
          theme="dark" // 다크 모드 테마를 사용합니다.
          providers={[]} // 소셜 로그인 제공자 목록입니다. (예: ['google', 'kakao'])
          localization={{
            // UI에 표시되는 텍스트를 한국어로 변경합니다.
            variables: {
              sign_in: { email_label: '이메일', password_label: '비밀번호', button_label: '로그인' },
              sign_up: { email_label: '이메일', password_label: '비밀번호', button_label: '회원가입' },
            }
          }}
        />
      </div>
    </div>
  );
}
