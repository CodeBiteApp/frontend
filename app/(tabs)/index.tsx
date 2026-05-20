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
import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

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

function darken(hex: string, amount: number): string {
  const num = parseInt(hex.slice(1), 16);
  const r = Math.max(0, (num >> 16) - Math.round(255 * amount));
  const g = Math.max(0, ((num >> 8) & 0xff) - Math.round(255 * amount));
  const b = Math.max(0, (num & 0xff) - Math.round(255 * amount));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

export default function HomeScreen() {
  const router = useRouter();
  const { position, user } = useUserStore();
  const streak = user?.currentStreak || 0;

  const [selected, setSelected] = useState<SelectedStage | null>(null);
  const [animatingStage, setAnimatingStage] = useState<AnimatingStage | null>(null);
  const [currentChapter, setCurrentChapter] = useState(0);

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const prevChapterRef = useRef(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const buttonRefs = useRef<Record<number, View | null>>({});

  const { completedStages, justCompletedStageId, confirmComplete, resetStages } = useStageStore();
  const acornCount = completedStages.length;

  const currentStageId = useMemo(() => {
    for (let i = 1; i <= 84; i++) {
      if (!completedStages.includes(String(i))) return i;
    }
    return 84;
  }, [completedStages]);

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
        <View style={styles.fixedTop}>
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
});
