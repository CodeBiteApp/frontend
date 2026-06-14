import { getGlobalRanking } from "@/api/ranking";
import { scheduleQuizNotification } from "@/lib/notifications";
import Acorn from "@/components/charactor/Acorn";
import { Button } from "@/components/common/Button";
import { ConfirmModal } from "@/components/common/ConfirmModal";
import FriendSearchModal from "@/components/social/FriendSearchModal";
import { useAppAlert } from "@/hooks/useAppAlert";
import { useUserStore } from "@/store/useUserStore";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useState, useCallback, useEffect } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Linking,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// ── 아바타 배경색 팔레트 ──────────────────────────────────
const AVATAR_COLORS = [
  "#58CC02",
  "#1CB0F6",
  "#FF9600",
  "#CE82FF",
  "#FF4B4B",
  "#00CD9C",
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
      <Text style={[styles.settingLabel, danger && styles.settingDanger]}>
        {label}
      </Text>
      {right ?? <Text style={styles.settingArrow}>›</Text>}
    </TouchableOpacity>
  );
}

// ── 통계 카드 ─────────────────────────────────────────────
function StatCard({
  value,
  label,
  accent,
}: {
  value: string | number;
  label: string;
  accent?: string;
}) {
  return (
    <View style={styles.statCard}>
      <Text style={[styles.statValue, accent ? { color: accent } : {}]}>
        {value}
      </Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

// ─────────────────────────────────────────────────────────
export default function SettingsScreen({ isFocused }: { isFocused?: boolean }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const user = useUserStore((s) => s.user);
  const logout = useUserStore((s) => s.logout);
  const isSocialLogin = useUserStore((s) => s.isSocialLogin);
  const refreshUser = useUserStore((s) => s.refreshUser);

  const { show: showAlert, hide: hideAlert, config: alertConfig, isVisible: alertVisible } = useAppAlert();

  const [notification, setNotification] = useState(true);
  const [sound, setSound] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [showFriendSearch, setShowFriendSearch] = useState(false);
  const [myRank, setMyRank] = useState<number | null>(null);

  const displayName =
    user?.nickname?.trim() || user?.email?.split("@")[0] || "사용자";
  const email = user?.email ?? "";
  const initials = displayName.charAt(0).toUpperCase();
  const bgColor = avatarColor(displayName);

  const fetchMyRank = async () => {
    try {
      const res = await getGlobalRanking();
      setMyRank(res.myRank);
    } catch (error) {
      console.error("Failed to fetch my rank on settings", error);
    }
  };

  const handleFocus = useCallback(() => {
    void refreshUser();
    void fetchMyRank();
  }, [refreshUser]);

  useFocusEffect(
    useCallback(() => {
      handleFocus();
    }, [handleFocus])
  );

  useEffect(() => {
    if (isFocused) {
      handleFocus();
    }
  }, [isFocused, handleFocus]);

  const handleLogout = () => {
    showAlert("로그아웃", "정말 로그아웃 하시겠어요?", [
      { text: "취소", style: "cancel" },
      {
        text: "로그아웃",
        style: "destructive",
        onPress: () => void logout().then(() => router.replace("/(auth)/login")),
      },
    ]);
  };

  return (
    <>
    <ConfirmModal
      visible={alertVisible}
      title={alertConfig?.title ?? ""}
      message={alertConfig?.message}
      buttons={alertConfig?.buttons}
      onDismiss={hideAlert}
    />
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 16 }]}
      showsVerticalScrollIndicator={false}
    >
      {/* ── 프로필 헤더 ── */}
      <View style={styles.profileHeader}>
        <View style={[styles.avatar, { backgroundColor: bgColor }]}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <Text style={styles.displayName}>{displayName}</Text>
        {email ? <Text style={styles.email}>{email}</Text> : null}
        {/* 친구 코드 및 도토리 배지 가로 배치 */}
        <View style={styles.badgeContainer}>
          {user?.userCode ? (
            <View style={styles.codeBadge}>
              <Text style={styles.codeLabel}>친구 코드</Text>
              <Text style={styles.codeValue}>{user.userCode}</Text>
            </View>
          ) : null}

          <View style={styles.dotoriRow}>
            <Acorn width={20} height={20} />
            <Text style={styles.dotoriCount}>{user?.dotori || 0} 도토리</Text>
          </View>
        </View>
      </View>

      {/* ── 통계 카드 ── */}
      <View style={styles.statsRow}>
        <StatCard
          value={myRank !== null ? `${myRank}위` : "-위"}
          label="현재 랭킹"
          accent="#FFC800"
        />
        <StatCard
          value={`${user?.currentStreak || 0}일`}
          label="연속 학습"
          accent="#FF6B00"
        />
        <StatCard
          value={user?.studiedConceptCount || 0}
          label="푼 문제"
          accent="#1CB0F6"
        />
      </View>

      {/* ── 스트릭 바 ── */}
      <View style={styles.card}>
        <View style={styles.streakHeader}>
          <Text style={styles.cardTitle}>🔥 학습 스트릭</Text>
          <Text style={styles.streakBest}>
            최장 {user?.longestStreak || 0}일
          </Text>
        </View>
        <View style={styles.streakDots}>
          {Array.from({ length: 7 }).map((_, i) => {
            const currentStreak = user?.currentStreak || 0;
            const active = i < currentStreak % 7 || currentStreak >= 7;
            return (
              <View key={i} style={[styles.dot, active && styles.dotActive]} />
            );
          })}
        </View>
        <Text style={styles.streakSub}>
          이번 주 {Math.min(user?.currentStreak || 0, 7)}/7일 완료
        </Text>
      </View>

      <FriendSearchModal
        visible={showFriendSearch}
        onClose={() => setShowFriendSearch(false)}
      />

      {/* ── 친구 찾기 버튼 ── */}
      <TouchableOpacity
        style={styles.findFriendBtn}
        onPress={() => setShowFriendSearch(true)}
        activeOpacity={0.85}
        accessibilityLabel="친구 찾기"
      >
        <Text style={styles.findFriendEmoji}>👥</Text>
        <View style={styles.findFriendTextBox}>
          <Text style={styles.findFriendTitle}>친구 찾기</Text>
          <Text style={styles.findFriendSub}>
            닉네임·코드로 팔로우할 유저를 검색해보세요
          </Text>
        </View>
        <Text style={styles.findFriendArrow}>›</Text>
      </TouchableOpacity>

      {/* ── 알림 설정 ── */}
      <Text style={styles.section}>알림 &amp; 소리</Text>
      <View style={styles.settingGroup}>
        <SettingRow
          label="퀴즈 알림"
          right={
            <Switch
              value={notification}
              onValueChange={setNotification}
              trackColor={{ true: "#FFC800" }}
            />
          }
        />
        <View style={styles.divider} />
        <SettingRow
          label="효과음"
          right={
            <Switch
              value={sound}
              onValueChange={setSound}
              trackColor={{ true: "#FFC800" }}
            />
          }
        />
        <View style={styles.divider} />
        <SettingRow
          label="다크 모드"
          right={
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              trackColor={{ true: "#FFC800" }}
            />
          }
        />
        <View style={styles.divider} />
        <SettingRow
          label="퀴즈 알림 테스트 (5초 후)"
          onPress={async () => {
            const ok = await scheduleQuizNotification(5);
            if (ok) showAlert("알림 예약됨", "5초 후 알림이 표시됩니다.\n앱을 백그라운드로 내려보세요.");
            else showAlert("권한 없음", "설정에서 알림을 허용해주세요.");
          }}
        />
      </View>

      {/* ── 계정 설정 ── */}
      <Text style={styles.section}>계정</Text>
      <View style={styles.settingGroup}>
        <SettingRow
          label="닉네임 변경"
          onPress={() => router.push("/change-nickname")}
        />
        <View style={styles.divider} />
        <SettingRow
          label="비밀번호 변경"
          onPress={isSocialLogin ? undefined : () => router.push("/change-password")}
          right={
            isSocialLogin ? (
              <Text style={styles.settingDisabled}>소셜 로그인</Text>
            ) : undefined
          }
        />
      </View>

      {/* ── 앱 정보 ── */}
      <Text style={styles.section}>앱 정보</Text>
      <View style={styles.settingGroup}>
        <SettingRow
          label="버전"
          right={<Text style={styles.settingValue}>1.0.0</Text>}
        />
        <View style={styles.divider} />
        <SettingRow label="이용약관" onPress={() => Linking.openURL("https://codebite-info.netlify.app/#/terms")} />
        <View style={styles.divider} />
        <SettingRow label="개인정보 처리방침" onPress={() => Linking.openURL("https://codebite-info.netlify.app/#/privacy")} />
        <View style={styles.divider} />
        <SettingRow label="사용된 오픈소스" onPress={() => Linking.openURL("https://codebite-info.netlify.app/#/oss")} />
      </View>

      {/* ── 로그아웃 ── */}
      <Button
        label="로그아웃"
        onPress={handleLogout}
        variant="danger"
        style={{ marginTop: 28, paddingVertical: 16 }}
        textStyle={{ fontSize: 15 }}
      />
    </ScrollView>
    </>
  );
}

// ─────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#191A1C" },
  content: { paddingTop: 56, paddingBottom: 48, paddingHorizontal: 20 },

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
  avatarText: { color: "#fff", fontSize: 32, fontWeight: "800" },
  displayName: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 4,
  },
  email: { color: "#888", fontSize: 13, marginBottom: 12 },
  dotoriRow: {
    flex: 1,
    height: 40,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#2e3032",
    borderRadius: 20,
    paddingHorizontal: 12,
  },
  dotoriImg: { width: 20, height: 20 },
  dotoriCount: { color: "#FFC800", fontSize: 13, fontWeight: "700" },
  codeBadge: {
    flex: 1,
    height: 40,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2e3032",
    borderRadius: 20,
    paddingHorizontal: 12,
    gap: 6,
  },
  badgeContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginTop: 12,
    width: "100%",
    maxWidth: 320,
  },
  codeLabel: { color: "#888", fontSize: 13, fontWeight: "600" },
  codeValue: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 1,
  },

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
  statValue: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 4,
  },
  statLabel: { color: "#888", fontSize: 11 },

  // 카드
  card: {
    backgroundColor: "#242628",
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
  },
  cardTitle: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 14,
  },

  // 스트릭
  streakHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  streakBest: { color: "#aaa", fontSize: 12 },
  streakDots: { flexDirection: "row", gap: 8, marginBottom: 10 },
  dot: { flex: 1, height: 8, borderRadius: 4, backgroundColor: "#333537" },
  dotActive: { backgroundColor: "#FF6B00" },
  streakSub: { color: "#888", fontSize: 12 },

  // 배지
  badgeRow: { flexDirection: "row", gap: 10 },
  badge: {
    flex: 1,
    backgroundColor: "#1e2022",
    borderRadius: 12,
    padding: 10,
    alignItems: "center",
    gap: 4,
  },
  badgeEmoji: { fontSize: 22 },
  badgeLabel: { color: "#aaa", fontSize: 10, textAlign: "center" },
  badgeLocked: {
    backgroundColor: "#161719",
    opacity: 0.4,
  },
  emojiLocked: {
    opacity: 0.6,
  },
  labelLocked: {
    color: "#555",
  },

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
  settingLabel: { color: "#fff", fontSize: 15 },
  settingDanger: { color: "#FF4B4B" },
  settingArrow: { color: "#555", fontSize: 20 },
  settingValue: { color: "#888", fontSize: 14 },
  settingDisabled: { color: "#555", fontSize: 13 },
  divider: { height: 1, backgroundColor: "#2e3032", marginHorizontal: 16 },

  // 친구 찾기 버튼
  findFriendBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1E2A1A",
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
    marginBottom: 4,
    borderWidth: 1.5,
    borderColor: "#2E5C20",
    gap: 12,
  },
  findFriendEmoji: { fontSize: 26 },
  findFriendTextBox: { flex: 1 },
  findFriendTitle: {
    color: "#58CC02",
    fontSize: 15,
    fontWeight: "800",
    marginBottom: 2,
  },
  findFriendSub: { color: "#888", fontSize: 12 },
  findFriendArrow: { color: "#58CC02", fontSize: 22, fontWeight: "700" },
});
