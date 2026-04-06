import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Dimensions,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

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

// 스테이지별 제목/설명 (70개)
const STAGE_INFO: Record<number, { title: string; content: string }> = Object.fromEntries(
  Array.from({ length: 70 }, (_, i) => {
    const id = i + 1;
    const chapter = Math.floor(i / 7);
    const stage = (i % 7) + 1;
    return [
      id,
      {
        title: `${CHAPTER_NAMES[chapter]} ${stage}단계`,
        content: `챕터 ${chapter + 1}의 ${stage}번째 스테이지입니다.\n이 단계에서는 ${CHAPTER_NAMES[chapter]}의 핵심 개념을 퀴즈로 확인합니다.`,
      },
    ];
  })
);

const COBI_VARIANTS: Record<number, "cobi-1" | "cobi-2"> = {
  0: "cobi-1", 1: "cobi-2", 2: "cobi-1", 3: "cobi-2", 4: "cobi-1",
  5: "cobi-2", 6: "cobi-1", 7: "cobi-2", 8: "cobi-1", 9: "cobi-2",
};

const COBI_STAGE_IDX = 1;
const DOTORI_STAGE_IDX = 5;

const MASCOT_IMAGES = {
  "cobi-1": require("@/assets/images/cobi-1.png"),
  "cobi-2": require("@/assets/images/cobi-2.png"),
  dotori: require("@/assets/images/dotori-1.png"),
};

const ZIGZAG = [0.5, 0.68, 0.6, 0.42, 0.32, 0.52, 0.5];
const BUTTON_SIZE = 64;
const ROW_HEIGHT = 90;

type SelectedStage = { id: number; color: string };

export default function HomeScreen() {
  const router = useRouter();
  const [selected, setSelected] = useState<SelectedStage | null>(null);

  const info = selected ? STAGE_INFO[selected.id] : null;

  return (
    <>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.header}>CodeBite</Text>

        {Array.from({ length: 10 }, (_, c) => {
          const color = CHAPTER_COLORS[c];
          const darkColor = darken(color, 0.25);
          const cobiVariant = COBI_VARIANTS[c];

          return (
            <View key={c}>
              <View style={[styles.chapterBanner, { borderColor: color }]}>
                <View style={[styles.chapterBadge, { backgroundColor: color }]}>
                  <Text style={styles.chapterBadgeText}>챕터 {c + 1}</Text>
                </View>
                <Text style={styles.chapterName}>{CHAPTER_NAMES[c]}</Text>
              </View>

              <View style={{ height: ROW_HEIGHT * 7, position: "relative" }}>
                {Array.from({ length: 7 }, (_, s) => {
                  const stageId = c * 7 + s + 1;
                  const xRatio = ZIGZAG[s];
                  const x = xRatio * (SCREEN_WIDTH - BUTTON_SIZE);
                  const y = s * ROW_HEIGHT;
                  const side = x > SCREEN_WIDTH / 2 ? "left" : "right";

                  return (
                    <React.Fragment key={stageId}>
                      {s === COBI_STAGE_IDX && (
                        <Image
                          source={MASCOT_IMAGES[cobiVariant]}
                          style={[
                            styles.cobiImg,
                            side === "left"
                              ? { left: 8, top: y - 10 }
                              : { right: 8, top: y - 10 },
                          ]}
                          resizeMode="contain"
                        />
                      )}
                      {s === DOTORI_STAGE_IDX && (
                        <Image
                          source={MASCOT_IMAGES["dotori"]}
                          style={[
                            styles.dotoriImg,
                            side === "left"
                              ? { left: 12, top: y + 4 }
                              : { right: 12, top: y + 4 },
                          ]}
                          resizeMode="contain"
                        />
                      )}
                      <TouchableOpacity
                        style={[
                          styles.stageBtn,
                          { left: x, top: y, backgroundColor: color, borderColor: darkColor },
                        ]}
                        activeOpacity={0.8}
                        onPress={() => setSelected({ id: stageId, color })}
                      >
                        <Text style={styles.stageStar}>★</Text>
                        <Text style={styles.stageNum}>{stageId}</Text>
                      </TouchableOpacity>
                    </React.Fragment>
                  );
                })}
              </View>
            </View>
          );
        })}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Stage Modal */}
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
              <View style={[styles.sheetAccent, { backgroundColor: selected.color }]} />
              <View style={styles.sheetBody}>
                <Text style={styles.sheetStageLabel}>스테이지 {selected.id}</Text>
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
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setSelected(null)}>
                  <Text style={styles.cancelBtnText}>닫기</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </Modal>
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
  content: { paddingTop: 56, paddingBottom: 24 },
  header: {
    fontSize: 26,
    fontWeight: "800",
    color: "#ffffff",
    textAlign: "center",
    marginBottom: 24,
    letterSpacing: 1,
  },
  chapterBanner: {
    marginHorizontal: 20,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginBottom: 12,
    borderWidth: 1.5,
    backgroundColor: "#242628",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  chapterBadge: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  chapterBadgeText: { color: "#fff", fontSize: 12, fontWeight: "700" },
  chapterName: { color: "#ffffff", fontSize: 16, fontWeight: "700" },
  stageBtn: {
    position: "absolute",
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    borderBottomWidth: 4,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 6,
  },
  stageStar: { color: "#fff", fontSize: 16, lineHeight: 18 },
  stageNum: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 11,
    fontWeight: "700",
    lineHeight: 13,
  },
  cobiImg: { position: "absolute", width: 180, height: 180, opacity: 0.92 },
  dotoriImg: { position: "absolute", width: 72, height: 72, opacity: 0.88 },

  // Modal
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  sheet: {
    backgroundColor: "#242628",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: "hidden",
  },
  sheetAccent: {
    height: 6,
  },
  sheetBody: {
    paddingHorizontal: 28,
    paddingTop: 24,
    paddingBottom: 36,
  },
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
});
