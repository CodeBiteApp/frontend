import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const REWARDS = [
  { id: "1", title: "첫 퀴즈 완료", description: "처음으로 퀴즈를 완료했어요!", points: 100, unlocked: true },
  { id: "2", title: "연속 3일", description: "3일 연속으로 퀴즈를 풀었어요!", points: 200, unlocked: true },
  { id: "3", title: "만점왕", description: "퀴즈에서 만점을 받았어요!", points: 500, unlocked: false },
  { id: "4", title: "퀴즈 마스터", description: "모든 카테고리를 완료했어요!", points: 1000, unlocked: false },
];

export default function RewardScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>퀴즈 보상</Text>
      <View style={styles.pointBox}>
        <Text style={styles.pointLabel}>보유 포인트</Text>
        <Text style={styles.pointValue}>300 P</Text>
      </View>
      {REWARDS.map((reward) => (
        <View key={reward.id} style={[styles.card, !reward.unlocked && styles.locked]}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>{reward.unlocked ? "✅" : "🔒"} {reward.title}</Text>
            <Text style={styles.points}>+{reward.points}P</Text>
          </View>
          <Text style={styles.desc}>{reward.description}</Text>
          {reward.unlocked && (
            <TouchableOpacity style={styles.claimBtn}>
              <Text style={styles.claimText}>수령하기</Text>
            </TouchableOpacity>
          )}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  content: { paddingTop: 60, paddingHorizontal: 20, paddingBottom: 40 },
  title: { fontSize: 28, fontWeight: "bold", textAlign: "center", color: "#1a1a1a", marginBottom: 20 },
  pointBox: {
    backgroundColor: "#0a7ea4",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    marginBottom: 24,
  },
  pointLabel: { color: "rgba(255,255,255,0.8)", fontSize: 14 },
  pointValue: { color: "#fff", fontSize: 36, fontWeight: "bold", marginTop: 4 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  locked: { opacity: 0.5 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  cardTitle: { fontSize: 16, fontWeight: "600", color: "#1a1a1a" },
  points: { fontSize: 14, fontWeight: "700", color: "#f5a623" },
  desc: { fontSize: 13, color: "#888", marginTop: 6 },
  claimBtn: {
    marginTop: 12,
    backgroundColor: "#0a7ea4",
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: "center",
  },
  claimText: { color: "#fff", fontWeight: "600" },
});
