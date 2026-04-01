import React from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";

const MOCK_RANKING = [
  { rank: 1, name: "퀴즈왕", score: 980, emoji: "🥇" },
  { rank: 2, name: "지식인", score: 870, emoji: "🥈" },
  { rank: 3, name: "천재소년", score: 760, emoji: "🥉" },
  { rank: 4, name: "공부벌레", score: 650, emoji: "🏅" },
  { rank: 5, name: "나", score: 540, emoji: "🏅" },
];

export default function RankingScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>랭킹</Text>
      <FlatList
        data={MOCK_RANKING}
        keyExtractor={(item) => String(item.rank)}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={[styles.row, item.rank <= 3 && styles.topRow]}>
            <Text style={styles.emoji}>{item.emoji}</Text>
            <Text style={styles.rank}>{item.rank}위</Text>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.score}>{item.score}점</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5", paddingTop: 60 },
  title: { fontSize: 28, fontWeight: "bold", textAlign: "center", color: "#1a1a1a", marginBottom: 24 },
  list: { paddingHorizontal: 20, gap: 12 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    gap: 12,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  topRow: { borderLeftWidth: 4, borderLeftColor: "#f5a623" },
  emoji: { fontSize: 24 },
  rank: { fontSize: 16, fontWeight: "700", color: "#333", width: 30 },
  name: { flex: 1, fontSize: 16, color: "#1a1a1a" },
  score: { fontSize: 16, fontWeight: "600", color: "#0a7ea4" },
});
