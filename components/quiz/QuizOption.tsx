import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Props = {
  label: string;
  index: number;
  selected: boolean;
  correct?: boolean | null;
  onPress: () => void;
  accentColor?: string;
};

export function QuizOption({
  label,
  index,
  selected,
  correct,
  onPress,
  accentColor = "#1CB0F6",
}: Props) {
  const letters = ["A", "B", "C", "D"];
  const answered = correct !== null && correct !== undefined;

  const getBorderColor = () => {
    if (!answered) return selected ? accentColor : "#333537";
    if (correct) return "#58CC02";
    if (selected && !correct) return "#FF4B4B";
    return "#333537";
  };

  const getBgColor = () => {
    if (!answered) return selected ? "#1e2022" : "#242628";
    if (correct) return "#0A2A14";
    if (selected && !correct) return "#2A0A0A";
    return "#242628";
  };

  const getTextColor = () => {
    if (!answered) return selected ? accentColor : "#ccc";
    if (correct) return "#58CC02";
    if (selected && !correct) return "#FF4B4B";
    return "#555";
  };

  const getBadgeBg = () => {
    if (!answered) return selected ? accentColor : "#333537";
    if (correct) return "#58CC02";
    if (selected && !correct) return "#FF4B4B";
    return "#2a2c2e";
  };

  const textColor = getTextColor();

  return (
    <TouchableOpacity
      style={[
        styles.base,
        { backgroundColor: getBgColor(), borderColor: getBorderColor() },
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={[styles.badge, { backgroundColor: getBadgeBg() }]}>
        <Text
          style={[
            styles.letter,
            { color: selected || correct ? "#fff" : "#888" },
          ]}
        >
          {letters[index]}
        </Text>
      </View>
      <Text style={[styles.label, { color: textColor }]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    padding: 14,
    borderWidth: 2,
    gap: 12,
  },
  badge: {
    width: 30,
    height: 30,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  letter: { fontWeight: "700", fontSize: 14 },
  label: { fontSize: 15, flex: 1, lineHeight: 22 },
});
