import Acorn from "@/components/charactor/Acorn";
import { RankUser, TOP3_COLORS, TOP3_HEIGHTS, TOP3_LABELS } from "@/constants/ranking";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function RankingList({ data }: { data: RankUser[] }) {
  const me   = data.find((u) => u.isMe);
  const top3 = data.slice(0, 3);
  const rest = data.slice(3).filter((u) => !u.isMe);

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
          return (
            <View key={user.rank} style={styles.podiumItem}>
              <Text style={styles.podiumName}>{user.name}</Text>
              <View style={styles.podiumDotoriRow}>
                <Acorn width={16} height={16} />
                <Text style={styles.podiumDotori}>{user.dotori}</Text>
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
        {rest.map((user) => (
          <View key={user.rank} style={styles.row}>
            <Text style={styles.rowRank}>{user.rank}</Text>
            <Text style={styles.rowName}>{user.name}</Text>
            <View style={styles.rowRight}>
              <Acorn width={16} height={16} />
              <Text style={styles.rowDotori}>{user.dotori}</Text>
              <Text style={styles.rowScore}>{user.score.toLocaleString()}점</Text>
            </View>
          </View>
        ))}
      </View>

      {/* 내 순위 고정 카드 */}
      {me && (
        <View style={styles.meCard}>
          <View style={styles.meLeft}>
            <Text style={styles.meRank}>{me.rank}위</Text>
            <Text style={styles.meName}>나  ({me.name})</Text>
          </View>
          <View style={styles.rowRight}>
            <Acorn width={16} height={16} />
            <Text style={styles.rowDotori}>{me.dotori}</Text>
            <Text style={styles.rowScore}>{me.score.toLocaleString()}점</Text>
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
  podiumItem:      { flex: 1, alignItems: "center" },
  podiumName:      { color: "#fff", fontSize: 13, fontWeight: "700", marginBottom: 2, textAlign: "center" },
  podiumDotoriRow: { flexDirection: "row", alignItems: "center", gap: 3, marginBottom: 6 },
  podiumDotori:    { color: "#FFC800", fontSize: 12, fontWeight: "700" },
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
  rowRank:   { color: "#888", fontSize: 14, fontWeight: "700", width: 28 },
  rowName:   { flex: 1, color: "#fff", fontSize: 15, fontWeight: "600" },
  rowRight:  { flexDirection: "row", alignItems: "center", gap: 4 },
  rowDotori: { color: "#FFC800", fontSize: 13, fontWeight: "700", marginRight: 8 },
  rowScore:  { color: "#aaa", fontSize: 13 },

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
