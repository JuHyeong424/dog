import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Next.js 서버 컴포넌트, 서버 액션, API 라우트에서 사용할
 * Supabase 클라이언트 인스턴스를 생성하는 비동기 팩토리 함수입니다.
 * 이 함수의 핵심 역할은 Supabase 클라이언트가 쿠키 저장소(cookie store)와 상호작용하여
 * 인증 상태를 관리할 수 있도록 연결하는 것입니다.
 */
export const createClient = async () => {
  // `next/headers`의 `cookies()` 함수를 호출하여 현재 요청에 대한 쿠키 저장소에 접근합니다.
  // 이 함수는 서버 환경에서만 사용할 수 있습니다.
  const cookieStore = await cookies();

  // 서버용 Supabase 클라이언트를 생성하고 반환합니다.
  return createServerClient(
    supabaseUrl!, // Supabase URL
    supabaseKey!, // Supabase 공개 키
    {
      // Supabase 클라이언트가 쿠키를 어떻게 처리할지 정의하는 객체입니다.
      cookies: {
        /**
         * `getAll` 함수: Supabase가 인증 상태를 확인하기 위해 쿠키를 '읽어야' 할 때 호출됩니다.
         * @returns {Array} 현재 요청의 모든 쿠키 객체 배열
         */
        getAll() {
          return cookieStore.getAll()
        },
        /**
         * `setAll` 함수: Supabase가 로그인, 로그아웃, 토큰 갱신 등으로 인해
         * 쿠키를 '설정하거나 삭제해야' 할 때 호출됩니다.
         * @param {Array} cookiesToSet - 설정할 쿠키 객체들의 배열
         */
        setAll(cookiesToSet) {
          try {
            // 전달받은 모든 쿠키에 대해 반복하며 `cookieStore.set`을 호출하여 쿠키를 설정합니다.
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          } catch (error) {
            // 서버 컴포넌트 내에서 쿠키를 설정하려고 할 때 이 `catch` 블록이 실행될 수 있습니다.
            // 서버 컴포넌트는 읽기 전용이므로, 응답 헤더를 수정(쿠키 설정)할 수 없기 때문입니다.
            // 하지만, 사용자 세션을 새로고침하는 미들웨어가 있다면 이 에러는 무시해도 괜찮습니다.
            // 미들웨어가 다음 요청에서 어차피 쿠키를 올바르게 갱신해 줄 것이기 때문입니다.
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    },
  );
};
