import { Button } from "@/components/common/Button";
import { useUserStore } from "@/store/useUserStore";
import { Ionicons } from "@expo/vector-icons";
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
  View,
} from "react-native";

const PASSWORD_PATTERN = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

export default function SignupScreen() {
  const register = useUserStore((s) => s.register);
  const hasOnboarded = useUserStore((s) => s.hasOnboarded);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSignup = async () => {
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
      await register({ email: emailTrim, password, nickname });
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
          placeholderTextColor="#888"
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={styles.input}
          placeholder="이메일"
          placeholderTextColor="#888"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.inputWithIcon}
            placeholder="비밀번호 (8자+, 영·숫자·특수문자)"
            placeholderTextColor="#888"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity
            style={styles.eyeButton}
            onPress={() => setShowPassword((v) => !v)}
          >
            <Ionicons
              name={showPassword ? "eye" : "eye-off"}
              size={20}
              color="#888"
            />
          </TouchableOpacity>
        </View>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.inputWithIcon}
            placeholder="비밀번호 확인"
            placeholderTextColor="#888"
            value={confirm}
            onChangeText={setConfirm}
            secureTextEntry={!showConfirm}
          />
          <TouchableOpacity
            style={styles.eyeButton}
            onPress={() => setShowConfirm((v) => !v)}
          >
            <Ionicons
              name={showConfirm ? "eye" : "eye-off"}
              size={20}
              color="#888"
            />
          </TouchableOpacity>
        </View>

        <Button label="가입하기" onPress={handleSignup} style={{ marginTop: 4 }} />

        <Button
          label="이미 계정이 있으신가요? 로그인"
          onPress={() => router.back()}
          variant="ghost"
          style={{ marginTop: 4 }}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#191A1C" },
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
    color: "#fff",
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
    color: "#888",
    marginBottom: 12,
  },
  input: {
    borderWidth: 1.5,
    borderColor: "#333537",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "#fff",
    backgroundColor: "#242628",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#333537",
    borderRadius: 14,
    backgroundColor: "#242628",
  },
  inputWithIcon: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "#fff",
  },
  eyeButton: {
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
});
