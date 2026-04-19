import { useUserStore } from "@/store/useUserStore";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// ── 목 통계 (실제 API 연결 시 교체) ─────────────────────────
const MOCK_STATS = {
  rank: 7,
  score: 2200,
  dotori: 300,
  currentStreak: 5,
  longestStreak: 12,
  solvedCount: 48,
};

// ── 배지 목록 ─────────────────────────────────────────────
const BADGES = [
  { id: "1", emoji: "🔥", label: "3일 연속" },
  { id: "2", emoji: "💡", label: "힌트왕" },
  { id: "3", emoji: "🎯", label: "첫 만점" },
  { id: "4", emoji: "🏅", label: "퀴즈 10회" },
];

// ── 아바타 배경색 팔레트 ──────────────────────────────────
const AVATAR_COLORS = [
  "#58CC02","#1CB0F6","#FF9600","#CE82FF","#FF4B4B","#00CD9C",
];
function avatarColor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

// ── 설정 행 ───────────────────────────────────────────────
function SettingRow({
  label,
  right,
  onPress,
  danger,
}: {
  label: string;
  right?: React.ReactNode;
  onPress?: () => void;
  danger?: boolean;
}) {
  return (
    <TouchableOpacity
      style={styles.settingRow}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      disabled={!onPress && !right}
    >
      <Text style={[styles.settingLabel, danger && styles.settingDanger]}>{label}</Text>
      {right ?? <Text style={styles.settingArrow}>›</Text>}
    </TouchableOpacity>
  );
}

// ── 통계 카드 ─────────────────────────────────────────────
function StatCard({ value, label, accent }: { value: string | number; label: string; accent?: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={[styles.statValue, accent ? { color: accent } : {}]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

// ─────────────────────────────────────────────────────────
export default function SettingsScreen() {
  const router  = useRouter();
  const user    = useUserStore((s) => s.user);
  const logout  = useUserStore((s) => s.logout);

  const [notification, setNotification] = useState(true);
  const [sound, setSound]               = useState(true);
  const [darkMode, setDarkMode]         = useState(true);

  const displayName = user?.nickname?.trim() || user?.email?.split("@")[0] || "사용자";
  const email       = user?.email ?? "";
  const initials    = displayName.charAt(0).toUpperCase();
  const bgColor     = avatarColor(displayName);

  const handleLogout = () => {
    Alert.alert("로그아웃", "정말 로그아웃 하시겠어요?", [
      { text: "취소", style: "cancel" },
      {
        text: "로그아웃",
        style: "destructive",
        onPress: () => void logout().then(() => router.replace("/(auth)/login")),
      },
    ]);
  };

  const handleResetProgress = () => {
    Alert.alert("진행 초기화", "모든 학습 기록이 삭제됩니다. 계속하시겠어요?", [
      { text: "취소", style: "cancel" },
      { text: "초기화", style: "destructive", onPress: () => {} },
    ]);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* ── 프로필 헤더 ── */}
      <View style={styles.profileHeader}>
        <View style={[styles.avatar, { backgroundColor: bgColor }]}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <Text style={styles.displayName}>{displayName}</Text>
        {email ? <Text style={styles.email}>{email}</Text> : null}

        {/* 도토리 잔액 뱃지 */}
        <View style={styles.dotoriRow}>
          <Image
            source={require("@/assets/images/dotori-1.png")}
            style={styles.dotoriImg}
            resizeMode="contain"
          />
          <Text style={styles.dotoriCount}>{MOCK_STATS.dotori} 도토리</Text>
        </View>
      </View>

      {/* ── 통계 카드 ── */}
      <View style={styles.statsRow}>
        <StatCard value={`${MOCK_STATS.rank}위`}  label="현재 랭킹"  accent="#FFC800" />
        <StatCard value={`${MOCK_STATS.currentStreak}일`} label="연속 학습" accent="#FF6B00" />
        <StatCard value={MOCK_STATS.solvedCount}  label="푼 문제"   accent="#1CB0F6" />
      </View>

      {/* ── 스트릭 바 ── */}
      <View style={styles.card}>
        <View style={styles.streakHeader}>
          <Text style={styles.cardTitle}>🔥 학습 스트릭</Text>
          <Text style={styles.streakBest}>최장 {MOCK_STATS.longestStreak}일</Text>
        </View>
        <View style={styles.streakDots}>
          {Array.from({ length: 7 }).map((_, i) => {
            const active = i < MOCK_STATS.currentStreak % 7 || MOCK_STATS.currentStreak >= 7;
            return (
              <View
                key={i}
                style={[styles.dot, active && styles.dotActive]}
              />
            );
          })}
        </View>
        <Text style={styles.streakSub}>이번 주 {Math.min(MOCK_STATS.currentStreak, 7)}/7일 완료</Text>
      </View>

      {/* ── 배지 ── */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🏆 획득 배지</Text>
        <View style={styles.badgeRow}>
          {BADGES.map((b) => (
            <View key={b.id} style={styles.badge}>
              <Text style={styles.badgeEmoji}>{b.emoji}</Text>
              <Text style={styles.badgeLabel}>{b.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* ── 알림 설정 ── */}
      <Text style={styles.section}>알림 &amp; 소리</Text>
      <View style={styles.settingGroup}>
        <SettingRow
          label="퀴즈 알림"
          right={<Switch value={notification} onValueChange={setNotification} trackColor={{ true: "#FFC800" }} />}
        />
        <View style={styles.divider} />
        <SettingRow
          label="효과음"
          right={<Switch value={sound} onValueChange={setSound} trackColor={{ true: "#FFC800" }} />}
        />
        <View style={styles.divider} />
        <SettingRow
          label="다크 모드"
          right={<Switch value={darkMode} onValueChange={setDarkMode} trackColor={{ true: "#FFC800" }} />}
        />
      </View>

      {/* ── 계정 설정 ── */}
      <Text style={styles.section}>계정</Text>
      <View style={styles.settingGroup}>
        <SettingRow label="닉네임 변경" onPress={() => {}} />
        <View style={styles.divider} />
        <SettingRow label="비밀번호 변경" onPress={() => {}} />
        <View style={styles.divider} />
        <SettingRow label="진행 초기화" onPress={handleResetProgress} danger />
      </View>

      {/* ── 앱 정보 ── */}
      <Text style={styles.section}>앱 정보</Text>
      <View style={styles.settingGroup}>
        <SettingRow
          label="버전"
          right={<Text style={styles.settingValue}>1.0.0</Text>}
        />
        <View style={styles.divider} />
        <SettingRow label="이용약관" onPress={() => {}} />
        <View style={styles.divider} />
        <SettingRow label="개인정보 처리방침" onPress={() => {}} />
      </View>

      {/* ── 로그아웃 ── */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
        <Text style={styles.logoutText}>로그아웃</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// ─────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#191A1C" },
  content:   { paddingTop: 56, paddingBottom: 48, paddingHorizontal: 20 },

  // 프로필 헤더
  profileHeader: {
    alignItems: "center",
    marginBottom: 24,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  avatarText:   { color: "#fff", fontSize: 32, fontWeight: "800" },
  displayName:  { color: "#fff", fontSize: 22, fontWeight: "800", marginBottom: 4 },
  email:        { color: "#888", fontSize: 13, marginBottom: 12 },
  dotoriRow:    { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#242628", borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6 },
  dotoriImg:    { width: 20, height: 20 },
  dotoriCount:  { color: "#FFC800", fontSize: 14, fontWeight: "700" },

  // 통계
  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 14,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#242628",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },
  statValue: { color: "#fff", fontSize: 20, fontWeight: "800", marginBottom: 4 },
  statLabel: { color: "#888", fontSize: 11 },

  // 카드
  card: {
    backgroundColor: "#242628",
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
  },
  cardTitle: { color: "#fff", fontSize: 15, fontWeight: "700", marginBottom: 14 },

  // 스트릭
  streakHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  streakBest:   { color: "#aaa", fontSize: 12 },
  streakDots: { flexDirection: "row", gap: 8, marginBottom: 10 },
  dot:        { flex: 1, height: 8, borderRadius: 4, backgroundColor: "#333537" },
  dotActive:  { backgroundColor: "#FF6B00" },
  streakSub:  { color: "#888", fontSize: 12 },

  // 배지
  badgeRow:    { flexDirection: "row", gap: 10 },
  badge:       { flex: 1, backgroundColor: "#1e2022", borderRadius: 12, padding: 10, alignItems: "center", gap: 4 },
  badgeEmoji:  { fontSize: 22 },
  badgeLabel:  { color: "#aaa", fontSize: 10, textAlign: "center" },

  // 섹션 헤더
  section: {
    color: "#666",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginTop: 20,
    marginBottom: 8,
    marginLeft: 4,
  },

  // 설정 그룹
  settingGroup: {
    backgroundColor: "#242628",
    borderRadius: 16,
    overflow: "hidden",
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 15,
  },
  settingLabel:  { color: "#fff", fontSize: 15 },
  settingDanger: { color: "#FF4B4B" },
  settingArrow:  { color: "#555", fontSize: 20 },
  settingValue:  { color: "#888", fontSize: 14 },
  divider: { height: 1, backgroundColor: "#2e3032", marginHorizontal: 16 },

  // 로그아웃
  logoutBtn: {
    marginTop: 28,
    backgroundColor: "#242628",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FF4B4B33",
  },
  logoutText: { color: "#FF4B4B", fontSize: 15, fontWeight: "700" },
});
