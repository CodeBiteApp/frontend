import { updateNickname } from "@/api/users";
import { Button } from "@/components/common/Button";
import { ConfirmModal } from "@/components/common/ConfirmModal";
import { useAppAlert } from "@/hooks/useAppAlert";
import { useUserStore } from "@/store/useUserStore";
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

const MAX_LENGTH = 20;

export default function ChangeNicknameScreen() {
  const router = useRouter();
  const user = useUserStore((s) => s.user);
  const setUser = useUserStore((s) => s.setUser);

  const currentNickname = user?.nickname ?? "";
  const { show: showAlert, hide: hideAlert, config: alertConfig, isVisible: alertVisible } = useAppAlert();

  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);

  const trimmed = value.trim();
  const isValid = trimmed.length >= 2 && trimmed !== currentNickname;

  const handleSave = async () => {
    if (!isValid) return;
    setLoading(true);
    try {
      const updated = await updateNickname(trimmed);
      setUser(updated);
      showAlert("완료", "닉네임이 변경되었습니다.", [
        { text: "확인", onPress: () => router.back() },
      ]);
    } catch {
      showAlert("오류", "닉네임 변경에 실패했습니다. 다시 시도해주세요.");
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
        <Text style={styles.title}>닉네임 변경</Text>
        <View style={styles.backBtn} />
      </View>

      <View style={styles.body}>
        {/* 현재 닉네임 */}
        <Text style={styles.label}>현재 닉네임</Text>
        <View style={styles.currentBox}>
          <Text style={styles.currentText}>{currentNickname}</Text>
        </View>

        {/* 새 닉네임 입력 */}
        <Text style={[styles.label, { marginTop: 24 }]}>새 닉네임</Text>
        <View style={styles.inputWrap}>
          <TextInput
            style={styles.input}
            placeholder="새 닉네임을 입력하세요"
            placeholderTextColor="#555"
            value={value}
            onChangeText={(t) => setValue(t.slice(0, MAX_LENGTH))}
            autoFocus
            returnKeyType="done"
            onSubmitEditing={handleSave}
          />
          <Text style={styles.counter}>
            {value.length}/{MAX_LENGTH}
          </Text>
        </View>

        {/* 저장 버튼 */}
        {loading ? (
          <ActivityIndicator
            color="#58CC02"
            style={{ marginTop: 20 }}
          />
        ) : (
          <Button
            label="저장하기"
            onPress={handleSave}
            disabled={!isValid}
            style={{ marginTop: 20 }}
          />
        )}

        {/* 주의사항 */}
        <View style={styles.notice}>
          <Text style={styles.noticeTitle}>주의사항</Text>
          <Text style={styles.noticeItem}>• 닉네임은 2~20자 이내로 입력해주세요.</Text>
          <Text style={styles.noticeItem}>• 공백만으로 구성된 닉네임은 사용할 수 없습니다.</Text>
          <Text style={styles.noticeItem}>• 변경 후에도 재변경이 가능합니다.</Text>
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

  currentBox: {
    backgroundColor: "#242628",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  currentText: { color: "#fff", fontSize: 16, fontWeight: "600" },

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
  input: {
    flex: 1,
    color: "#fff",
    fontSize: 16,
    paddingVertical: 10,
  },
  counter: { color: "#555", fontSize: 12 },

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
