import { ACORN_H, ACORN_W } from "@/components/common/AcornButton";
import { BANNER_H, ROW_HEIGHT, STAGES_TOP_PAD, ZIGZAG } from "@/constants/homeLayout";
import React, { useEffect, useRef } from "react";
import { Animated, Dimensions, StyleSheet, View } from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const SKELETON_SECTIONS = [
  { stageCount: 6 },
  { stageCount: 5 },
];

function usePulse() {
  const opacity = useRef(new Animated.Value(0.3)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.7, duration: 750, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 750, useNativeDriver: true }),
      ]),
    ).start();
  }, [opacity]);
  return opacity;
}

function SkeletonSection({ stageCount, opacity }: { stageCount: number; opacity: Animated.Value }) {
  return (
    <View>
      {/* 챕터 배너 */}
      <View style={styles.bannerRow}>
        <Animated.View style={[styles.dividerLine, { opacity }]} />
        <Animated.View style={[styles.bannerBadge, { opacity }]} />
        <Animated.View style={[styles.dividerLine, { opacity }]} />
      </View>

      {/* 스테이지 버튼들 */}
      <View style={{ height: ROW_HEIGHT * stageCount + STAGES_TOP_PAD, position: "relative" }}>
        {Array.from({ length: stageCount }).map((_, s) => {
          const xRatio = ZIGZAG[s % ZIGZAG.length];
          const x = xRatio * (SCREEN_WIDTH - ACORN_W);
          const y = s * ROW_HEIGHT + STAGES_TOP_PAD;
          return (
            <Animated.View
              key={s}
              style={[styles.acornPlaceholder, { left: x, top: y, opacity }]}
            />
          );
        })}
      </View>
    </View>
  );
}

export default function HomeSkeleton() {
  const opacity = usePulse();
  return (
    <View style={styles.container}>
      {SKELETON_SECTIONS.map((section, i) => (
        <SkeletonSection key={i} stageCount={section.stageCount} opacity={opacity} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingTop: 8 },
  bannerRow: {
    height: BANNER_H,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    gap: 10,
  },
  dividerLine: { flex: 1, height: 1.5, backgroundColor: "#2A2A2A", borderRadius: 2 },
  bannerBadge: {
    width: 120,
    height: 28,
    backgroundColor: "#2A2A2A",
    borderRadius: 20,
  },
  acornPlaceholder: {
    position: "absolute",
    width: ACORN_W,
    height: ACORN_H,
    backgroundColor: "#2A2A2A",
    borderRadius: 14,
  },
});
