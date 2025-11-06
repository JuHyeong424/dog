import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * 클라이언트 컴포넌트에서 사용할 Supabase 클라이언트 인스턴스를 생성하는 팩토리 함수입니다.
 * 이 함수를 호출할 때마다 새로운 클라이언트가 생성됩니다.
 */
export const createClient = () =>
  // 가져온 URL과 키를 사용하여 클라이언트 인스턴스를 초기화하고 반환합니다.
  // `!`는 TypeScript에게 해당 변수가 null이나 undefined가 아님을 보장하는 Non-null assertion 연산자입니다.
  createBrowserClient(
    supabaseUrl!,
    supabaseKey!,
  );
