import { updatePassword } from "@/api/users";
import { Button } from "@/components/common/Button";
import { ConfirmModal } from "@/components/common/ConfirmModal";
import { useAppAlert } from "@/hooks/useAppAlert";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const MIN_LENGTH = 8;

export default function ChangePasswordScreen() {
  const router = useRouter();

  const { show: showAlert, hide: hideAlert, config: alertConfig, isVisible: alertVisible } = useAppAlert();

  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const passwordMismatch = confirm.length > 0 && next !== confirm;
  const isValid =
    current.length >= 1 &&
    next.length >= MIN_LENGTH &&
    next === confirm &&
    next !== current;

  const handleSave = async () => {
    if (!isValid) return;
    setLoading(true);
    try {
      await updatePassword(current, next);
      showAlert("완료", "비밀번호가 변경되었습니다.", [
        { text: "확인", onPress: () => router.back() },
      ]);
    } catch {
      showAlert("오류", "비밀번호 변경에 실패했습니다. 현재 비밀번호를 확인해주세요.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ConfirmModal
        visible={alertVisible}
        title={alertConfig?.title ?? ""}
        message={alertConfig?.message}
        buttons={alertConfig?.buttons}
        onDismiss={hideAlert}
      />
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.title}>비밀번호 변경</Text>
        <View style={styles.backBtn} />
      </View>

      <View style={styles.body}>
        {/* 현재 비밀번호 */}
        <Text style={styles.label}>현재 비밀번호</Text>
        <View style={styles.inputWrap}>
          <TextInput
            style={styles.input}
            placeholder="현재 비밀번호를 입력하세요"
            placeholderTextColor="#555"
            value={current}
            onChangeText={setCurrent}
            secureTextEntry
            autoFocus
            returnKeyType="next"
          />
        </View>

        {/* 새 비밀번호 */}
        <Text style={[styles.label, { marginTop: 20 }]}>새 비밀번호</Text>
        <View style={styles.inputWrap}>
          <TextInput
            style={styles.input}
            placeholder={`${MIN_LENGTH}자 이상 입력하세요`}
            placeholderTextColor="#555"
            value={next}
            onChangeText={setNext}
            secureTextEntry
            returnKeyType="next"
          />
        </View>

        {/* 새 비밀번호 확인 */}
        <Text style={[styles.label, { marginTop: 20 }]}>새 비밀번호 확인</Text>
        <View style={[styles.inputWrap, passwordMismatch && styles.inputError]}>
          <TextInput
            style={styles.input}
            placeholder="새 비밀번호를 다시 입력하세요"
            placeholderTextColor="#555"
            value={confirm}
            onChangeText={setConfirm}
            secureTextEntry
            returnKeyType="done"
            onSubmitEditing={handleSave}
          />
        </View>
        {passwordMismatch && (
          <Text style={styles.errorText}>비밀번호가 일치하지 않습니다.</Text>
        )}

        {/* 저장 버튼 */}
        {loading ? (
          <ActivityIndicator color="#58CC02" style={{ marginTop: 24 }} />
        ) : (
          <Button
            label="저장하기"
            onPress={handleSave}
            disabled={!isValid}
            style={{ marginTop: 24 }}
          />
        )}

        {/* 주의사항 */}
        <View style={styles.notice}>
          <Text style={styles.noticeTitle}>주의사항</Text>
          <Text style={styles.noticeItem}>• 비밀번호는 8자 이상으로 설정해주세요.</Text>
          <Text style={styles.noticeItem}>• 현재 비밀번호와 다른 비밀번호를 사용해주세요.</Text>
          <Text style={styles.noticeItem}>• 변경 후 다시 로그인이 필요할 수 있습니다.</Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#191A1C" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 56,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  backBtn: { width: 40, alignItems: "center" },
  backIcon: { color: "#fff", fontSize: 32, lineHeight: 36 },
  title: { color: "#fff", fontSize: 17, fontWeight: "700" },

  body: { paddingHorizontal: 20, paddingTop: 24 },

  label: { color: "#888", fontSize: 12, fontWeight: "600", marginBottom: 8 },

  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#242628",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderWidth: 1.5,
    borderColor: "#58CC02",
  },
  inputError: {
    borderColor: "#FF4B4B",
  },
  input: {
    flex: 1,
    color: "#fff",
    fontSize: 16,
    paddingVertical: 10,
  },
  errorText: {
    color: "#FF4B4B",
    fontSize: 12,
    marginTop: 6,
    marginLeft: 4,
  },

  notice: {
    marginTop: 28,
    backgroundColor: "#1e2022",
    borderRadius: 12,
    padding: 14,
    gap: 6,
  },
  noticeTitle: {
    color: "#666",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  noticeItem: { color: "#555", fontSize: 12, lineHeight: 18 },
});
