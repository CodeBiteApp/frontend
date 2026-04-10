import api from "@/api/axios";
import { useUserStore } from "@/store/useUserStore";
import { Redirect, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function AuthIndexScreen() {
  const router = useRouter();
  const isLoggedIn = useUserStore((s) => s.isLoggedIn);
  const hasOnboarded = useUserStore((s) => s.hasOnboarded);
  const [checking, setChecking] = useState(false);

  if (isLoggedIn && hasOnboarded) return <Redirect href="/(tabs)" />;
  if (isLoggedIn && !hasOnboarded) return <Redirect href="/(onboarding)" />;

  // 서버 상태 체크 (임시 코드)
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
        <TouchableOpacity
          style={styles.emailBtn}
          onPress={() => router.push("/(auth)/login")}
          activeOpacity={0.85}
        >
          <Text style={styles.emailBtnText}>이메일로 시작하기</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.kakaoBtn} activeOpacity={0.85}>
          <Text style={styles.kakaoBtnText}>카카오로 시작하기</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.googleBtn} activeOpacity={0.85}>
          <Text style={styles.googleBtnText}>구글로 시작하기</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.serverCheckBtn}
          onPress={handleServerCheck}
          activeOpacity={0.85}
          disabled={checking}
        >
          <Text style={styles.serverCheckBtnText}>
            {checking ? "확인 중..." : "서버 연결 확인"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
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
  emailBtn: {
    backgroundColor: "#0a7ea4",
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: "center",
  },
  emailBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  kakaoBtn: {
    backgroundColor: "#FEE500",
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: "center",
  },
  kakaoBtnText: { color: "#191919", fontSize: 16, fontWeight: "700" },
  googleBtn: {
    borderWidth: 1.5,
    borderColor: "#e0e0e0",
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  googleBtnText: { color: "#1a1a1a", fontSize: 16, fontWeight: "700" },
  serverCheckBtn: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  serverCheckBtnText: { color: "#888", fontSize: 14 },
});
