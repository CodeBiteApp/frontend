import { OAuthProvider, openOAuthLoginSession } from "@/api/oauth";
import { Button } from "@/components/common/Button";
import { useUserStore } from "@/store/useUserStore";
import { Redirect, useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, Image, StyleSheet, Text, View } from "react-native";

export default function AuthIndexScreen() {
  const router = useRouter();
  const isLoggedIn = useUserStore((s) => s.isLoggedIn);
  const hasOnboarded = useUserStore((s) => s.hasOnboarded);
  const completeSessionWithAccessToken = useUserStore(
    (s) => s.completeSessionWithAccessToken,
  );
  const [checking, setChecking] = useState(false);
  const [oauthProvider, setOauthProvider] = useState<OAuthProvider | null>(
    null,
  );

  if (isLoggedIn && hasOnboarded) return <Redirect href="/(tabs)" />;
  if (isLoggedIn && !hasOnboarded) return <Redirect href="/(onboarding)" />;

  const runOAuth = async (provider: OAuthProvider) => {
    setOauthProvider(provider);
    try {
      const res = await openOAuthLoginSession(provider);
      if (res.ok) {
        await completeSessionWithAccessToken(res.accessToken);
        return;
      }
      if ("cancelled" in res && res.cancelled) return;
      if ("error" in res) {
        const msg =
          res.error === "oauth2_authentication_failed"
            ? "인증에 실패했습니다. 다시 시도해 주세요."
            : res.error;
        Alert.alert("소셜 로그인 실패", msg);
      }
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      Alert.alert("소셜 로그인 오류", message);
    } finally {
      setOauthProvider(null);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.top}>
        <Image
          source={require("@/assets/images/logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.subtitle}>퀴즈로 지식을 쌓아보세요</Text>
      </View>

      <View style={styles.buttons}>
        <Button
          label="이메일로 시작하기"
          onPress={() => router.push("/(auth)/login")}
        />
        <Button
          label={
            oauthProvider === "kakao"
              ? "카카오 연결 중..."
              : "카카오로 시작하기"
          }
          variant="kakao"
          onPress={() => void runOAuth("kakao")}
          disabled={oauthProvider !== null || checking}
        />
        <Button
          label={
            oauthProvider === "google" ? "구글 연결 중..." : "구글로 시작하기"
          }
          variant="outline"
          onPress={() => void runOAuth("google")}
          disabled={oauthProvider !== null || checking}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#191A1C",
    justifyContent: "center",
    paddingHorizontal: 28,
  },
  top: {
    alignItems: "center",
    marginBottom: 56,
  },
  logo: { width: "100%", height: 200 },
  subtitle: {
    fontSize: 14,
    color: "#888",
    marginTop: 6,
  },
  buttons: { gap: 12 },
});
