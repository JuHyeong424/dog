import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Next.js 미들웨어나 API 라우트와 같은 서버 환경에서 Supabase 클라이언트를 생성하는 팩토리 함수입니다.
 * 이 함수의 핵심 역할은 Supabase 클라이언트가 쿠키를 읽고 쓸 수 있도록
 * Next.js의 요청(NextRequest) 및 응답(NextResponse) 객체와 연결하는 것입니다.
 * @param {NextRequest} request - 미들웨어나 API 라우트로 들어온 요청 객체.
 * @returns {NextResponse} - Supabase 인증 상태에 따라 쿠키가 포함될 수 있는 응답 객체.
 *                          (주: 이 함수는 Supabase 클라이언트가 아닌, NextResponse를 반환합니다.)
 */
export const createClient = (request: NextRequest) => {
  // 1. 수정되지 않은 '통과(pass-through)' 응답 객체를 미리 생성합니다.
  // 이 응답 객체는 나중에 Supabase가 쿠키를 설정해야 할 때 사용됩니다.
  let supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // 2. 서버용 Supabase 클라이언트를 생성합니다.
  const supabase = createServerClient(
    supabaseUrl!, // Supabase URL
    supabaseKey!, // Supabase 공개 키
    {
      // 3. Supabase 클라이언트가 쿠키를 어떻게 처리할지 정의하는 객체입니다.
      cookies: {
        // `getAll` 함수: Supabase가 인증 상태를 확인하기 위해 쿠키를 '읽어야' 할 때 호출됩니다.
        getAll() {
          // 들어온 요청(request)에서 모든 쿠키를 가져와 반환합니다.
          return request.cookies.getAll()
        },
        // `setAll` 함수: Supabase가 로그인, 로그아웃, 토큰 갱신 등으로 인해 쿠키를 '설정하거나 삭제해야' 할 때 호출됩니다.
        setAll(cookiesToSet) {
          // Supabase가 설정하려는 모든 쿠키에 대해 반복 작업을 수행합니다.
          // (참고: 이 부분은 미들웨어의 흐름을 위해 필요하며, 실제 브라우저로 쿠키를 보내는 작업은 아래에서 이루어집니다.)
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))

          // 새로운 응답 객체를 다시 생성하여 최신 상태를 반영합니다.
          supabaseResponse = NextResponse.next({
            request,
          })

          // 생성된 응답(supabaseResponse) 객체에 `Set-Cookie` 헤더를 추가합니다.
          // 이 작업을 통해 브라우저는 새로운 인증 쿠키를 받게 됩니다.
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    },
  );

  // 이 함수는 Supabase 클라이언트(`supabase`)가 아닌,
  // 쿠키가 설정될 수 있는 응답 객체(`supabaseResponse`)를 반환합니다.
  // 미들웨어는 이 응답 객체를 반환하여 사용자에게 쿠키를 전달해야 합니다.
  return supabaseResponse
};
