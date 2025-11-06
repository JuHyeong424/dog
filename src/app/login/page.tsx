"use client";

import { createClient } from '@/lib/supabase/client';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const supabase = createClient();
  const router = useRouter();

  supabase.auth.onAuthStateChange((event) => {
    if (event === 'SIGNED_IN') {
      // 로그인이 성공하면 홈으로 리디렉션
      router.push('/');
    }
  });

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="w-full max-w-md p-8 rounded-lg shadow-md">
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          theme="dark"
          providers={[]} // 구글, 카카오 등 소셜 로그인 추가
          localization={{
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
