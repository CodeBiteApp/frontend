import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { QuizColors } from "@/constants/quiz";

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
  accentColor = QuizColors.accent,
}: Props) {
  const letters = ["A", "B", "C", "D"];
  const answered = correct !== null && correct !== undefined;

  const getBorderColor = () => {
    if (!answered) return selected ? accentColor : QuizColors.border;
    if (correct) return QuizColors.correct;
    if (selected && !correct) return QuizColors.wrong;
    return QuizColors.border;
  };

  const getBgColor = () => {
    if (!answered) return selected ? QuizColors.selectedBg : QuizColors.itemBg;
    if (correct) return QuizColors.correctBg;
    if (selected && !correct) return QuizColors.wrongBg;
    return QuizColors.itemBg;
  };

  const getTextColor = () => {
    if (!answered) return selected ? accentColor : QuizColors.text;
    if (correct) return QuizColors.correct;
    if (selected && !correct) return QuizColors.wrong;
    return QuizColors.textMuted;
  };

  const getBadgeBg = () => {
    if (!answered) return selected ? accentColor : QuizColors.badgeBg;
    if (correct) return QuizColors.correct;
    if (selected && !correct) return QuizColors.wrong;
    return QuizColors.badgeBgAnswered;
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
            { color: selected || correct ? QuizColors.white : QuizColors.badgeLetter },
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
