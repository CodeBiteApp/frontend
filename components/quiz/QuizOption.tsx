import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

type Props = {
  label: string;
  index: number;
  selected: boolean;
  correct?: boolean | null; // null = 아직 제출 전
  onPress: () => void;
};

export function QuizOption({ label, index, selected, correct, onPress }: Props) {
  const letters = ["A", "B", "C", "D"];

  const getStyle = () => {
    if (correct === null || correct === undefined) {
      return selected ? styles.selectedOption : styles.option;
    }
    if (correct) return styles.correctOption;
    if (selected && !correct) return styles.wrongOption;
    return styles.option;
  };

  const getTextStyle = () => {
    if (correct === null || correct === undefined) {
      return selected ? styles.selectedText : styles.optionText;
    }
    if (correct) return styles.correctText;
    if (selected && !correct) return styles.wrongText;
    return styles.optionText;
  };

  return (
    <TouchableOpacity style={[styles.base, getStyle()]} onPress={onPress} activeOpacity={0.8}>
      <Text style={[styles.letter, getTextStyle()]}>{letters[index]}. </Text>
      <Text style={[styles.label, getTextStyle()]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
  },
  option: { backgroundColor: "#fff", borderColor: "#e0e0e0" },
  selectedOption: { backgroundColor: "#e8f4f8", borderColor: "#0a7ea4" },
  correctOption: { backgroundColor: "#e6f4ea", borderColor: "#34a853" },
  wrongOption: { backgroundColor: "#fce8e6", borderColor: "#ea4335" },
  optionText: { color: "#1a1a1a" },
  selectedText: { color: "#0a7ea4" },
  correctText: { color: "#34a853" },
  wrongText: { color: "#ea4335" },
  letter: { fontWeight: "700", fontSize: 15 },
  label: { fontSize: 15, flex: 1 },
});
