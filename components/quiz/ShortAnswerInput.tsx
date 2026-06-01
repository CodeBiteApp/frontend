import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

type Props = {
  correctAnswer: string;
  isAnswered: boolean;
  accentColor?: string;
  onSubmit: (value: string, isCorrect: boolean) => void;
};

export function ShortAnswerInput({
  correctAnswer,
  isAnswered,
  accentColor = "#1CB0F6",
  onSubmit,
}: Props) {
  const [value, setValue] = useState("");
  const [submittedValue, setSubmittedValue] = useState("");
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const isSubmitted = isCorrect !== null;
  const locked = isAnswered || isSubmitted;

  const handleSubmit = () => {
    if (!value.trim() || locked) return;
    const normalized = value.replace(/\s/g, "").toLowerCase();
    const correct =
      normalized === correctAnswer.replace(/\s/g, "").toLowerCase();
    setSubmittedValue(normalized);
    setIsCorrect(correct);
    onSubmit(normalized, correct);
  };

  const borderColor =
    isCorrect === null
      ? accentColor
      : isCorrect
      ? "#58CC02"
      : "#FF4B4B";

  return (
    <View style={styles.container}>
      <TextInput
        style={[styles.input, { borderColor }]}
        value={value}
        onChangeText={setValue}
        placeholder="정답을 입력하세요"
        placeholderTextColor="#555"
        editable={!locked}
        onSubmitEditing={handleSubmit}
        returnKeyType="done"
      />
      {!locked && (
        <TouchableOpacity
          style={[styles.submitBtn, { backgroundColor: accentColor }]}
          onPress={handleSubmit}
          activeOpacity={0.8}
        >
          <Text style={styles.submitBtnText}>제출</Text>
        </TouchableOpacity>
      )}
      {isSubmitted && (
        <View
          style={[
            styles.feedback,
            {
              borderColor,
              backgroundColor: isCorrect ? "#0A2A14" : "#2A0A0A",
            },
          ]}
        >
          <Text style={[styles.feedbackText, { color: borderColor }]}>
            {isCorrect ? "정답!" : `오답 — 정답: ${correctAnswer}`}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 10 },
  input: {
    backgroundColor: "#242628",
    borderWidth: 2,
    borderRadius: 14,
    padding: 14,
    color: "#fff",
    fontSize: 15,
  },
  submitBtn: {
    padding: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  submitBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  feedback: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 2,
  },
  feedbackText: { fontWeight: "600", fontSize: 15 },
});
