import { useUserStore } from "@/store/useUserStore";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
} from "react-native";

const PASSWORD_PATTERN = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

export default function SignupScreen() {
  const register = useUserStore((s) => s.register);
  // 나중에 제대로된 값을 받아야함.
  const hasOnboarded = useUserStore((s) => s.hasOnboarded);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  // 회원가입
  const handleSignup = async () => {
    // 유효성 검사
    const nickname = name.trim();
    const emailTrim = email.trim();
    if (!nickname || !emailTrim || !password) {
      Alert.alert("알림", "모든 항목을 입력해주세요.");
      return;
    }
    if (nickname.length < 2 || nickname.length > 20) {
      Alert.alert("알림", "닉네임은 2~20자여야 합니다.");
      return;
    }
    if (password !== confirm) {
      Alert.alert("알림", "비밀번호가 일치하지 않습니다.");
      return;
    }
    if (!PASSWORD_PATTERN.test(password)) {
      Alert.alert(
        "알림",
        "비밀번호는 8자 이상이며 영문, 숫자, 특수문자를 모두 포함해야 합니다.",
      );
      return;
    }
    try {
      await register({
        email: emailTrim,
        password,
        nickname,
      });
      router.replace(hasOnboarded ? "/(tabs)" : ("/(onboarding)" as never));
    } catch {
      Alert.alert(
        "회원가입 실패",
        "이미 가입된 이메일이거나 입력 형식을 확인해주세요.",
      );
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.inner}
        keyboardShouldPersistTaps="handled"
      >
        <Image
          source={require("@/assets/images/logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>회원가입</Text>
        <Text style={styles.subtitle}>CodeBite와 함께 시작하세요</Text>

        <TextInput
          style={styles.input}
          placeholder="닉네임"
          placeholderTextColor="#aaa"
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={styles.input}
          placeholder="이메일"
          placeholderTextColor="#aaa"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="비밀번호 (8자+, 영·숫자·특수문자)"
          placeholderTextColor="#aaa"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <TextInput
          style={styles.input}
          placeholder="비밀번호 확인"
          placeholderTextColor="#aaa"
          value={confirm}
          onChangeText={setConfirm}
          secureTextEntry
        />

        <TouchableOpacity
          style={styles.signupBtn}
          onPress={handleSignup}
          activeOpacity={0.85}
        >
          <Text style={styles.signupText}>가입하기</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backText}>← 로그인으로 돌아가기</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  inner: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 28,
    paddingVertical: 48,
    gap: 14,
  },
  logo: { width: "100%", height: 200 },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    color: "#1a1a1a",
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
    color: "#888",
    marginBottom: 12,
  },
  input: {
    borderWidth: 1.5,
    borderColor: "#e0e0e0",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "#1a1a1a",
    backgroundColor: "#fafafa",
  },
  signupBtn: {
    backgroundColor: "#0a7ea4",
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 4,
  },
  signupText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  backBtn: { alignItems: "center", marginTop: 8 },
  backText: { color: "#888", fontSize: 14 },
});
