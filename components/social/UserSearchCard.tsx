import { followUser, unfollowUser } from "@/api/social";
import type { UserSearchResult } from "@/types/social";
import React, { useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// 닉네임 해시 → 아바타 색상
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
  for (let i = 0; i < name.length; i++)
    h = name.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

// userCode 마스킹: 앞 3자리만 표시 (e.g. "A1B2C3" → "A1B···")
function maskCode(code: string) {
  if (!code || code.length <= 3) return code;
  return `${code.slice(0, 3)}···`;
}

type Props = {
  user: UserSearchResult;
  /** 이미 팔로우 중인지 여부 (선택). 없으면 "팔로우" 버튼만 표시 */
  initialFollowing?: boolean;
};

export function UserSearchCard({ user, initialFollowing = false }: Props) {
  const [following, setFollowing] = useState(initialFollowing);
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    if (loading) return;
    setLoading(true);
    try {
      if (following) {
        await unfollowUser(user.userId);
        setFollowing(false);
      } else {
        await followUser(user.userId);
        setFollowing(true);
      }
    } catch {
      // 에러는 조용히 무시 (토스트 연동 필요 시 추가)
    } finally {
      setLoading(false);
    }
  };

  const initials = user.nickname.charAt(0).toUpperCase();
  const bg = avatarColor(user.nickname);

  return (
    <View style={styles.card}>
      {/* 아바타 */}
      <View style={[styles.avatar, { backgroundColor: bg }]}>
        <Text style={styles.avatarText}>{initials}</Text>
      </View>

      {/* 유저 정보 */}
      <View style={styles.info}>
        <Text style={styles.nickname}>{user.nickname}</Text>
        <View style={styles.metaRow}>
          <Text style={styles.code}># {maskCode(user.userCode)}</Text>
          <Text style={styles.dot}>·</Text>
          <Text style={styles.streak}>🔥 {user.currentStreak}일</Text>
        </View>
      </View>

      {/* 팔로우 버튼 */}
      <TouchableOpacity
        style={[styles.followBtn, following && styles.followingBtn]}
        onPress={handleToggle}
        activeOpacity={0.75}
        disabled={loading}
        accessibilityLabel={following ? "언팔로우" : "팔로우"}
      >
        {loading ? (
          <ActivityIndicator size="small" color={following ? "#888" : "#191A1C"} />
        ) : (
          <Text style={[styles.followText, following && styles.followingText]}>
            {following ? "팔로잉" : "팔로우"}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#242628",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 10,
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  avatarText: { color: "#fff", fontSize: 18, fontWeight: "800" },

  info: { flex: 1 },
  nickname: { color: "#fff", fontSize: 15, fontWeight: "700", marginBottom: 3 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  code: { color: "#888", fontSize: 12, fontFamily: "monospace" },
  dot: { color: "#555", fontSize: 12 },
  streak: { color: "#FF9600", fontSize: 12, fontWeight: "600" },

  followBtn: {
    backgroundColor: "#FFC800",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    minWidth: 72,
    alignItems: "center",
  },
  followingBtn: { backgroundColor: "#2e3032" },
  followText: { color: "#191A1C", fontSize: 13, fontWeight: "700" },
  followingText: { color: "#888" },
});
