import { fetchBatchQuizData, submitBatchResult } from "@/api/quiz";
import { Button } from "@/components/common/Button";
import { ConfirmModal } from "@/components/common/ConfirmModal";
import { MatchingOptions } from "@/components/quiz/MatchingOptions";
import { MultipleChoiceOptions } from "@/components/quiz/MultipleChoiceOptions";
import { OXOptions } from "@/components/quiz/OXOptions";
import { QuizCard } from "@/components/quiz/QuizCard";
import { ResultScreen } from "@/components/quiz/result-screen";
import { RetryBanner } from "@/components/quiz/RetryBanner";
import { ShortAnswerInput } from "@/components/quiz/ShortAnswerInput";
import { StreakScreen } from "@/components/quiz/streak-screen";
import { CHAPTER_COLORS } from "@/constants/stageInfo";
import { useAppAlert } from "@/hooks/useAppAlert";
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
import { generateQuestionsFromBatchData } from "@/utils/quizGenerator";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter, useNavigation, Stack } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  BackHandler,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const RETRY_ACCENT = "#FF9600";

function getQuestionType(q: AnyQuizQuestion) {
  return (q as any).type ?? "multiple-choice";
}

type ResultPhase = "result" | "streak" | "quest";

export default function QuizScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [subjectIdStr, batchIndexStr] = id?.split('_') ?? ['', ''];
  const subjectId = Number(subjectIdStr);
  const batchIndex = Number(batchIndexStr);
  const batchKey = `${subjectId}_${batchIndex}`;
  const router = useRouter();
  const navigation = useNavigation();
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
    setQuestions,
    markAnswer,
    nextQuestion,
    finishQuiz,
    resetQuiz,
    setBatchMeta,
    recordAnswer,
    enterRetry,
    markRetryAnswer,
    nextRetryQuestion,
  } = useQuizStore();
  const { triggerEating, completedStages } = useStageStore();
  const { applyQuizReward } = useUserStore();
  const { getSubjectById, getSubjectIndex } = useSubjectStore();

  const subject = getSubjectById(subjectId);
  const subjectName = subject?.name ?? "";
  const accentColor = CHAPTER_COLORS[getSubjectIndex(subjectId) % CHAPTER_COLORS.length] ?? "#58CC02";

  const [phase, setPhase] = useState<ResultPhase>("result");
  const [mcSelected, setMcSelected] = useState<number | null>(null);
  const [oxSelected, setOxSelected] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [submitDone, setSubmitDone] = useState(false);
  const [serverResult, setServerResult] = useState<SubmitResultResponse | null>(null);
  const submitAttempted = useRef(false);
  const pendingNavAction = useRef<any>(null);
  const { show: showAlert, hide: hideAlert, config: alertConfig, isVisible: alertVisible } = useAppAlert();

  const streakDays = Math.max(1, Math.min(completedStages.length, 30));

  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", (e) => {
      if (isFinished || isLoading || questions.length === 0) {
        return;
      }

      e.preventDefault();
      pendingNavAction.current = e.data.action;
      showAlert(
        "학습을 종료하시겠습니까?",
        "지금 나가시면 진행 중인 퀴즈 데이터와 점수가 기록되지 않습니다.",
        [
          { text: "계속 풀기", style: "cancel" },
          {
            text: "나가기",
            style: "destructive",
            onPress: () => navigation.dispatch(pendingNavAction.current),
          },
        ],
      );
    });

    return unsubscribe;
  }, [navigation, isFinished, isLoading, questions.length, showAlert]);

  useEffect(() => {
    const onHardwareBack = () => {
      if (!isFinished && !isLoading && questions.length > 0) {
        router.back();
        return true;
      }
      return false;
    };

    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      onHardwareBack
    );

    return () => subscription.remove();
  }, [isFinished, isLoading, questions.length, router]);

  useEffect(() => {
    resetQuiz();
    setIsLoading(true);
    fetchBatchQuizData(subjectId, batchIndex)
      .then((data) => {
        setBatchMeta(data.subjectId, data.batchIndex, data.randomSeed);
        setQuestions(generateQuestionsFromBatchData(data));
      })
      .catch(() => setQuestions([]))
      .finally(() => setIsLoading(false));

    return () => {
      setPhase("result");
      setServerResult(null);
      setSubmitDone(false);
      submitAttempted.current = false;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [batchKey]);

  useEffect(() => {
    if (!isFinished || submitAttempted.current) return;
    // 마운트 직후 stale closure를 방지하기 위해 실행 시점의 최신 스토어 상태를 직접 읽음
    const { isFinished: storeFinished, randomSeed: storeSeed, userAnswers: storeAnswers } = useQuizStore.getState();
    if (!storeFinished || !storeSeed || storeAnswers.length === 0) return;
    submitAttempted.current = true;
    const body = { subjectId, batchIndex, randomSeed: storeSeed, isCompleted: true, userAnswers: storeAnswers };
    submitBatchResult(body)
      .then((result) => {
        setServerResult(result);
        applyQuizReward(result.dotoriEarned, result.streak.currentStreak);
      })
      .catch((err) => {
        console.error("[submit-batch] error:", err?.response?.data ?? err);
      })
      .finally(() => setSubmitDone(true));
  // isFinished 변경 시에만 실행, 실제 값은 getState()로 직접 조회
  }, [isFinished]);

  useEffect(() => {
    setMcSelected(null);
    setOxSelected(null);
  }, [currentIndex]);

  const retryHeadId = retryQueue[0]?.id;
  useEffect(() => {
    if (isRetrying) {
      setMcSelected(null);
      setOxSelected(null);
    }
  }, [retryHeadId, isRetrying]);

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
          onNext={() => router.back()}
        />
      );
    }
    const firstConceptId = Number(questions[0]?.categoryId ?? 0);
    return (
      <ResultScreen
        conceptId={firstConceptId}
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
        triggerEating(batchKey);
        finishQuiz(batchKey);
      }
    } else {
      nextQuestion();
    }
  };

  const handleRetryNext = () => {
    if (retryQueue.length === 1 && retryIsCorrect === true) {
      triggerEating(batchKey);
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
            onRecord?.(Object.fromEntries(Object.entries(pairs)) as Record<string, number>);
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
      <Stack.Screen options={{ gestureEnabled: isFinished }} />
      <ConfirmModal
        visible={alertVisible}
        title={alertConfig?.title ?? ""}
        message={alertConfig?.message}
        buttons={alertConfig?.buttons}
        onDismiss={hideAlert}
      />
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.closeBtn}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="close" size={24} color="#ffffff" />
        </TouchableOpacity>
        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerChapter}>{subjectName}</Text>
          <Text style={styles.headerTitle}>{subjectName} {batchIndex + 1}</Text>
        </View>
        <View style={{ width: 40 }} />
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 12,
  },
  closeBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
    backgroundColor: "#242628",
  },
  headerTitleWrap: { alignItems: "center", gap: 2 },
  headerChapter: { color: "#aaa", fontSize: 11, fontWeight: "600", letterSpacing: 1 },
  headerTitle: { color: "#fff", fontSize: 15, fontWeight: "700" },
  content: { padding: 20, paddingTop: 8, gap: 12 },
  options: { gap: 10 },
  center: { alignItems: "center", justifyContent: "center", gap: 16 },
  loadingText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
