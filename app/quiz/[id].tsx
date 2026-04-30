import { Button } from "@/components/common/Button";
import { QuizCard } from "@/components/quiz/QuizCard";
import { QuizOption } from "@/components/quiz/QuizOption";
import { useQuizStore } from "@/store/useQuizStore";
import { useStageStore } from "@/store/useStageStore";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { QuestRewardScreen } from "./_components/quest-reward-screen";
import { ResultScreen } from "./_components/result-screen";
import { StreakScreen } from "./_components/streak-screen";
import { MOCK_QUESTIONS } from "./mock";

const CHAPTER_COLORS = [
  "#58CC02",
  "#1CB0F6",
  "#00CD9C",
  "#FFC800",
  "#FF9600",
  "#FF4B4B",
  "#FF86D0",
  "#CE82FF",
  "#2B70C9",
  "#FF6B00",
];

function getAccentColor(stageId: string): string {
  const idx = Math.floor((Number(stageId ?? 1) - 1) / 7);
  return CHAPTER_COLORS[Math.min(idx, CHAPTER_COLORS.length - 1)];
}

type ResultPhase = "result" | "streak" | "quest";

export default function QuizScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const {
    questions,
    currentIndex,
    selectedAnswers,
    isFinished,
    setQuestions,
    selectAnswer,
    nextQuestion,
    finishQuiz,
    resetQuiz,
  } = useQuizStore();
  const { triggerEating, completedStages } = useStageStore();

  const [phase, setPhase] = useState<ResultPhase>("result");

  const accentColor = getAccentColor(id ?? "1");

  // 완료한 스테이지 수 기반 스트릭 (실제 구현 시 날짜 기반으로 교체)
  const streakDays = Math.max(1, Math.min(completedStages.length, 30));

  useEffect(() => {
    const qs = MOCK_QUESTIONS[id ?? "1"] ?? [];
    setQuestions(qs);
    return () => {
      resetQuiz();
      setPhase("result");
    };
  }, [id]);

  if (questions.length === 0) return null;

  if (isFinished) {
    const correct = questions.reduce(
      (acc, q, i) => acc + (selectedAnswers[i] === q.answerIndex ? 1 : 0),
      0
    );
    const total = questions.length;

    if (phase === "streak") {
      return (
        <StreakScreen
          streakDays={streakDays}
          onNext={() => setPhase("quest")}
        />
      );
    }

    if (phase === "quest") {
      return <QuestRewardScreen onDone={() => router.back()} />;
    }

    return (
      <ResultScreen
        correct={correct}
        total={total}
        accentColor={accentColor}
        onBack={() => router.back()}
        onNext={() => setPhase("streak")}
      />
    );
  }

  const current = questions[currentIndex];
  const selected = selectedAnswers[currentIndex];
  const isAnswered = selected !== null;

  const handleNext = () => {
    if (currentIndex === questions.length - 1) {
      finishQuiz(id ?? "1");
      triggerEating(id ?? "1");
    } else {
      nextQuestion();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>스테이지 {id}</Text>
        <View style={{ width: 36 }} />
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <QuizCard
          questionNumber={currentIndex + 1}
          total={questions.length}
          question={current.question}
          accentColor={accentColor}
        />
        <View style={styles.options}>
          {current.options.map((opt, i) => {
            const isCorrect =
              isAnswered && i === current.answerIndex
                ? true
                : isAnswered && i === selected && i !== current.answerIndex
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
                  if (!isAnswered) selectAnswer(i);
                }}
              />
            );
          })}
        </View>
        {isAnswered && (
          <Button
            label={
              currentIndex === questions.length - 1 ? "결과 보기" : "다음 문제"
            }
            onPress={handleNext}
            color={accentColor}
            style={{ paddingVertical: 16, marginTop: 8 }}
            textStyle={{ fontWeight: "800" }}
          />
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#191A1C" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 12,
  },
  headerTitle: { color: "#fff", fontSize: 16, fontWeight: "700" },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#242628",
    justifyContent: "center",
    alignItems: "center",
  },
  backBtnText: { color: "#fff", fontSize: 18, fontWeight: "600" },
  content: { padding: 20, paddingTop: 8, gap: 12 },
  options: { gap: 10 },
});
