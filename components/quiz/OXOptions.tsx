import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { QuizColors } from "@/constants/colors";

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
  accentColor = QuizColors.accent,
  onSelect,
}: Props) {
  const getStyle = (value: boolean) => {
    const isSelected = selected === value;
    if (!isAnswered) {
      return {
        borderColor: isSelected ? accentColor : QuizColors.surface,
        backgroundColor: isSelected ? QuizColors.selectedBg : QuizColors.itemBg,
      };
    }
    const isCorrect = value === correctAnswer;
    if (isCorrect) return { borderColor: QuizColors.correct, backgroundColor: QuizColors.correctBg };
    if (isSelected) return { borderColor: QuizColors.wrong, backgroundColor: QuizColors.wrongBg };
    return { borderColor: QuizColors.surface, backgroundColor: QuizColors.itemBg };
  };

  const getTextColor = (value: boolean) => {
    const isSelected = selected === value;
    if (!isAnswered) return isSelected ? accentColor : QuizColors.textFaint;
    const isCorrect = value === correctAnswer;
    if (isCorrect) return QuizColors.correct;
    if (isSelected) return QuizColors.wrong;
    return QuizColors.textGhost;
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
