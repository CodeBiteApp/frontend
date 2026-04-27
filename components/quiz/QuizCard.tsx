import React from "react";
import { StyleSheet, Text, View } from "react-native";

type Props = {
  questionNumber: number;
  total: number;
  question: string;
  accentColor?: string;
};

export function QuizCard({ questionNumber, total, question, accentColor = "#58CC02" }: Props) {
  const progress = questionNumber / total;
  return (
    <View style={styles.card}>
      <View style={styles.progressRow}>
        <Text style={styles.progress}>
          {questionNumber} / {total}
        </Text>
      </View>
      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressFill,
            { width: `${progress * 100}%`, backgroundColor: accentColor },
          ]}
        />
      </View>
      <Text style={styles.question}>{question}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#242628",
    borderRadius: 20,
    padding: 24,
  },
  progressRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 10,
  },
  progress: { fontSize: 13, fontWeight: "600", color: "#888" },
  progressTrack: {
    height: 6,
    backgroundColor: "#333537",
    borderRadius: 3,
    marginBottom: 20,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  question: {
    fontSize: 19,
    fontWeight: "700",
    color: "#fff",
    lineHeight: 30,
  },
});
