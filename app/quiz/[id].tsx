import { Button } from "@/components/common/Button";
import { QuizCard } from "@/components/quiz/QuizCard";
import { MultipleChoiceOptions } from "@/components/quiz/MultipleChoiceOptions";
import { ShortAnswerInput } from "@/components/quiz/ShortAnswerInput";
import { OXOptions } from "@/components/quiz/OXOptions";
import { MatchingOptions } from "@/components/quiz/MatchingOptions";
import { useQuizStore } from "@/store/useQuizStore";
import { useStageStore } from "@/store/useStageStore";
import {
  AnyQuizQuestion,
  QuizQuestion,
  ShortAnswerQuestion,
  OXQuestion,
  MatchingQuestion,
} from "@/types/quiz";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { QuestRewardScreen } from "@/components/quiz/quest-reward-screen";
import { ResultScreen } from "@/components/quiz/result-screen";
import { StreakScreen } from "@/components/quiz/streak-screen";
import { MOCK_QUESTIONS } from "@/mocks/quiz";
import { STAGE_CONCEPT_MAP } from "@/mocks/quizConceptData";
import { fetchQuizConceptData } from "@/api/quiz";
import { generateQuestionsFromConceptData } from "@/utils/quizGenerator";

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

function getQuestionType(q: AnyQuizQuestion) {
  return (q as any).type ?? "multiple-choice";
}

type ResultPhase = "result" | "streak" | "quest";

export default function QuizScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const {
    questions,
    currentIndex,
    isCorrect,
    isFinished,
    setQuestions,
    markAnswer,
    nextQuestion,
    finishQuiz,
    resetQuiz,
  } = useQuizStore();
  const { triggerEating, completedStages } = useStageStore();

  const [phase, setPhase] = useState<ResultPhase>("result");
  const [mcSelected, setMcSelected] = useState<number | null>(null);
  const [oxSelected, setOxSelected] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const accentColor = getAccentColor(id ?? "1");
  const streakDays = Math.max(1, Math.min(completedStages.length, 30));

  useEffect(() => {
    const stageId = id ?? "1";
    const conceptId = STAGE_CONCEPT_MAP[stageId];

    if (conceptId !== undefined) {
      setIsLoading(true);
      fetchQuizConceptData(conceptId)
        .then((data) => {
          setQuestions(generateQuestionsFromConceptData(data));
        })
        .catch(() => {
          setQuestions(MOCK_QUESTIONS[stageId] ?? []);
        })
        .finally(() => setIsLoading(false));
    } else {
      setQuestions(MOCK_QUESTIONS[stageId] ?? []);
    }

    return () => {
      resetQuiz();
      setPhase("result");
    };
  }, [id, setQuestions, resetQuiz]);

  // 문제가 바뀌면 로컬 선택 상태 초기화
  useEffect(() => {
    setMcSelected(null);
    setOxSelected(null);
  }, [currentIndex]);

  if (isLoading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#58CC02" />
        <Text style={styles.loadingText}>퀴즈 생성중...</Text>
      </View>
    );
  }

  if (questions.length === 0) return null;

  if (isFinished) {
    const correct = isCorrect.filter((v) => v === true).length;
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
  const qType = getQuestionType(current);
  const isAnswered = isCorrect[currentIndex] !== null;

  const handleNext = () => {
    if (currentIndex === questions.length - 1) {
      finishQuiz(id ?? "1");
      triggerEating(id ?? "1");
    } else {
      nextQuestion();
    }
  };

  const renderOptions = () => {
    if (qType === "multiple-choice") {
      const mc = current as QuizQuestion;
      return (
        <MultipleChoiceOptions
          options={mc.options}
          selected={mcSelected}
          answerIndex={mc.answerIndex}
          isAnswered={isAnswered}
          accentColor={accentColor}
          onSelect={(i) => {
            setMcSelected(i);
            markAnswer(i === mc.answerIndex);
          }}
        />
      );
    }

    if (qType === "short-answer") {
      const sa = current as ShortAnswerQuestion;
      return (
        <ShortAnswerInput
          correctAnswer={sa.answer}
          isAnswered={isAnswered}
          accentColor={accentColor}
          onSubmit={(_, correct) => markAnswer(correct)}
        />
      );
    }

    if (qType === "ox") {
      const ox = current as OXQuestion;
      return (
        <OXOptions
          selected={oxSelected}
          correctAnswer={ox.answer}
          isAnswered={isAnswered}
          accentColor={accentColor}
          onSelect={(v) => {
            setOxSelected(v);
            markAnswer(v === ox.answer);
          }}
        />
      );
    }

    if (qType === "matching") {
      const mt = current as MatchingQuestion;
      return (
        <MatchingOptions
          leftItems={mt.leftItems}
          rightItems={mt.rightItems}
          correctPairs={mt.correctPairs}
          isAnswered={isAnswered}
          accentColor={accentColor}
          onComplete={(pairs) => {
            const allCorrect = Object.entries(pairs).every(
              ([li, ri]) => mt.correctPairs[Number(li)] === ri
            );
            markAnswer(allCorrect);
          }}
        />
      );
    }

    return null;
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
        <View style={styles.options}>{renderOptions()}</View>
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
  center: { alignItems: "center", justifyContent: "center", gap: 16 },
  loadingText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
