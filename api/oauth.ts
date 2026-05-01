import * as WebBrowser from "expo-web-browser";

/** 백엔드 `oauth2.redirect-uri` 기본값과 동일해야 함 (`10-auth-user.md`) */
export const OAUTH_REDIRECT_URI = "codebite://auth/callback";

export type OAuthProvider = "google" | "kakao";

export type OAuthLoginResult =
  | { ok: true; accessToken: string; expiresIn?: string }
  | { ok: false; cancelled: true }
  | { ok: false; error: string };

// 콜백 URL 분석 함수
function parseCallbackUrl(url: string) {
  try {
    const params = new URL(url).searchParams;
    return {
      accessToken: params.get("accessToken") ?? undefined,
      expiresIn: params.get("expiresIn") ?? undefined,
      error: params.get("error") ?? undefined,
    };
  } catch {
    return {};
  }
}

// 소셜 로그인 함수 값 - google or kakao
export async function openOAuthLoginSession(
  provider: OAuthProvider,
): Promise<OAuthLoginResult> {
  // URL 환경 설정
  const base = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, "");
  if (!base) throw new Error("EXPO_PUBLIC_API_URL이 설정되어 있지 않습니다.");

  // OAuth 창 열기
  const result = await WebBrowser.openAuthSessionAsync(
    `${base}/oauth2/authorization/${provider}`,
    OAUTH_REDIRECT_URI,
  );

  // 로그인 실패처리 - 취소면 취소처리 or 에러 처리
  if (result.type !== "success" || !result.url) {
    const cancelled = result.type === "cancel" || result.type === "dismiss";
    return cancelled
      ? { ok: false, cancelled: true }
      : { ok: false, error: "oauth_session_failed" };
  }

  // 토큰 추출
  const { accessToken, expiresIn, error } = parseCallbackUrl(result.url);
  if (error) return { ok: false, error };
  if (!accessToken) return { ok: false, error: "missing_access_token" };

  return { ok: true, accessToken, expiresIn };
}
