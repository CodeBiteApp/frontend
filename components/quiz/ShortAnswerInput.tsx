import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { QuizColors } from "@/constants/colors";

type Props = {
  correctAnswer: string;
  isAnswered: boolean;
  accentColor?: string;
  onSubmit: (value: string, isCorrect: boolean) => void;
};

export function ShortAnswerInput({
  correctAnswer,
  isAnswered,
  accentColor = QuizColors.accent,
  onSubmit,
}: Props) {
  const [value, setValue] = useState("");
  const [submittedValue, setSubmittedValue] = useState("");
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  // 재시도 시 같은 문제가 다시 나올 때 isAnswered가 true→false로 바뀌면 내부 상태 초기화
  useEffect(() => {
    if (!isAnswered) {
      setValue("");
      setSubmittedValue("");
      setIsCorrect(null);
    }
  }, [isAnswered]);

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
      ? QuizColors.correct
      : QuizColors.wrong;

  return (
    <View style={styles.container}>
      <TextInput
        style={[styles.input, { borderColor }]}
        value={value}
        onChangeText={setValue}
        placeholder="정답을 입력하세요"
        placeholderTextColor={QuizColors.textPlaceholder}
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
              backgroundColor: isCorrect ? QuizColors.correctBg : QuizColors.wrongBg,
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
    backgroundColor: QuizColors.itemBg,
    borderWidth: 2,
    borderRadius: 14,
    padding: 14,
    color: QuizColors.white,
    fontSize: 15,
  },
  submitBtn: {
    padding: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  submitBtnText: { color: QuizColors.white, fontWeight: "700", fontSize: 15 },
  feedback: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 2,
  },
  feedbackText: { fontWeight: "600", fontSize: 15 },
});
