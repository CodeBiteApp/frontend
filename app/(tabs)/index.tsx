import Acorn from "@/components/charactor/Acorn";
import { AnimatedDobiTransition } from "@/components/charactor/AnimatedDobiTransition";
import DobiCodingAnimated from "@/components/charactor/dobi-coding-animated";
import DobiCommon from "@/components/charactor/dobi-common";
import { ACORN_H, ACORN_W, AcornButton } from "@/components/common/AcornButton";
import { useStageStore } from "@/store/useStageStore";
import { useUserStore } from "@/store/useUserStore";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

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

const CHAPTER_NAMES = [
  "기초 프로그래밍",
  "자료구조",
  "알고리즘",
  "운영체제",
  "네트워크",
  "데이터베이스",
  "객체지향",
  "디자인패턴",
  "시스템설계",
  "컴퓨터구조",
];

const STAGE_INFO: Record<number, { title: string; content: string }> =
  Object.fromEntries(
    Array.from({ length: 70 }, (_, i) => {
      const id = i + 1;
      const chapter = Math.floor(i / 7);
      const stage = (i % 7) + 1;
      return [
        id,
        {
          title: `${CHAPTER_NAMES[chapter]} ${stage}단계`,
          content: `챕터 ${
            chapter + 1
          }의 ${stage}번째 스테이지입니다.\n이 단계에서는 ${
            CHAPTER_NAMES[chapter]
          }의 핵심 개념을 퀴즈로 확인합니다.`,
        },
      ];
    }),
  );

const DOTORI_STAGE_IDX = 5;
const CODING_DOBI_STAGE_IDX = 2;
const CODING_DOBI_SIZE = 150;
const DOBI_SIZE = 110;

const ZIGZAG = [0.5, 0.68, 0.6, 0.42, 0.32, 0.52, 0.5];
const ROW_HEIGHT = 90;
const BANNER_H = 68;
const STAGES_TOP_PAD = 80;
const CHAPTER_SECTION_H = BANNER_H + ROW_HEIGHT * 7 + STAGES_TOP_PAD;

// Y position in ScrollView where each chapter starts
const CHAPTER_BREAKPOINTS = Array.from(
  { length: 10 },
  (_, i) => i * CHAPTER_SECTION_H,
);

type SelectedStage = { id: number; color: string };
type AnimatingStage = {
  stageId: string;
  color: string;
  darkColor: string;
  position: { x: number; y: number; width: number; height: number };
  nextPosition: { x: number; y: number; width: number; height: number } | null;
};

function positionLabel(pos: string | null): string {
  if (!pos) return "개발자";
  return pos.replace(" 개발자", "");
}

export default function HomeScreen() {
  const router = useRouter();
  const { position, user } = useUserStore();
  const streak = user?.currentStreak || 0;
  const [selected, setSelected] = useState<SelectedStage | null>(null);
  const [animatingStage, setAnimatingStage] = useState<AnimatingStage | null>(
    null,
  );
  const [currentChapter, setCurrentChapter] = useState(0);

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const prevChapterRef = useRef(0);

  const {
    completedStages,
    justCompletedStageId,
    confirmComplete,
    resetStages,
  } = useStageStore();
  const acornCount = completedStages.length;

  const currentStageId = useMemo(() => {
    for (let i = 1; i <= 70; i++) {
      if (!completedStages.includes(String(i))) return i;
    }
    return 70;
  }, [completedStages]);
  const scrollViewRef = useRef<ScrollView>(null);
  const buttonRefs = useRef<Record<number, View | null>>({});

  const info = selected ? STAGE_INFO[selected.id] : null;

  useFocusEffect(
    useCallback(() => {
      if (!justCompletedStageId) return;

      const stageId = Number(justCompletedStageId);
      const chapterIdx = Math.floor((stageId - 1) / 7);
      const stageInChapter = (stageId - 1) % 7;

      // Y within ScrollView (header is now fixed outside)
      const estimatedStageY =
        chapterIdx * CHAPTER_SECTION_H +
        BANNER_H +
        STAGES_TOP_PAD +
        stageInChapter * ROW_HEIGHT;
      const scrollTarget = Math.max(
        0,
        estimatedStageY - SCREEN_HEIGHT / 2 + ACORN_H / 2,
      );
      scrollViewRef.current?.scrollTo({ y: scrollTarget, animated: true });

      setTimeout(() => {
        const ref = buttonRefs.current[stageId];
        if (!ref) return;
        ref.measureInWindow((x, y, w, h) => {
          if (w === 0 || h === 0) return;
          const color = CHAPTER_COLORS[chapterIdx];
          const nextStageId = stageId < 70 ? stageId + 1 : null;
          const nextRef = nextStageId ? buttonRefs.current[nextStageId] : null;
          if (nextRef) {
            nextRef.measureInWindow((nx, ny, nw, nh) => {
              setAnimatingStage({
                stageId: justCompletedStageId,
                color,
                darkColor: darken(color, 0.25),
                position: { x, y, width: w, height: h },
                nextPosition:
                  nw > 0 && nh > 0
                    ? { x: nx, y: ny, width: nw, height: nh }
                    : null,
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
        if (y >= CHAPTER_BREAKPOINTS[i]) {
          chapter = i;
          break;
        }
      }

      if (chapter !== prevChapterRef.current) {
        prevChapterRef.current = chapter;
        Animated.sequence([
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 60,
            useNativeDriver: true,
          }),
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 80,
            useNativeDriver: true,
          }),
        ]).start();
        setCurrentChapter(chapter);
      }
    },
    [fadeAnim],
  );

  return (
    <>
      <View style={styles.container}>
        {/* 고정 헤더 영역 */}
        <View style={styles.fixedTop}>
          {/* 유저 정보 바 */}
          <View style={styles.userInfoBar}>
            <View style={styles.positionBadge}>
              <Text style={styles.positionText}>
                💼 {positionLabel(position)}
              </Text>
            </View>
            <View style={styles.statsGroup}>
              <View style={styles.statItem}>
                <Text style={styles.streakEmoji}>🔥</Text>
                <Text style={styles.statValue}>{streak}</Text>
                <Text style={styles.statUnit}>일</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Acorn width={20} height={20} />
                <Text style={styles.statValue}>{acornCount}</Text>
              </View>
            </View>
          </View>

          {/* 테스트 초기화 버튼 */}
          <TouchableOpacity
            style={styles.resetBtn}
            onPress={resetStages}
            activeOpacity={0.7}
          >
            <Text style={styles.resetBtnText}>🔄 테스트 초기화</Text>
          </TouchableOpacity>

          {/* 스티키 챕터 헤더 */}
          <Animated.View
            style={[
              styles.stickyChapterBar,
              {
                borderColor: CHAPTER_COLORS[currentChapter],
                opacity: fadeAnim,
              },
            ]}
          >
            <View
              style={[
                styles.chapterBadge,
                { backgroundColor: CHAPTER_COLORS[currentChapter] },
              ]}
            >
              <Text style={styles.chapterBadgeText}>
                챕터 {currentChapter + 1}
              </Text>
            </View>
            <Text style={styles.chapterName}>
              {CHAPTER_NAMES[currentChapter]}
            </Text>
          </Animated.View>
        </View>

        {/* 스크롤 영역 */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          {Array.from({ length: 10 }, (_, c) => {
            const color = CHAPTER_COLORS[c];
            const darkColor = darken(color, 0.25);

            return (
              <View key={c}>
                {/* 챕터 구분선 (BANNER_H 높이 유지) */}
                <View style={styles.chapterDivider}>
                  <View
                    style={[
                      styles.chapterDividerLine,
                      { backgroundColor: color },
                    ]}
                  />
                  <View
                    style={[
                      styles.chapterDividerBadge,
                      { backgroundColor: color },
                    ]}
                  >
                    <Text style={styles.chapterDividerText}>
                      챕터 {c + 1} {CHAPTER_NAMES[c]}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.chapterDividerLine,
                      { backgroundColor: color },
                    ]}
                  />
                </View>

                <View
                  style={{
                    height: ROW_HEIGHT * 7 + STAGES_TOP_PAD,
                    position: "relative",
                  }}
                >
                  {Array.from({ length: 7 }, (_, s) => {
                    const stageId = c * 7 + s + 1;
                    const xRatio = ZIGZAG[s];
                    const x = xRatio * (SCREEN_WIDTH - ACORN_W);
                    const y = s * ROW_HEIGHT + STAGES_TOP_PAD;
                    const side = x > SCREEN_WIDTH / 2 ? "left" : "right";
                    const isCompleted = completedStages.includes(
                      String(stageId),
                    );
                    const isAnimating =
                      animatingStage?.stageId === String(stageId);

                    return (
                      <React.Fragment key={stageId}>
                        {stageId === currentStageId && !animatingStage && (
                          <View
                            style={{
                              position: "absolute",
                              width: DOBI_SIZE,
                              height: DOBI_SIZE,
                              left: x + ACORN_W / 2 - DOBI_SIZE / 2,
                              top: y - DOBI_SIZE + 30,
                              opacity: 0.95,
                            }}
                          >
                            <DobiCommon size={DOBI_SIZE} />
                          </View>
                        )}
                        {s === DOTORI_STAGE_IDX && (
                          <View
                            style={[
                              styles.dotoriImg,
                              side === "left"
                                ? { left: 12, top: y + 4 }
                                : { right: 12, top: y + 4 },
                            ]}
                          >
                            <Acorn width={72} height={72} />
                          </View>
                        )}
                        {s === CODING_DOBI_STAGE_IDX && (
                          <View
                            style={[
                              styles.codingDobiImg,
                              { left: 8, top: y - ROW_HEIGHT },
                            ]}
                          >
                            <DobiCodingAnimated size={CODING_DOBI_SIZE} />
                          </View>
                        )}
                        <AcornButton
                          ref={(r) => {
                            buttonRefs.current[stageId] = r;
                          }}
                          stageNum={stageId}
                          color={color}
                          darkColor={darkColor}
                          completed={isCompleted}
                          style={{
                            left: x,
                            top: y,
                            opacity: isAnimating ? 0 : 1,
                          }}
                          onPress={() => setSelected({ id: stageId, color })}
                        />
                      </React.Fragment>
                    );
                  })}
                </View>
              </View>
            );
          })}

          <View style={{ height: 40 }} />
        </ScrollView>
      </View>

      {/* 스테이지 모달 */}
      <Modal
        visible={!!selected}
        transparent
        animationType="slide"
        onRequestClose={() => setSelected(null)}
      >
        <Pressable style={styles.backdrop} onPress={() => setSelected(null)} />
        <View style={styles.sheet}>
          {selected && info && (
            <>
              <View
                style={[
                  styles.sheetAccent,
                  { backgroundColor: selected.color },
                ]}
              />
              <View style={styles.sheetBody}>
                <Text style={styles.sheetStageLabel}>
                  스테이지 {selected.id}
                </Text>
                <Text style={styles.sheetTitle}>{info.title}</Text>
                <Text style={styles.sheetContent}>{info.content}</Text>
                <TouchableOpacity
                  style={[styles.startBtn, { backgroundColor: selected.color }]}
                  activeOpacity={0.85}
                  onPress={() => {
                    setSelected(null);
                    router.push(`/quiz/${selected.id}` as never);
                  }}
                >
                  <Text style={styles.startBtnText}>시작하기</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => setSelected(null)}
                >
                  <Text style={styles.cancelBtnText}>닫기</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </Modal>

      {/* 도비 먹기 + 이동 애니메이션 */}
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
    </>
  );
}

function darken(hex: string, amount: number): string {
  const num = parseInt(hex.slice(1), 16);
  const r = Math.max(0, (num >> 16) - Math.round(255 * amount));
  const g = Math.max(0, ((num >> 8) & 0xff) - Math.round(255 * amount));
  const b = Math.max(0, (num & 0xff) - Math.round(255 * amount));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#191A1C" },

  // 고정 헤더
  fixedTop: { backgroundColor: "#191A1C", paddingTop: 44 },
  userInfoBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  positionBadge: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#58CC02",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  positionText: { color: "#58CC02", fontSize: 13, fontWeight: "700" },
  statsGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  streakEmoji: { fontSize: 16 },
  statValue: { color: "#ffffff", fontSize: 15, fontWeight: "700" },
  statUnit: { color: "#888", fontSize: 12, fontWeight: "500" },
  statDivider: { width: 1, height: 16, backgroundColor: "#333537" },
  dotoriSmall: { width: 20, height: 20 },

  // 스티키 챕터 바
  stickyChapterBar: {
    marginHorizontal: 20,
    marginTop: 4,
    marginBottom: 16,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderWidth: 1.5,
    backgroundColor: "#242628",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  chapterBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  chapterBadgeText: { color: "#fff", fontSize: 12, fontWeight: "700" },
  chapterName: { color: "#ffffff", fontSize: 16, fontWeight: "700" },

  // 스크롤
  scrollView: { flex: 1 },
  content: { paddingTop: 8, paddingBottom: 24 },
  chapterDivider: {
    height: BANNER_H,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    gap: 10,
    zIndex: 10,
  },
  chapterDividerLine: { flex: 1, height: 1.5, opacity: 0.5 },
  chapterDividerBadge: {
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 5,
  },
  chapterDividerText: { color: "#fff", fontSize: 13, fontWeight: "700" },

  dotoriImg: { position: "absolute", width: 72, height: 72, opacity: 0.88 },
  codingDobiImg: {
    position: "absolute",
    width: CODING_DOBI_SIZE,
    height: CODING_DOBI_SIZE,
    opacity: 0.85,
  },

  // 모달
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)" },
  sheet: {
    backgroundColor: "#242628",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: "hidden",
  },
  sheetAccent: { height: 6 },
  sheetBody: { paddingHorizontal: 28, paddingTop: 24, paddingBottom: 36 },
  sheetStageLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#aaa",
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  sheetTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 12,
  },
  sheetContent: {
    fontSize: 14,
    color: "#ccc",
    lineHeight: 22,
    marginBottom: 28,
  },
  startBtn: {
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 12,
  },
  startBtnText: { color: "#fff", fontSize: 16, fontWeight: "800" },
  cancelBtn: { alignItems: "center", paddingVertical: 8 },
  cancelBtnText: { color: "#888", fontSize: 14 },

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
});
