import api from "@/api/axios";
import { Button } from "@/components/common/Button";
import { useUserStore } from "@/store/useUserStore";
import { Redirect, useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, Image, StyleSheet, Text, View } from "react-native";

export default function AuthIndexScreen() {
  const router = useRouter();
  const isLoggedIn = useUserStore((s) => s.isLoggedIn);
  const hasOnboarded = useUserStore((s) => s.hasOnboarded);
  const [checking, setChecking] = useState(false);

  if (isLoggedIn && hasOnboarded) return <Redirect href="/(tabs)" />;
  if (isLoggedIn && !hasOnboarded) return <Redirect href="/(onboarding)" />;

  const handleServerCheck = async () => {
    setChecking(true);
    try {
      await api.get("/api/health");
      Alert.alert("서버 연결 성공", "서버가 정상적으로 응답했습니다.");
    } catch (e: any) {
      Alert.alert(
        "서버 연결 실패",
        `서버에 접근할 수 없습니다.\n${e?.message ?? ""}`,
      );
    } finally {
      setChecking(false);
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
        <Button label="카카오로 시작하기" variant="kakao" />
        <Button label="구글로 시작하기" variant="outline" />
        <Button
          label={checking ? "확인 중..." : "서버 연결 확인"}
          onPress={handleServerCheck}
          disabled={checking}
          variant="outline"
          style={{ paddingVertical: 12 }}
          textStyle={{ fontSize: 14, color: "#888" }}
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
