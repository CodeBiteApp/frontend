import React from "react";
import { StyleSheet, Text, View } from "react-native";

type Props = {
  questionNumber: number;
  total: number;
  question: string;
};

export function QuizCard({ questionNumber, total, question }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.progress}>{questionNumber} / {total}</Text>
      <Text style={styles.question}>{question}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 24,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  progress: { fontSize: 13, color: "#999", marginBottom: 12 },
  question: { fontSize: 20, fontWeight: "600", color: "#1a1a1a", lineHeight: 30 },
});
