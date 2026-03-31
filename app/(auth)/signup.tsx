import { useUserStore } from "@/store/useUserStore";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
} from "react-native";

export default function SignupScreen() {
  const router = useRouter();
  const login = useUserStore((s) => s.login);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const handleSignup = () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      Alert.alert("알림", "모든 항목을 입력해주세요.");
      return;
    }
    if (password !== confirm) {
      Alert.alert("알림", "비밀번호가 일치하지 않습니다.");
      return;
    }
    if (password.length < 6) {
      Alert.alert("알림", "비밀번호는 6자 이상이어야 합니다.");
      return;
    }
    // 실제 앱에서는 API 호출로 교체
    login(name, email);
    router.replace("/(tabs)");
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">
        <Text style={styles.logo}>🧠</Text>
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
          placeholder="비밀번호 (6자 이상)"
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

        <TouchableOpacity style={styles.signupBtn} onPress={handleSignup} activeOpacity={0.85}>
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
  inner: { flexGrow: 1, justifyContent: "center", paddingHorizontal: 28, paddingVertical: 48, gap: 14 },
  logo: { fontSize: 56, textAlign: "center", marginBottom: 4 },
  title: { fontSize: 28, fontWeight: "bold", textAlign: "center", color: "#1a1a1a" },
  subtitle: { fontSize: 14, textAlign: "center", color: "#888", marginBottom: 12 },
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
