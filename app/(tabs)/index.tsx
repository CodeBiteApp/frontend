import { AnimatedDobiTransition } from "@/components/charactor/AnimatedDobiTransition";
import { ACORN_H } from "@/components/common/AcornButton";
import ChapterSection from "@/components/home/ChapterSection";
import StageModal, { SelectedStage } from "@/components/home/StageModal";
import StickyChapterBar from "@/components/home/StickyChapterBar";
import UserInfoBar from "@/components/home/UserInfoBar";
import { BANNER_H, CHAPTER_BREAKPOINTS, ROW_HEIGHT, STAGES_TOP_PAD } from "@/constants/homeLayout";
import { CHAPTER_COLORS, CHAPTER_LETTERS, CHAPTER_STAGES } from "@/constants/stageInfo";
import { useStageStore } from "@/store/useStageStore";
import { useUserStore } from "@/store/useUserStore";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Animated,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Alert,
  Modal,
} from "react-native";
import { restoreStreak, resetStreak } from "@/api/streak";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

type AnimatingStage = {
  stageId: string;
  color: string;
  darkColor: string;
  position: { x: number; y: number; width: number; height: number };
  nextPosition: { x: number; y: number; width: number; height: number } | null;
};

function getStagePosition(stageId: number): { chapterIdx: number; stageInChapter: number } {
  for (let ci = 0; ci < CHAPTER_LETTERS.length; ci++) {
    const si = CHAPTER_STAGES[CHAPTER_LETTERS[ci]].indexOf(stageId);
    if (si !== -1) return { chapterIdx: ci, stageInChapter: si };
  }
  return { chapterIdx: 0, stageInChapter: 0 };
}

function getSeoulDate(dateInput: string | Date | null): string | null {
  if (!dateInput) return null;
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return null;

  const seoulFormatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  });
  const parts = seoulFormatter.formatToParts(d);
  const year = parts.find(p => p.type === "year")?.value;
  const month = parts.find(p => p.type === "month")?.value;
  const day = parts.find(p => p.type === "day")?.value;
  return `${year}-${month}-${day}`;
}

function calculateMissedDays(lastStudyStr: string | null): number {
  if (!lastStudyStr) return 0;

  const lastStudySeoul = getSeoulDate(lastStudyStr);
  const todaySeoul = getSeoulDate(new Date());
  if (!lastStudySeoul || !todaySeoul) return 0;

  const lastDate = new Date(lastStudySeoul);
  const todayDate = new Date(todaySeoul);

  const diffTime = todayDate.getTime() - lastDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

function darken(hex: string, amount: number): string {
  const num = parseInt(hex.slice(1), 16);
  const r = Math.max(0, (num >> 16) - Math.round(255 * amount));
  const g = Math.max(0, ((num >> 8) & 0xff) - Math.round(255 * amount));
  const b = Math.max(0, (num & 0xff) - Math.round(255 * amount));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

export default function HomeScreen({ isFocused }: { isFocused?: boolean }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { position, user, refreshUser } = useUserStore();
  const streak = user?.currentStreak ?? 0;

  const [selected, setSelected] = useState<SelectedStage | null>(null);
  const [animatingStage, setAnimatingStage] = useState<AnimatingStage | null>(null);
  const [currentChapter, setCurrentChapter] = useState(0);

  // 스트릭 보호권 소모 팝업 관련 상태
  const [showStreakModal, setShowStreakModal] = useState(false);
  const [missedDays, setMissedDays] = useState(0);
  const [isRestoring, setIsRestoring] = useState(false);
  const [hasCheckedStreak, setHasCheckedStreak] = useState(false);

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const prevChapterRef = useRef(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const buttonRefs = useRef<Record<number, View | null>>({});

  const { completedStages, justCompletedStageId, confirmComplete, resetStages } = useStageStore();
  const acornCount = user?.dotori ?? 0;

  const currentStageId = useMemo(() => {
    for (let i = 1; i <= 84; i++) {
      if (!completedStages.includes(String(i))) return i;
    }
    return 84;
  }, [completedStages]);

  // 스트릭 체크 로직
  useEffect(() => {
    if (!user || hasCheckedStreak) return;

    const d = calculateMissedDays(user.lastStudy);
    if (d >= 2) {
      if (user.protector >= d && user.currentStreak > 0) {
        setMissedDays(d);
        setShowStreakModal(true);
      }
    }
    setHasCheckedStreak(true);
  }, [user, hasCheckedStreak]);

  const handleRestoreStreak = async () => {
    setIsRestoring(true);
    try {
      await restoreStreak();
      Alert.alert("스트릭 유지 완료", "보호권이 성공적으로 소모되었으며 스트릭이 안전하게 보존되었습니다! 🛡️");
      setShowStreakModal(false);
      await refreshUser();
    } catch (e: any) {
      Alert.alert("에러", e.message || "스트릭 복구에 실패했습니다.");
    } finally {
      setIsRestoring(false);
    }
  };

  const handleCancelStreak = async () => {
    setIsRestoring(true);
    try {
      await resetStreak();
      Alert.alert("스트릭 초기화", "연속 학습 스트릭이 0일로 재설정되었습니다.");
      setShowStreakModal(false);
      await refreshUser();
    } catch (e: any) {
      Alert.alert("에러", e.message || "스트릭 초기화에 실패했습니다.");
    } finally {
      setIsRestoring(false);
    }
  };

  const handleFocus = useCallback(() => {
    setHasCheckedStreak(false);
    refreshUser();
  }, [refreshUser]);

  useFocusEffect(
    useCallback(() => {
      handleFocus();
    }, [handleFocus]),
  );

  useEffect(() => {
    if (isFocused) {
      handleFocus();
    }
  }, [isFocused, handleFocus]);

  useFocusEffect(
    useCallback(() => {
      if (!justCompletedStageId) return;

      const stageId = Number(justCompletedStageId);
      const { chapterIdx, stageInChapter } = getStagePosition(stageId);

      const estimatedStageY =
        CHAPTER_BREAKPOINTS[chapterIdx] + BANNER_H + STAGES_TOP_PAD + stageInChapter * ROW_HEIGHT;
      const scrollTarget = Math.max(0, estimatedStageY - SCREEN_HEIGHT / 2 + ACORN_H / 2);
      scrollViewRef.current?.scrollTo({ y: scrollTarget, animated: true });

      setTimeout(() => {
        const ref = buttonRefs.current[stageId];
        if (!ref) return;
        ref.measureInWindow((x, y, w, h) => {
          if (w === 0 || h === 0) return;
          const color = CHAPTER_COLORS[chapterIdx];
          const nextStageId = stageId < 84 ? stageId + 1 : null;
          const nextRef = nextStageId ? buttonRefs.current[nextStageId] : null;
          if (nextRef) {
            nextRef.measureInWindow((nx, ny, nw, nh) => {
              setAnimatingStage({
                stageId: justCompletedStageId,
                color,
                darkColor: darken(color, 0.25),
                position: { x, y, width: w, height: h },
                nextPosition: nw > 0 && nh > 0 ? { x: nx, y: ny, width: nw, height: nh } : null,
              });
            });
          } else {
            setAnimatingStage({
              stageId: justCompletedStageId,
              color,
              darkColor: darken(color, 0.25),
              position: { x, y, width: w, height: h },
              nextPosition: null,
            });
          }
        });
      }, 650);
    }, [justCompletedStageId]),
  );

  const handleEatingFinish = useCallback(() => {
    if (animatingStage) {
      confirmComplete(animatingStage.stageId);
      setAnimatingStage(null);
    }
  }, [animatingStage, confirmComplete]);

  const handleScroll = useCallback(
    (event: any) => {
      const y = event.nativeEvent.contentOffset.y;
      let chapter = 0;
      for (let i = CHAPTER_BREAKPOINTS.length - 1; i >= 0; i--) {
        if (y >= CHAPTER_BREAKPOINTS[i]) { chapter = i; break; }
      }
      if (chapter !== prevChapterRef.current) {
        prevChapterRef.current = chapter;
        Animated.sequence([
          Animated.timing(fadeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
          Animated.timing(fadeAnim, { toValue: 1, duration: 80, useNativeDriver: true }),
        ]).start();
        setCurrentChapter(chapter);
      }
    },
    [fadeAnim],
  );

  return (
    <>
      <View style={styles.container}>
        <View style={[styles.fixedTop, { paddingTop: Math.max(insets.top, 16) }]}>
          <UserInfoBar position={position} streak={streak} acornCount={acornCount} />
          <TouchableOpacity style={styles.resetBtn} onPress={resetStages} activeOpacity={0.7}>
            <Text style={styles.resetBtnText}>🔄 테스트 초기화</Text>
          </TouchableOpacity>
          <StickyChapterBar currentChapter={currentChapter} fadeAnim={fadeAnim} />
        </View>

        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          {CHAPTER_LETTERS.map((letter, c) => {
            const color = CHAPTER_COLORS[c];
            return (
              <ChapterSection
                key={letter}
                letter={letter}
                chapterIdx={c}
                color={color}
                darkColor={darken(color, 0.25)}
                stageIds={CHAPTER_STAGES[letter]}
                completedStages={completedStages}
                currentStageId={currentStageId}
                animatingStageId={animatingStage?.stageId ?? null}
                buttonRefs={buttonRefs}
                onStagePress={(stageId, stageColor) => setSelected({ id: stageId, color: stageColor })}
              />
            );
          })}
          <View style={{ height: 40 }} />
        </ScrollView>
      </View>

      <StageModal
        selected={selected}
        onClose={() => setSelected(null)}
        onStart={(stageId) => {
          setSelected(null);
          router.push(`/quiz/${stageId}` as never);
        }}
      />

      {animatingStage && (
        <AnimatedDobiTransition
          stageId={animatingStage.stageId}
          position={animatingStage.position}
          nextPosition={animatingStage.nextPosition}
          color={animatingStage.color}
          darkColor={animatingStage.darkColor}
          onFinish={handleEatingFinish}
        />
      )}

      {/* 스트릭 보호권 소모 여부 팝업 모달 */}
      <Modal
        visible={showStreakModal}
        transparent
        animationType="fade"
        onRequestClose={handleCancelStreak}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <Text style={styles.modalEmoji}>🛡️</Text>
            <Text style={styles.modalTitle}>스트릭을 보호할까요?</Text>
            <Text style={styles.modalDesc}>
              {missedDays}일 동안 접속하지 않으셨네요!{"\n"}
              보유한 스트릭 보호권 <Text style={styles.highlightText}>{missedDays}개</Text>를 소모하여 현재의 연속 학습 스트릭을 유지할 수 있습니다.
            </Text>

            <View style={styles.modalInfoBox}>
              <View style={styles.modalInfoItem}>
                <Text style={styles.modalInfoLabel}>보유 보호권</Text>
                <Text style={styles.modalInfoVal}>{user?.protector ?? 0}개</Text>
              </View>
              <View style={styles.modalInfoItem}>
                <Text style={styles.modalInfoLabel}>소모 보호권</Text>
                <Text style={[styles.modalInfoVal, { color: "#ff4b4b", fontWeight: "700" }]}>-{missedDays}개</Text>
              </View>
              <View style={styles.modalInfoItem}>
                <Text style={styles.modalInfoLabel}>현재 스트릭</Text>
                <Text style={styles.modalInfoVal}>🔥 {user?.currentStreak ?? 0}일</Text>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.modalBtn, styles.modalBtnConfirm]}
              onPress={handleRestoreStreak}
              disabled={isRestoring}
              activeOpacity={0.8}
            >
              {isRestoring ? (
                <ActivityIndicator size="small" color="#191A1C" />
              ) : (
                <Text style={styles.modalBtnConfirmText}>스트릭 유지하기</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalBtn, styles.modalBtnCancel]}
              onPress={handleCancelStreak}
              disabled={isRestoring}
              activeOpacity={0.8}
            >
              <Text style={styles.modalBtnCancelText}>포기하고 초기화하기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#191A1C" },
  fixedTop: { backgroundColor: "#191A1C", paddingTop: 44 },
  scrollView: { flex: 1 },
  content: { paddingTop: 8, paddingBottom: 24 },
  resetBtn: {
    alignSelf: "center",
    marginBottom: 8,
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 10,
    backgroundColor: "#2A2A2A",
    borderWidth: 1,
    borderColor: "#444",
  },
  resetBtnText: { color: "#aaa", fontSize: 12, fontWeight: "600" },

  // 스트릭 보호 모달 스타일
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.75)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  modalContent: {
    width: "100%",
    backgroundColor: "#242628",
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#333537",
  },
  modalEmoji: {
    fontSize: 56,
    marginBottom: 16,
  },
  modalTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 12,
  },
  modalDesc: {
    color: "#aaa",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 20,
  },
  highlightText: {
    color: "#FFC800",
    fontWeight: "700",
  },
  modalInfoBox: {
    width: "100%",
    backgroundColor: "#191A1C",
    borderRadius: 16,
    padding: 16,
    gap: 12,
    marginBottom: 24,
  },
  modalInfoItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  modalInfoLabel: {
    color: "#888",
    fontSize: 13,
    fontWeight: "600",
  },
  modalInfoVal: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
  modalBtn: {
    width: "100%",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    marginBottom: 10,
  },
  modalBtnConfirm: {
    backgroundColor: "#FFC800",
  },
  modalBtnConfirmText: {
    color: "#191A1C",
    fontSize: 15,
    fontWeight: "800",
  },
  modalBtnCancel: {
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: "#444",
  },
  modalBtnCancelText: {
    color: "#888",
    fontSize: 14,
    fontWeight: "700",
  },
});
