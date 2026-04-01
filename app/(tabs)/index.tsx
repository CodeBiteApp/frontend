import { useRouter } from "expo-router";
import React from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const CATEGORIES = [
  { id: "1", title: "일반 상식", emoji: "🧠", count: 20 },
  { id: "2", title: "과학", emoji: "🔬", count: 15 },
  { id: "3", title: "역사", emoji: "📜", count: 18 },
  { id: "4", title: "스포츠", emoji: "⚽", count: 12 },
];

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>CodeBite 퀴즈</Text>
      <Text style={styles.subtitle}>카테고리를 선택해 퀴즈를 시작하세요!</Text>
      <FlatList
        data={CATEGORIES}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push(`/quiz/${item.id}`)}
          >
            <Text style={styles.emoji}>{item.emoji}</Text>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardCount}>{item.count}문제</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5", paddingTop: 60 },
  title: { fontSize: 28, fontWeight: "bold", textAlign: "center", color: "#1a1a1a" },
  subtitle: { fontSize: 14, textAlign: "center", color: "#666", marginTop: 6, marginBottom: 24 },
  list: { paddingHorizontal: 16, gap: 16 },
  card: {
    flex: 1,
    margin: 6,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  emoji: { fontSize: 36, marginBottom: 8 },
  cardTitle: { fontSize: 16, fontWeight: "600", color: "#1a1a1a" },
  cardCount: { fontSize: 12, color: "#999", marginTop: 4 },
});
