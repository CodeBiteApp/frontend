import Acorn from "@/components/charactor/Acorn";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

type Props = {
  position: string | null;
  streak: number;
  acornCount: number;
};

function positionLabel(pos: string | null): string {
  if (!pos) return "개발자";
  return pos.replace(" 개발자", "");
}

export default function UserInfoBar({ position, streak, acornCount }: Props) {
  return (
    <View style={styles.userInfoBar}>
      <View style={styles.positionBadge}>
        <Text style={styles.positionText}>💼 {positionLabel(position)}</Text>
      </View>
      <View style={styles.statsGroup}>
        <View style={styles.statItem}>
          <Text style={styles.streakEmoji}>🔥</Text>
          <Text style={styles.statValue}>{streak}</Text>
          <Text style={styles.statUnit}>일</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Acorn width={20} height={20} />
          <Text style={styles.statValue}>{acornCount}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  userInfoBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  positionBadge: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#58CC02",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  positionText: { color: "#58CC02", fontSize: 13, fontWeight: "700" },
  statsGroup: { flexDirection: "row", alignItems: "center", gap: 10 },
  statItem: { flexDirection: "row", alignItems: "center", gap: 3 },
  streakEmoji: { fontSize: 16 },
  statValue: { color: "#ffffff", fontSize: 15, fontWeight: "700" },
  statUnit: { color: "#888", fontSize: 12, fontWeight: "500" },
  statDivider: { width: 1, height: 16, backgroundColor: "#333537" },
});
