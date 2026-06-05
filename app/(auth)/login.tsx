import { Button } from "@/components/common/Button";
import { ConfirmModal } from "@/components/common/ConfirmModal";
import { ALERT_TITLES, AUTH_MESSAGES } from "@/constants/messages";
import { useAppAlert } from "@/hooks/useAppAlert";
import { useUserStore } from "@/store/useUserStore";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
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

export default function LoginScreen() {
  const router = useRouter();
  const login = useUserStore((s) => s.login);
  const hasOnboarded = useUserStore((s) => s.hasOnboarded);

  const { show: showAlert, hide: hideAlert, config: alertConfig, isVisible: alertVisible } = useAppAlert();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      showAlert(ALERT_TITLES.notice, AUTH_MESSAGES.login.emptyFields);
      return;
    }
    try {
      await login({ email: email.trim(), password });
      router.replace(hasOnboarded ? "/(tabs)" : ("/(onboarding)" as never));
    } catch {
      showAlert(ALERT_TITLES.loginFailed, AUTH_MESSAGES.login.failed);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ConfirmModal
        visible={alertVisible}
        title={alertConfig?.title ?? ""}
        message={alertConfig?.message}
        buttons={alertConfig?.buttons}
        onDismiss={hideAlert}
      />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.inner}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Image
          source={require("@/assets/images/logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>이메일로 로그인</Text>
        <Text style={styles.subtitle}>이메일과 비밀번호를 입력해주세요</Text>

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
            placeholder="비밀번호"
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

        <Button label="로그인" onPress={handleLogin} style={{ marginTop: 4 }} />

        <Button
          label="계정이 없으신가요? 회원가입"
          onPress={() => router.push("/(auth)/signup")}
          variant="ghost"
          style={{ marginTop: 4 }}
        />

        <Button
          label="다른 로그인 방법으로 로그인하기"
          onPress={() => router.replace("/(auth)")}
          variant="ghost"
          style={{ marginTop: 4 }}
          textStyle={{ color: "#888", fontSize: 14, textDecorationLine: "underline" }}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#191A1C" },
  scroll: { flex: 1, backgroundColor: "#191A1C" },
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
