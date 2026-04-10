import { useUserStore } from "@/store/useUserStore";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";

export default function SettingsScreen() {
  const router = useRouter();
  const user = useUserStore((s) => s.user);
  const logout = useUserStore((s) => s.logout);
  const [notification, setNotification] = useState(true);
  const [sound, setSound] = useState(true);

  const displayName =
    user?.nickname?.trim() ||
    user?.email?.split("@")[0] ||
    "사용자";
  const avatarChar = displayName.charAt(0).toUpperCase();

  const handleLogout = () => {
    Alert.alert("로그아웃", "정말 로그아웃 하시겠어요?", [
      { text: "취소", style: "cancel" },
      {
        text: "로그아웃",
        style: "destructive",
        onPress: () => {
          void logout().then(() => router.replace("/(auth)/login"));
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>설정</Text>

      <View style={styles.profileBox}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{avatarChar}</Text>
        </View>
        <View>
          <Text style={styles.username}>{displayName}</Text>
          <Text style={styles.userLevel}>
            연속 {user?.currentStreak ?? 0}일 · 쿠키 {user?.cookie ?? 0}
          </Text>
        </View>
      </View>

      <Text style={styles.section}>알림</Text>
      <View style={styles.row}>
        <Text style={styles.label}>퀴즈 알림</Text>
        <Switch value={notification} onValueChange={setNotification} />
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>효과음</Text>
        <Switch value={sound} onValueChange={setSound} />
      </View>

      <Text style={styles.section}>계정</Text>
      <TouchableOpacity style={styles.row}>
        <Text style={styles.label}>닉네임 변경</Text>
        <Text style={styles.arrow}>›</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.row}>
        <Text style={styles.label}>진행 초기화</Text>
        <Text style={styles.arrow}>›</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.row, styles.logoutRow]} onPress={handleLogout}>
        <Text style={styles.logoutText}>로그아웃</Text>
      </TouchableOpacity>

      <Text style={styles.section}>정보</Text>
      <View style={styles.row}>
        <Text style={styles.label}>버전</Text>
        <Text style={styles.value}>1.0.0</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  content: { paddingTop: 60, paddingHorizontal: 20, paddingBottom: 40 },
  title: { fontSize: 28, fontWeight: "bold", textAlign: "center", color: "#1a1a1a", marginBottom: 24 },
  profileBox: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#0a7ea4",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: { color: "#fff", fontSize: 20, fontWeight: "bold" },
  username: { fontSize: 18, fontWeight: "600", color: "#1a1a1a" },
  userLevel: { fontSize: 13, color: "#888", marginTop: 2 },
  section: { fontSize: 13, fontWeight: "600", color: "#999", marginBottom: 8, marginTop: 8, textTransform: "uppercase" },
  row: {
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  logoutRow: { justifyContent: "center" },
  logoutText: { fontSize: 16, color: "#ea4335", fontWeight: "600" },
  label: { fontSize: 16, color: "#1a1a1a" },
  arrow: { fontSize: 20, color: "#ccc" },
  value: { fontSize: 14, color: "#999" },
});
