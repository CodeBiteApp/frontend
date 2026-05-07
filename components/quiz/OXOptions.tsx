import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

type Props = {
  selected: boolean | null; // true = O, false = X, null = 미선택
  correctAnswer: boolean;
  isAnswered: boolean;
  accentColor?: string;
  onSelect: (value: boolean) => void;
};

export function OXOptions({
  selected,
  correctAnswer,
  isAnswered,
  accentColor = "#1CB0F6",
  onSelect,
}: Props) {
  const getStyle = (value: boolean) => {
    const isSelected = selected === value;
    if (!isAnswered) {
      return {
        borderColor: isSelected ? accentColor : "#333537",
        backgroundColor: isSelected ? "#1e2022" : "#242628",
      };
    }
    const isCorrect = value === correctAnswer;
    if (isCorrect) return { borderColor: "#58CC02", backgroundColor: "#0A2A14" };
    if (isSelected) return { borderColor: "#FF4B4B", backgroundColor: "#2A0A0A" };
    return { borderColor: "#333537", backgroundColor: "#242628" };
  };

  const getTextColor = (value: boolean) => {
    const isSelected = selected === value;
    if (!isAnswered) return isSelected ? accentColor : "#444";
    const isCorrect = value === correctAnswer;
    if (isCorrect) return "#58CC02";
    if (isSelected) return "#FF4B4B";
    return "#333";
  };

  return (
    <View style={styles.container}>
      {([true, false] as const).map((value) => (
        <TouchableOpacity
          key={String(value)}
          style={[styles.button, getStyle(value)]}
          onPress={() => {
            if (!isAnswered) onSelect(value);
          }}
          activeOpacity={0.8}
        >
          <Text style={[styles.label, { color: getTextColor(value) }]}>
            {value ? "O" : "X"}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 12,
  },
  button: {
    flex: 1,
    height: 130,
    borderRadius: 20,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  label: {
    fontSize: 60,
    fontWeight: "800",
  },
});
