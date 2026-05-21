import { fetchQuizConceptData, submitQuizResult } from "@/api/quiz";
import { STAGE_INFO } from "@/constants/stageInfo";
import { Button } from "@/components/common/Button";
import { MatchingOptions } from "@/components/quiz/MatchingOptions";
import { MultipleChoiceOptions } from "@/components/quiz/MultipleChoiceOptions";
import { OXOptions } from "@/components/quiz/OXOptions";
import { QuestRewardScreen } from "@/components/quiz/quest-reward-screen";
import { QuizCard } from "@/components/quiz/QuizCard";
import { ResultScreen } from "@/components/quiz/result-screen";
import { RetryBanner } from "@/components/quiz/RetryBanner";
import { ShortAnswerInput } from "@/components/quiz/ShortAnswerInput";
import { StreakScreen } from "@/components/quiz/streak-screen";
import { useQuizStore } from "@/store/useQuizStore";
import { useStageStore } from "@/store/useStageStore";
import { useUserStore } from "@/store/useUserStore";
import {
  AnyQuizQuestion,
  MatchingQuestion,
  OXQuestion,
  QuizQuestion,
  ShortAnswerQuestion,
  SubmitResultResponse,
  UserAnswer,
} from "@/types/quiz";
import { generateQuestionsFromConceptData } from "@/utils/quizGenerator";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

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

const RETRY_ACCENT = "#FF9600";

function getAccentColor(stageId: string): string {
  const chapter = STAGE_INFO[Number(stageId)]?.chapter ?? "A";
  const idx = chapter.charCodeAt(0) - "A".charCodeAt(0);
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
    isRetrying,
    retryQueue,
    retryTotal,
    retryCorrectCount,
    retryAnswered,
    retryIsCorrect,
    conceptId,
    randomSeed,
    userAnswers,
    setQuestions,
    markAnswer,
    nextQuestion,
    finishQuiz,
    resetQuiz,
    setConceptMeta,
    recordAnswer,
    enterRetry,
    markRetryAnswer,
    resetRetryAnswer,
    nextRetryQuestion,
  } = useQuizStore();
  const { triggerEating, completedStages } = useStageStore();
  const { refreshUser } = useUserStore();

  const [phase, setPhase] = useState<ResultPhase>("result");
  const [mcSelected, setMcSelected] = useState<number | null>(null);
  const [oxSelected, setOxSelected] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [submitDone, setSubmitDone] = useState(false);
  const [serverResult, setServerResult] = useState<SubmitResultResponse | null>(
    null,
  );

  const accentColor = getAccentColor(id ?? "1");
  const streakDays = Math.max(1, Math.min(completedStages.length, 30));

  useEffect(() => {
    const stageConceptId = Number(id ?? "1");
    setIsLoading(true);
    fetchQuizConceptData(stageConceptId)
      .then((data) => {
        setConceptMeta(data.conceptId, data.randomSeed);
        setQuestions(generateQuestionsFromConceptData(data));
      })
      .catch(() => {
        setQuestions([]);
      })
      .finally(() => setIsLoading(false));

    return () => {
      resetQuiz();
      setPhase("result");
      setServerResult(null);
      setSubmitDone(false);
    };
  }, [id, setQuestions, resetQuiz, setConceptMeta]);

  useEffect(() => {
    if (!isFinished || !conceptId || !randomSeed) return;
    submitQuizResult({ conceptId, randomSeed, isCompleted: true, userAnswers })
      .then(async (result) => {
        setServerResult(result);
        await refreshUser();
      })
      .catch(console.error)
      .finally(() => setSubmitDone(true));
    // userAnswers는 isFinished 전환 시점 스냅샷이므로 deps에서 제외
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFinished]);

  // 일반 문제 바뀔 때 로컬 선택 초기화
  useEffect(() => {
    setMcSelected(null);
    setOxSelected(null);
  }, [currentIndex]);

  // 오답 노트 문제 바뀔 때 로컬 선택 초기화
  useEffect(() => {
    if (isRetrying) {
      setMcSelected(null);
      setOxSelected(null);
    }
  }, [retryQueue[0]?.id, isRetrying]);

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
    if (!submitDone) {
      return (
        <View style={[styles.container, styles.center]}>
          <ActivityIndicator size="large" color="#58CC02" />
        </View>
      );
    }

    const correct = isCorrect.filter((v) => v === true).length;
    const total = questions.length;

    if (phase === "streak") {
      return (
        <StreakScreen
          streakDays={streakDays}
          serverStreak={serverResult?.streak}
          onNext={() => setPhase("quest")}
        />
      );
    }
    if (phase === "quest") {
      return <QuestRewardScreen onDone={() => router.back()} />;
    }
    return (
      <ResultScreen
        conceptId={conceptId || Number(id)}
        correct={correct}
        total={total}
        accentColor={accentColor}
        score={serverResult?.score}
        dotoriEarned={serverResult?.dotoriEarned}
        onBack={() => router.back()}
        onNext={() => setPhase("streak")}
      />
    );
  }

  // ── 현재 렌더할 문제 결정 ──────────────────────────────────────
  const current = isRetrying ? retryQueue[0] : questions[currentIndex];
  const currentAccent = isRetrying ? RETRY_ACCENT : accentColor;
  const isAnswered = isRetrying
    ? retryAnswered
    : isCorrect[currentIndex] !== null;

  if (!current) return null;

  // ── 일반 퀴즈 다음 버튼 핸들러 ───────────────────────────────
  const handleNext = () => {
    if (currentIndex === questions.length - 1) {
      const hasWrong = isCorrect.some((v) => v === false);
      if (hasWrong) {
        enterRetry();
      } else {
        triggerEating(id ?? "1");
        finishQuiz(id ?? "1");
      }
    } else {
      nextQuestion();
    }
  };

  // ── 오답 노트 버튼 핸들러 ────────────────────────────────────
  const handleRetryNext = () => {
    if (retryQueue.length === 1) {
      // 마지막 오답 문제 정답 → 완전 종료
      triggerEating(id ?? "1");
    }
    nextRetryQuestion();
  };

  const handleRetryAgain = () => {
    resetRetryAnswer();
    setMcSelected(null);
    setOxSelected(null);
  };

  // ── 문제 옵션 렌더 (일반 & 오답 공용) ────────────────────────
  const renderOptions = (
    q: AnyQuizQuestion,
    answered: boolean,
    onMark: (correct: boolean) => void,
    onRecord?: (answer: UserAnswer["answer"]) => void,
  ) => {
    const qType = getQuestionType(q);

    if (qType === "multiple-choice") {
      const mc = q as QuizQuestion;
      return (
        <MultipleChoiceOptions
          key={q.id}
          options={mc.options}
          selected={mcSelected}
          answerIndex={mc.answerIndex}
          isAnswered={answered}
          accentColor={currentAccent}
          onSelect={(i) => {
            setMcSelected(i);
            onRecord?.(i);
            onMark(i === mc.answerIndex);
          }}
        />
      );
    }

    if (qType === "short-answer") {
      const sa = q as ShortAnswerQuestion;
      return (
        <ShortAnswerInput
          key={q.id}
          correctAnswer={sa.answer}
          isAnswered={answered}
          accentColor={currentAccent}
          onSubmit={(text, correct) => {
            onRecord?.(text);
            onMark(correct);
          }}
        />
      );
    }

    if (qType === "ox") {
      const ox = q as OXQuestion;
      return (
        <OXOptions
          key={q.id}
          selected={oxSelected}
          correctAnswer={ox.answer}
          isAnswered={answered}
          accentColor={currentAccent}
          onSelect={(v) => {
            setOxSelected(v);
            onRecord?.(v);
            onMark(v === ox.answer);
          }}
        />
      );
    }

    if (qType === "matching") {
      const mt = q as MatchingQuestion;
      return (
        <MatchingOptions
          key={q.id}
          leftItems={mt.leftItems}
          rightItems={mt.rightItems}
          correctPairs={mt.correctPairs}
          isAnswered={answered}
          accentColor={currentAccent}
          onComplete={(pairs) => {
            const allCorrect = Object.entries(pairs).every(
              ([li, ri]) => mt.correctPairs[Number(li)] === ri,
            );
            // Record<number,number> → Record<string,number> (API 포맷)
            onRecord?.(
              Object.fromEntries(Object.entries(pairs)) as Record<
                string,
                number
              >,
            );
            onMark(allCorrect);
          }}
        />
      );
    }

    return null;
  };

  // ── 하단 버튼 ────────────────────────────────────────────────
  const renderButton = () => {
    if (!isAnswered) return null;

    if (isRetrying) {
      if (retryIsCorrect === false) {
        return (
          <Button
            label="다시 풀기"
            onPress={handleRetryAgain}
            color="#FF4B4B"
            style={{ paddingVertical: 16, marginTop: 8 }}
            textStyle={{ fontWeight: "800" }}
          />
        );
      }
      const isLast = retryQueue.length === 1;
      return (
        <Button
          label={isLast ? "결과 보기" : "다음 문제"}
          onPress={handleRetryNext}
          color={RETRY_ACCENT}
          style={{ paddingVertical: 16, marginTop: 8 }}
          textStyle={{ fontWeight: "800" }}
        />
      );
    }

    return (
      <Button
        label={
          currentIndex === questions.length - 1 ? "결과 보기" : "다음 문제"
        }
        onPress={handleNext}
        color={accentColor}
        style={{ paddingVertical: 16, marginTop: 8 }}
        textStyle={{ fontWeight: "800" }}
      />
    );
  };

  // ── 진행 표시 (헤더용) ───────────────────────────────────────
  const questionNumber = isRetrying ? retryCorrectCount + 1 : currentIndex + 1;
  const questionTotal = isRetrying ? retryTotal : questions.length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerChapter}>
            {STAGE_INFO[Number(id)]?.chapter ?? "A"}
          </Text>
          <Text style={styles.headerTitle}>
            {STAGE_INFO[Number(id)]?.title ?? `스테이지 ${id}`}
          </Text>
        </View>
      </View>

      {isRetrying && (
        <RetryBanner correctCount={retryCorrectCount} total={retryTotal} />
      )}

      <ScrollView contentContainerStyle={styles.content}>
        <QuizCard
          questionNumber={questionNumber}
          total={questionTotal}
          question={current.question}
          accentColor={currentAccent}
        />
        <View style={styles.options}>
          {renderOptions(
            current,
            isAnswered,
            isRetrying ? markRetryAnswer : markAnswer,
            isRetrying
              ? undefined
              : (answer) => {
                  const qType = getQuestionType(current);
                  const quizTypeMap: Record<string, UserAnswer["quizType"]> = {
                    "multiple-choice": "MULTIPLE_CASE",
                    ox: "OX",
                    "short-answer": "SHORT_ANSWER",
                    matching: "MATCHING",
                  };
                  recordAnswer(currentIndex + 1, quizTypeMap[qType], answer);
                },
          )}
        </View>
        {renderButton()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#191A1C" },
  header: {
    alignItems: "center",
    paddingTop: 56,
    paddingBottom: 12,
  },
  headerTitleWrap: { alignItems: "center", gap: 2 },
  headerChapter: {
    color: "#aaa",
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 1,
  },
  headerTitle: { color: "#fff", fontSize: 15, fontWeight: "700" },
  content: { padding: 20, paddingTop: 8, gap: 12 },
  options: { gap: 10 },
  center: { alignItems: "center", justifyContent: "center", gap: 16 },
  loadingText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
