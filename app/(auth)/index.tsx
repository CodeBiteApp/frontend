import { Button } from "@/components/common/Button";
import { useOAuthLogin } from "@/hooks/useOAuthLogin";
import { useUserStore } from "@/store/useUserStore";
import { Redirect, useRouter } from "expo-router";
import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";

export default function AuthIndexScreen() {
  const router = useRouter();
  const isLoggedIn = useUserStore((s) => s.isLoggedIn);
  const hasOnboarded = useUserStore((s) => s.hasOnboarded);

  const {
    mutate: runOAuth,
    isPending,
    variables: activeProvider,
  } = useOAuthLogin();

  if (isLoggedIn && hasOnboarded) return <Redirect href="/(tabs)" />;
  if (isLoggedIn && !hasOnboarded) return <Redirect href="/(onboarding)" />;

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
            isPending && activeProvider === "kakao"
              ? "카카오 연결 중..."
              : "카카오로 시작하기"
          }
          variant="kakao"
          onPress={() => runOAuth("kakao")}
          disabled={isPending}
        />
        <Button
          label={
            isPending && activeProvider === "google"
              ? "구글 연결 중..."
              : "구글로 시작하기"
          }
          variant="outline"
          onPress={() => runOAuth("google")}
          disabled={isPending}
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
