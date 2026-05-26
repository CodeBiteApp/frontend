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
  const isGoldBanner = user.equippedBannerId === 2;
  const isNeonBanner = user.equippedBannerId === 3;

  return (
    <View style={[
      styles.card,
      isGoldBanner && styles.cardGold,
      isNeonBanner && styles.cardNeon
    ]}>
      {/* 아바타 */}
      <View style={[
        styles.avatar,
        { backgroundColor: bg },
        isGoldBanner && styles.avatarGold,
        isNeonBanner && styles.avatarNeon
      ]}>
        <Text style={styles.avatarText}>{initials}</Text>
      </View>

      {/* 유저 정보 */}
      <View style={styles.info}>
        <View style={styles.nicknameRow}>
          <Text style={styles.nickname}>{user.nickname}</Text>
          {isGoldBanner && <Text style={styles.badgeEmoji}>👑</Text>}
          {isNeonBanner && <Text style={styles.badgeEmoji}>✨</Text>}
        </View>
        <View style={styles.metaRow}>
          <Text style={styles.code}># {user.userCode}</Text>
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
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  cardGold: {
    backgroundColor: "#2e2718",
    borderColor: "#FFD700",
    shadowColor: "#FFD700",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 3,
  },
  cardNeon: {
    backgroundColor: "#1c232c",
    borderColor: "#1CB0F6",
    shadowColor: "#1CB0F6",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 3,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  avatarGold: {
    borderColor: "#FFD700",
  },
  avatarNeon: {
    borderColor: "#1CB0F6",
  },
  avatarText: { color: "#fff", fontSize: 18, fontWeight: "800" },

  info: { flex: 1 },
  nicknameRow: { flexDirection: "row", alignItems: "center", gap: 5, marginBottom: 3 },
  nickname: { color: "#fff", fontSize: 15, fontWeight: "700" },
  badgeEmoji: { fontSize: 13 },
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
