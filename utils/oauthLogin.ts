import * as WebBrowser from "expo-web-browser";

/** 백엔드 `oauth2.redirect-uri` 기본값과 동일해야 함 (`10-auth-user.md`) */
export const OAUTH_REDIRECT_URI = "codebite://auth/callback";

export type OAuthProvider = "google" | "kakao";

export function getOAuthAuthorizationUrl(provider: OAuthProvider): string {
  const base = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, "") ?? "";
  if (!base) {
    throw new Error("EXPO_PUBLIC_API_URL이 설정되어 있지 않습니다.");
  }
  return `${base}/oauth2/authorization/${provider}`;
}

function parseOAuthCallbackUrl(url: string): {
  accessToken?: string;
  expiresIn?: string;
  error?: string;
} {
  try {
    const u = new URL(url);
    return {
      accessToken: u.searchParams.get("accessToken") ?? undefined,
      expiresIn: u.searchParams.get("expiresIn") ?? undefined,
      error: u.searchParams.get("error") ?? undefined,
    };
  } catch {
    return {};
  }
}

export async function openOAuthLoginSession(
  provider: OAuthProvider,
): Promise<
  | { ok: true; accessToken: string; expiresIn?: string }
  | { ok: false; cancelled: true }
  | { ok: false; error: string }
> {
  const authUrl = getOAuthAuthorizationUrl(provider);
  const result = await WebBrowser.openAuthSessionAsync(
    authUrl,
    OAUTH_REDIRECT_URI,
  );

  if (result.type === "cancel" || result.type === "dismiss") {
    return { ok: false, cancelled: true };
  }

  if (result.type !== "success" || !result.url) {
    return { ok: false, error: "oauth_session_failed" };
  }

  const parsed = parseOAuthCallbackUrl(result.url);
  if (parsed.error) {
    return { ok: false, error: parsed.error };
  }
  if (!parsed.accessToken) {
    return { ok: false, error: "missing_access_token" };
  }

  return {
    ok: true,
    accessToken: parsed.accessToken,
    expiresIn: parsed.expiresIn,
  };
}
