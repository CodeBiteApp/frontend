import { openOAuthLoginSession, OAuthProvider } from "@/api/oauth";
import { useUserStore } from "@/store/useUserStore";
import { useMutation } from "@tanstack/react-query";
import { Alert } from "react-native";

export function useOAuthLogin() {
  const completeSessionWithAccessToken = useUserStore(
    (s) => s.completeSessionWithAccessToken,
  );

  return useMutation({
    mutationFn: async (provider: OAuthProvider) => {
      const res = await openOAuthLoginSession(provider);
      if (!res.ok) {
        if ("cancelled" in res) return null;
        throw new Error(
          res.error === "oauth2_authentication_failed"
            ? "인증에 실패했습니다. 다시 시도해 주세요."
            : res.error,
        );
      }
      return res;
    },
    onSuccess: async (res) => {
      if (!res) return;
      await completeSessionWithAccessToken(res.accessToken);
    },
    onError: (e) => {
      Alert.alert(
        "소셜 로그인 실패",
        e instanceof Error ? e.message : String(e),
      );
    },
  });
}
