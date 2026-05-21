import React from "react";
import { StyleSheet, Text, View } from "react-native";

type Props = {
  correctCount: number;
  total: number;
};

export function RetryBanner({ correctCount, total }: Props) {
  const progress = total > 0 ? correctCount / total : 0;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>📝  오답 노트</Text>
      <View style={styles.right}>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${progress * 100}%` }]} />
        </View>
        <Text style={styles.count}>
          {correctCount} / {total}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FF9600",
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  label: { color: "#fff", fontWeight: "700", fontSize: 14 },
  right: { flexDirection: "row", alignItems: "center", gap: 10 },
  track: {
    width: 80,
    height: 6,
    backgroundColor: "rgba(255,255,255,0.35)",
    borderRadius: 3,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    backgroundColor: "#fff",
    borderRadius: 3,
  },
  count: { color: "#fff", fontWeight: "700", fontSize: 13 },
});
