import { AnimatedDobiTransition } from "@/components/charactor/AnimatedDobiTransition";
import { ACORN_H } from "@/components/common/AcornButton";
import ChapterSection from "@/components/home/ChapterSection";
import HomeSkeleton from "@/components/home/HomeSkeleton";
import StageModal, { SelectedStage } from "@/components/home/StageModal";
import StickyChapterBar from "@/components/home/StickyChapterBar";
import UserInfoBar from "@/components/home/UserInfoBar";
import { BANNER_H, computeBreakpoints, ROW_HEIGHT, STAGES_TOP_PAD } from "@/constants/homeLayout";
import { CHAPTER_COLORS } from "@/constants/stageInfo";
import { useStageStore } from "@/store/useStageStore";
import { useSubjectStore } from "@/store/useSubjectStore";
import { useUserStore } from "@/store/useUserStore";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ConfirmModal } from "@/components/common/ConfirmModal";
import { useAppAlert } from "@/hooks/useAppAlert";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { restoreStreak, resetStreak } from "@/api/streak";
import { buildInterleavedOrder } from "@/utils/quizGenerator";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

type AnimatingStage = {
  stageId: string;
  color: string;
  darkColor: string;
  position: { x: number; y: number; width: number; height: number };
  nextPosition: { x: number; y: number; width: number; height: number } | null;
};


function getSeoulDate(dateInput: string | Date | null): string | null {
  if (!dateInput) return null;
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return null;

  const seoulFormatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const parts = seoulFormatter.formatToParts(d);
  const year = parts.find((p) => p.type === "year")?.value;
  const month = parts.find((p) => p.type === "month")?.value;
  const day = parts.find((p) => p.type === "day")?.value;
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
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
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

  const { subjects, conceptsMap, isLoading, isHydrated, hasMoreSubjects, refreshConcepts, loadMoreSubjects } = useSubjectStore();
  const { completedStages, justCompletedStageId, confirmComplete, resetStages } = useStageStore();

  const { show: showAlert, hide: hideAlert, config: alertConfig, isVisible: alertVisible } = useAppAlert();

  const [selected, setSelected] = useState<SelectedStage | null>(null);
  const [animatingStage, setAnimatingStage] = useState<AnimatingStage | null>(null);
  const [currentChapter, setCurrentChapter] = useState(0);
  const [showStreakModal, setShowStreakModal] = useState(false);
  const [missedDays, setMissedDays] = useState(0);
  const [isRestoring, setIsRestoring] = useState(false);
  const [hasCheckedStreak, setHasCheckedStreak] = useState(false);

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const prevChapterRef = useRef(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const buttonRefs = useRef<Record<number, View | null>>({});
  const animatedStageRef = useRef<string | null>(null);

  const acornCount = user?.dotori ?? 0;

  const BATCH_SIZE = 5;

  // 챕터별 배치 수 배열
  const batchCountPerSubject = useMemo(
    () => subjects.map((s) => {
      const n = (conceptsMap[s.subjectId] ?? []).length;
      return n === 0 ? 0 : Math.ceil(n / BATCH_SIZE);
    }),
    [subjects, conceptsMap],
  );

  // 서버 기준으로 완료된 배치 키 Set (BE getSlotConcepts와 동일한 인터리빙 순서 기준)
  const studiedBatchKeys = useMemo(() => {
    const keys = new Set<string>();
    for (const subject of subjects) {
      const concepts = buildInterleavedOrder(conceptsMap[subject.subjectId] ?? []);
      const n = concepts.length;
      if (n === 0) continue;
      const totalBatches = Math.ceil(n / BATCH_SIZE);
      for (let b = 0; b < totalBatches; b++) {
        const batchConcepts = Array.from({ length: BATCH_SIZE }, (_, i) => concepts[(b * BATCH_SIZE + i) % n]);
        if (batchConcepts.every(c => c.isStudied)) {
          keys.add(`${subject.subjectId}_${b}`);
        }
      }
    }
    return keys;
  }, [subjects, conceptsMap]);

  // 다음에 풀어야 할 배치 (BE 인터리빙 순서 기준 미완료 첫 번째)
  const currentBatch = useMemo(() => {
    for (const subject of subjects) {
      const concepts = buildInterleavedOrder(conceptsMap[subject.subjectId] ?? []);
      const n = concepts.length;
      if (n === 0) continue;
      const totalBatches = Math.ceil(n / BATCH_SIZE);
      for (let b = 0; b < totalBatches; b++) {
        const batchKey = `${subject.subjectId}_${b}`;
        if (completedStages.includes(batchKey)) continue;
        const batchConcepts = Array.from({ length: BATCH_SIZE }, (_, i) => concepts[(b * BATCH_SIZE + i) % n]);
        if (!batchConcepts.every(c => c.isStudied)) {
          return { subjectId: subject.subjectId, batchIndex: b };
        }
      }
    }
    const last = subjects[subjects.length - 1];
    if (!last) return { subjectId: 0, batchIndex: 0 };
    const n = (conceptsMap[last.subjectId] ?? []).length;
    return { subjectId: last.subjectId, batchIndex: Math.max(0, Math.ceil(n / BATCH_SIZE) - 1) };
  }, [subjects, conceptsMap, completedStages]);

  // 스크롤 기반 챕터 감지용 breakpoints
  const chapterBreakpoints = useMemo(
    () => computeBreakpoints(batchCountPerSubject),
    [batchCountPerSubject],
  );

  // 서브젝트 이름/색상 배열
  const subjectNames = useMemo(() => subjects.map((s) => s.name), [subjects]);
  const subjectColors = useMemo(
    () => subjects.map((_, i) => CHAPTER_COLORS[i % CHAPTER_COLORS.length]),
    [subjects],
  );

  // 포커스 시 subjects + concepts + user 리프레시
  useFocusEffect(
    useCallback(() => {
      setHasCheckedStreak(false);
      refreshUser();
      refreshConcepts();
    }, [refreshUser, refreshConcepts]),
  );

  // 스트릭 체크
  useEffect(() => {
    if (!user || hasCheckedStreak) return;
    const d = calculateMissedDays(user.lastStudy);
    if (d >= 2 && user.protector >= d && user.currentStreak > 0) {
      setMissedDays(d);
      setShowStreakModal(true);
    }
    setHasCheckedStreak(true);
  }, [user, hasCheckedStreak]);

  // 퀴즈 완료 후 도비 애니메이션
  useFocusEffect(
    useCallback(() => {
      if (!justCompletedStageId) return;
      if (animatedStageRef.current === justCompletedStageId) return;
      animatedStageRef.current = justCompletedStageId;

      // batchKey 파싱: "${subjectId}_${batchIndex}"
      const [sidStr, biStr] = justCompletedStageId.split("_");
      const sid = Number(sidStr);
      const bi = Number(biStr);
      const chapterIdx = subjects.findIndex(s => s.subjectId === sid);
      const stageInChapter = bi;

      const estimatedStageY =
        chapterBreakpoints[chapterIdx >= 0 ? chapterIdx : 0] + BANNER_H + STAGES_TOP_PAD + stageInChapter * ROW_HEIGHT;
      const scrollTarget = Math.max(0, estimatedStageY - SCREEN_HEIGHT / 2 + ACORN_H / 2);
      scrollViewRef.current?.scrollTo({ y: scrollTarget, animated: true });

      setTimeout(() => {
        const virtualId = sid * 10000 + bi;
        const ref = buttonRefs.current[virtualId];
        if (!ref) {
          confirmComplete(justCompletedStageId);
          animatedStageRef.current = null;
          return;
        }
        ref.measureInWindow((x, y, w, h) => {
          if (w === 0 || h === 0) {
            confirmComplete(justCompletedStageId);
            animatedStageRef.current = null;
            return;
          }
          const color = subjectColors[chapterIdx >= 0 ? chapterIdx : 0] ?? "#58CC02";

          // 다음 배치 계산
          const allBatchKeys = subjects.flatMap((s) => {
            const n = (conceptsMap[s.subjectId] ?? []).length;
            const total = n === 0 ? 0 : Math.ceil(n / BATCH_SIZE);
            return Array.from({ length: total }, (_, i) => `${s.subjectId}_${i}`);
          });
          const currentPos = allBatchKeys.indexOf(justCompletedStageId);
          const nextBatchKey = currentPos !== -1 && currentPos < allBatchKeys.length - 1
            ? allBatchKeys[currentPos + 1]
            : null;

          const showWithNextRef = (nextVirtualId: number | null) => {
            if (nextVirtualId !== null) {
              const nextRef = buttonRefs.current[nextVirtualId];
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
                return;
              }
            }
            setAnimatingStage({
              stageId: justCompletedStageId,
              color,
              darkColor: darken(color, 0.25),
              position: { x, y, width: w, height: h },
              nextPosition: null,
            });
          };

          if (nextBatchKey) {
            const [nsid, nbi] = nextBatchKey.split("_").map(Number);
            showWithNextRef(nsid * 10000 + nbi);
          } else {
            showWithNextRef(null);
          }
        });
      }, 650);
    }, [justCompletedStageId, chapterBreakpoints, subjects, conceptsMap, subjectColors]),
  );

  const handleEatingFinish = useCallback(() => {
    if (animatingStage) {
      confirmComplete(animatingStage.stageId);
      setAnimatingStage(null);
      animatedStageRef.current = null;
    }
  }, [animatingStage, confirmComplete]);

  const handleScroll = useCallback(
    (event: any) => {
      const { contentOffset, layoutMeasurement, contentSize } = event.nativeEvent;
      const y = contentOffset.y;

      // 챕터 sticky bar 감지
      let chapter = 0;
      for (let i = chapterBreakpoints.length - 1; i >= 0; i--) {
        if (y >= chapterBreakpoints[i]) {
          chapter = i;
          break;
        }
      }
      if (chapter !== prevChapterRef.current) {
        prevChapterRef.current = chapter;
        Animated.sequence([
          Animated.timing(fadeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
          Animated.timing(fadeAnim, { toValue: 1, duration: 80, useNativeDriver: true }),
        ]).start();
        setCurrentChapter(chapter);
      }

      // 하단 200px 이내 진입 시 다음 페이지 로드
      const isNearBottom = y + layoutMeasurement.height >= contentSize.height - 200;
      if (isNearBottom && hasMoreSubjects && !isLoading) {
        loadMoreSubjects();
      }
    },
    [fadeAnim, chapterBreakpoints, hasMoreSubjects, isLoading, loadMoreSubjects],
  );

  const handleRestoreStreak = async () => {
    setIsRestoring(true);
    try {
      await restoreStreak();
      setShowStreakModal(false);
      await refreshUser();
      showAlert("스트릭 유지 완료", "보호권이 소모되었으며 스트릭이 보존되었습니다! 🛡️");
    } catch (e: any) {
      showAlert("에러", e.message || "스트릭 복구에 실패했습니다.");
    } finally {
      setIsRestoring(false);
    }
  };

  const handleCancelStreak = async () => {
    setIsRestoring(true);
    try {
      await resetStreak();
      setShowStreakModal(false);
      await refreshUser();
      showAlert("스트릭 초기화", "연속 학습 스트릭이 0일로 재설정되었습니다.");
    } catch (e: any) {
      showAlert("에러", e.message || "스트릭 초기화에 실패했습니다.");
    } finally {
      setIsRestoring(false);
    }
  };

  if (!isHydrated && subjects.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.fixedTop}>
          <UserInfoBar position={position} streak={streak} acornCount={acornCount} />
        </View>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.content} scrollEnabled={false}>
          <HomeSkeleton />
        </ScrollView>
      </View>
    );
  }

  return (
    <>
      <View style={styles.container}>
        <View style={[styles.fixedTop, { paddingTop: Math.max(insets.top, 16) }]}>
          <UserInfoBar position={position} streak={streak} acornCount={acornCount} />
          <TouchableOpacity style={styles.resetBtn} onPress={resetStages} activeOpacity={0.7}>
            <Text style={styles.resetBtnText}>🔄 테스트 초기화</Text>
          </TouchableOpacity>
          <StickyChapterBar
            currentChapter={currentChapter}
            fadeAnim={fadeAnim}
            subjectNames={subjectNames}
            colors={subjectColors}
          />
        </View>

        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          {subjects.map((subject, idx) => {
            const color = subjectColors[idx];
            const letter = String.fromCharCode(65 + idx);
            const batchCount = batchCountPerSubject[idx] ?? 0;

            return (
              <ChapterSection
                key={subject.subjectId}
                letter={letter}
                name={subject.name}
                color={color}
                darkColor={darken(color, 0.25)}
                subjectId={subject.subjectId}
                batchCount={batchCount}
                completedStages={completedStages}
                studiedBatchKeys={studiedBatchKeys}
                currentSubjectId={currentBatch.subjectId}
                currentBatchIndex={currentBatch.batchIndex}
                animatingStageId={animatingStage?.stageId ?? null}
                buttonRefs={buttonRefs}
                onStagePress={(sid, bi, stageColor) => {
                  setSelected({
                    subjectId: sid,
                    batchIndex: bi,
                    color: stageColor,
                    chapterName: subject.name,
                  });
                }}
              />
            );
          })}
          {isLoading && subjects.length > 0 && (
            <View style={styles.bottomLoader}>
              <ActivityIndicator size="small" color="#58CC02" />
            </View>
          )}
          <View style={{ height: 40 }} />
        </ScrollView>
      </View>

      <StageModal
        selected={selected}
        onClose={() => setSelected(null)}
        onStart={(subjectId, batchIndex) => {
          setSelected(null);
          setTimeout(() => {
            router.push(`/quiz/${subjectId}_${batchIndex}` as never);
          }, 300);
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

      {/* 스트릭 보호권 팝업 */}
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
              보유한 스트릭 보호권{" "}
              <Text style={styles.highlightText}>{missedDays}개</Text>를 소모하여 스트릭을 유지할 수 있습니다.
            </Text>

            <View style={styles.modalInfoBox}>
              <View style={styles.modalInfoItem}>
                <Text style={styles.modalInfoLabel}>보유 보호권</Text>
                <Text style={styles.modalInfoVal}>{user?.protector ?? 0}개</Text>
              </View>
              <View style={styles.modalInfoItem}>
                <Text style={styles.modalInfoLabel}>소모 보호권</Text>
                <Text style={[styles.modalInfoVal, { color: "#ff4b4b", fontWeight: "700" }]}>
                  -{missedDays}개
                </Text>
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

      <ConfirmModal
        visible={alertVisible}
        title={alertConfig?.title ?? ""}
        message={alertConfig?.message}
        buttons={alertConfig?.buttons}
        onDismiss={hideAlert}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#191A1C" },
  fixedTop: { backgroundColor: "#191A1C", paddingTop: 44 },
  scrollView: { flex: 1 },
  content: { paddingTop: 8, paddingBottom: 24 },
  center: { alignItems: "center", justifyContent: "center" },
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
  modalEmoji: { fontSize: 56, marginBottom: 16 },
  modalTitle: { color: "#fff", fontSize: 20, fontWeight: "800", marginBottom: 12 },
  modalDesc: { color: "#aaa", fontSize: 14, textAlign: "center", lineHeight: 22, marginBottom: 20 },
  highlightText: { color: "#FFC800", fontWeight: "700" },
  modalInfoBox: {
    width: "100%",
    backgroundColor: "#191A1C",
    borderRadius: 16,
    padding: 16,
    gap: 12,
    marginBottom: 24,
  },
  modalInfoItem: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  modalInfoLabel: { color: "#888", fontSize: 13, fontWeight: "600" },
  modalInfoVal: { color: "#fff", fontSize: 14, fontWeight: "700" },
  modalBtn: { width: "100%", paddingVertical: 14, borderRadius: 14, alignItems: "center", marginBottom: 10 },
  modalBtnConfirm: { backgroundColor: "#FFC800" },
  modalBtnConfirmText: { color: "#191A1C", fontSize: 15, fontWeight: "800" },
  modalBtnCancel: { backgroundColor: "transparent", borderWidth: 1.5, borderColor: "#444" },
  modalBtnCancelText: { color: "#888", fontSize: 14, fontWeight: "700" },
  bottomLoader: { paddingVertical: 16, alignItems: "center" },
});
