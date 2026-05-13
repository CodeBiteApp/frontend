import { TOP3_COLORS, TOP3_HEIGHTS, TOP3_LABELS } from "@/constants/ranking";
import type { RankingEntry } from "@/types/ranking";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

type Props = {
  rankings: RankingEntry[];
  myUserId: number | null;
  myRank: number | null;
};

export default function RankingList({ rankings, myUserId, myRank }: Props) {
  const top3    = rankings.slice(0, 3);
  const rest    = rankings.slice(3).filter((u) => u.userId !== myUserId);
  const meEntry = rankings.find((u) => u.userId === myUserId) ?? null;

  return (
    <>
      {/* 시상대 TOP 3 */}
      <View style={styles.podiumRow}>
        {[1, 0, 2].map((idx) => {
          if (!top3[idx]) return null;
          const user  = top3[idx];
          const color = TOP3_COLORS[idx];
          const label = TOP3_LABELS[idx];
          const barH  = TOP3_HEIGHTS[idx];
          const isMe  = user.userId === myUserId;
          return (
            <View key={user.userId} style={styles.podiumItem}>
              <Text style={[styles.podiumName, isMe && styles.meHighlight]}>
                {isMe ? "나" : user.nickname}
              </Text>
              <View style={styles.podiumDotoriRow}>
                <Text style={styles.podiumStreakLabel}>🔥</Text>
                <Text style={styles.podiumDotori}>{user.currentStreak}</Text>
              </View>
              <View style={[styles.podiumBar, { height: barH, backgroundColor: color }]}>
                <Text style={styles.podiumLabel}>{label}</Text>
              </View>
            </View>
          );
        })}
      </View>

      {/* 4위~ 리스트 */}
      <View style={styles.listBox}>
        {rest.map((user) => {
          const isMe = user.userId === myUserId;
          return (
            <View key={user.userId} style={[styles.row, isMe && styles.rowMe]}>
              <Text style={[styles.rowRank, isMe && styles.meHighlight]}>{user.rank}</Text>
              <Text style={[styles.rowName, isMe && styles.meHighlight]}>
                {isMe ? `나 (${user.nickname})` : user.nickname}
              </Text>
              <View style={styles.rowRight}>
                <Text style={styles.streakIcon}>🔥</Text>
                <Text style={styles.rowDotori}>{user.currentStreak}</Text>
                <Text style={styles.rowScore}>{user.longestStreak}최장</Text>
              </View>
            </View>
          );
        })}
      </View>

      {/* 내 순위 고정 카드 (항상 하단 표시) */}
      {meEntry && (
        <View style={styles.meCard}>
          <View style={styles.meLeft}>
            <Text style={styles.meRank}>{myRank ?? meEntry.rank}위</Text>
            <Text style={styles.meName}>나 ({meEntry.nickname})</Text>
          </View>
          <View style={styles.rowRight}>
            <Text style={styles.streakIcon}>🔥</Text>
            <Text style={styles.rowDotori}>{meEntry.currentStreak}</Text>
            <Text style={styles.rowScore}>{meEntry.longestStreak}최장</Text>
          </View>
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  podiumRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "center",
    marginHorizontal: 20,
    marginBottom: 24,
    gap: 8,
  },
  podiumItem:        { flex: 1, alignItems: "center" },
  podiumName:        { color: "#fff", fontSize: 13, fontWeight: "700", marginBottom: 2, textAlign: "center" },
  podiumDotoriRow:   { flexDirection: "row", alignItems: "center", gap: 3, marginBottom: 6 },
  podiumStreakLabel: { fontSize: 14 },
  podiumDotori:      { color: "#FFC800", fontSize: 12, fontWeight: "700" },
  podiumBar: {
    width: "100%",
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  podiumLabel: { color: "#191A1C", fontSize: 14, fontWeight: "800", paddingVertical: 8 },

  listBox: {
    marginHorizontal: 20,
    backgroundColor: "#242628",
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 16,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#2e3032",
  },
  rowMe:       { backgroundColor: "#2C2A1E" },
  rowRank:     { color: "#888", fontSize: 14, fontWeight: "700", width: 28 },
  rowName:     { flex: 1, color: "#fff", fontSize: 15, fontWeight: "600" },
  rowRight:    { flexDirection: "row", alignItems: "center", gap: 4 },
  streakIcon:  { fontSize: 14 },
  rowDotori:   { color: "#FFC800", fontSize: 13, fontWeight: "700", marginRight: 8 },
  rowScore:    { color: "#aaa", fontSize: 13 },
  meHighlight: { color: "#FFC800" },

  meCard: {
    marginHorizontal: 20,
    backgroundColor: "#2C2A1E",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#FFC800",
  },
  meLeft: { flex: 1, flexDirection: "row", alignItems: "center", gap: 10 },
  meRank: { color: "#FFC800", fontSize: 16, fontWeight: "800" },
  meName: { color: "#fff", fontSize: 15, fontWeight: "700" },
});
