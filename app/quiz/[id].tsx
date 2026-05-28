import { fetchQuizConceptData, submitQuizResult } from "@/api/quiz";
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
import { CHAPTER_COLORS } from "@/constants/stageInfo";
import { useQuizPoolStore } from "@/store/useQuizPoolStore";
import { useQuizStore } from "@/store/useQuizStore";
import { useStageStore } from "@/store/useStageStore";
import { useSubjectStore } from "@/store/useSubjectStore";
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
import { generateQuestionsFromConceptData, selectBalancedQuestions } from "@/utils/quizGenerator";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

const QUIZ_COUNT = 5;

const RETRY_ACCENT = "#FF9600";

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
    retryRoundTotal,
    retryRoundIndex,
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
    nextRetryQuestion,
  } = useQuizStore();
  const { triggerEating, completedStages } = useStageStore();
  const { applyQuizReward } = useUserStore();
  const { getSubjectIndexByConceptId, getSubjectByConceptId } = useSubjectStore();
  const { popFromPool, initPool } = useQuizPoolStore();

  const [phase, setPhase] = useState<ResultPhase>("result");
  const [mcSelected, setMcSelected] = useState<number | null>(null);
  const [oxSelected, setOxSelected] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [submitDone, setSubmitDone] = useState(false);
  const [serverResult, setServerResult] = useState<SubmitResultResponse | null>(null);
  const [conceptTitle, setConceptTitle] = useState<string>("");
  const submitAttempted = useRef(false);

  const conceptIdNum = Number(id ?? "1");
  const subjectIdx = getSubjectIndexByConceptId(conceptIdNum);
  const subjectName = getSubjectByConceptId(conceptIdNum)?.name ?? "";
  const accentColor = CHAPTER_COLORS[subjectIdx % CHAPTER_COLORS.length] ?? "#58CC02";

  const streakDays = Math.max(1, Math.min(completedStages.length, 30));

  useEffect(() => {
    setIsLoading(true);
    fetchQuizConceptData(conceptIdNum)
      .then((data) => {
        setConceptMeta(data.conceptId, data.randomSeed);
        setConceptTitle(data.conceptTitle);

        const pooled = popFromPool(conceptIdNum, QUIZ_COUNT);
        if (pooled.length >= QUIZ_COUNT) {
          setQuestions(pooled);
        } else {
          const all = generateQuestionsFromConceptData(data);
          const { selected, rest } = selectBalancedQuestions(all, QUIZ_COUNT, data.randomSeed);
          initPool(conceptIdNum, rest);
          setQuestions(selected);
        }
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
      setConceptTitle("");
      submitAttempted.current = false;
    };
  }, [conceptIdNum, setQuestions, resetQuiz, setConceptMeta, popFromPool, initPool]);

  useEffect(() => {
    if (!isFinished || !conceptId || !randomSeed || submitAttempted.current) return;
    submitAttempted.current = true;
    const body = { conceptId, randomSeed, isCompleted: true, userAnswers };
    console.log("[submit] request body:", JSON.stringify(body));
    submitQuizResult(body)
      .then((result) => {
        setServerResult(result);
        applyQuizReward(result.dotoriEarned, result.streak.currentStreak);
      })
      .catch((err) => {
        console.error("[submit] 400 error response:", err?.response?.data ?? err);
      })
      .finally(() => setSubmitDone(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFinished]);

  useEffect(() => {
    setMcSelected(null);
    setOxSelected(null);
  }, [currentIndex]);

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
        conceptId={conceptId || conceptIdNum}
        correct={correct}
        total={total}
        accentColor={accentColor}
        score={serverResult?.score}
        dotoriEarned={serverResult?.dotoriEarned}
        onNext={() => setPhase("streak")}
      />
    );
  }

  const current = isRetrying ? retryQueue[0] : questions[currentIndex];
  const currentAccent = isRetrying ? RETRY_ACCENT : accentColor;
  const isAnswered = isRetrying ? retryAnswered : isCorrect[currentIndex] !== null;

  if (!current) return null;

  const handleNext = () => {
    if (currentIndex === questions.length - 1) {
      const hasWrong = isCorrect.some(
        (v, i) => v === false && getQuestionType(questions[i]) !== "matching",
      );
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

  const handleRetryNext = () => {
    if (retryQueue.length === 1 && retryIsCorrect === true) {
      triggerEating(id ?? "1");
    }
    setMcSelected(null);
    setOxSelected(null);
    nextRetryQuestion();
  };

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
          onComplete={(pairs, hadMistake) => {
            const allCorrect =
              !hadMistake &&
              Object.entries(pairs).every(
                ([li, ri]) => mt.correctPairs[Number(li)] === ri,
              );
            onRecord?.(
              Object.fromEntries(Object.entries(pairs)) as Record<string, number>,
            );
            onMark(allCorrect);
          }}
        />
      );
    }

    return null;
  };

  const renderButton = () => {
    if (!isAnswered) return null;

    if (isRetrying) {
      const isFinalCorrect = retryQueue.length === 1 && retryIsCorrect === true;
      return (
        <Button
          label={isFinalCorrect ? "결과 보기" : "다음 문제"}
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
          currentIndex === questions.length - 1 && !isCorrect.some((v) => v === false)
            ? "결과 보기"
            : "다음 문제"
        }
        onPress={handleNext}
        color={accentColor}
        style={{ paddingVertical: 16, marginTop: 8 }}
        textStyle={{ fontWeight: "800" }}
      />
    );
  };

  const questionNumber = isRetrying ? retryRoundIndex + 1 : currentIndex + 1;
  const questionTotal = isRetrying ? retryRoundTotal : questions.length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerChapter}>{subjectName}</Text>
          <Text style={styles.headerTitle}>{conceptTitle || `스테이지 ${id}`}</Text>
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
  header: { alignItems: "center", paddingTop: 56, paddingBottom: 12 },
  headerTitleWrap: { alignItems: "center", gap: 2 },
  headerChapter: { color: "#aaa", fontSize: 11, fontWeight: "600", letterSpacing: 1 },
  headerTitle: { color: "#fff", fontSize: 15, fontWeight: "700" },
  content: { padding: 20, paddingTop: 8, gap: 12 },
  options: { gap: 10 },
  center: { alignItems: "center", justifyContent: "center", gap: 16 },
  loadingText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
