import React from "react";
import { View, StyleSheet } from "react-native";
import { QuizOption } from "./QuizOption";

type Props = {
  options: string[];
  selected: number | null;
  answerIndex: number;
  isAnswered: boolean;
  accentColor?: string;
  onSelect: (index: number) => void;
};

export function MultipleChoiceOptions({
  options,
  selected,
  answerIndex,
  isAnswered,
  accentColor = "#1CB0F6",
  onSelect,
}: Props) {
  return (
    <View style={styles.container}>
      {options.map((opt, i) => {
        const isCorrect =
          isAnswered && i === answerIndex
            ? true
            : isAnswered && i === selected && i !== answerIndex
            ? false
            : null;
        return (
          <QuizOption
            key={i}
            index={i}
            label={opt}
            selected={selected === i}
            correct={isCorrect}
            accentColor={accentColor}
            onPress={() => {
              if (!isAnswered) onSelect(i);
            }}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 10 },
});
