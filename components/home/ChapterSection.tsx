import Acorn from "@/components/charactor/Acorn";
import DobiCodingAnimated from "@/components/charactor/dobi-coding-animated";
import DobiCommon from "@/components/charactor/dobi-common";
import { ACORN_H, ACORN_W, AcornButton } from "@/components/common/AcornButton";
import {
  BANNER_H,
  CODING_DOBI_SIZE,
  CODING_DOBI_STAGE_IDX,
  DOBI_SIZE,
  DOTORI_STAGE_IDX,
  ROW_HEIGHT,
  STAGES_TOP_PAD,
  ZIGZAG,
} from "@/constants/homeLayout";
import React from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

type Props = {
  letter: string;
  name: string;
  color: string;
  darkColor: string;
  stageIds: number[];
  completedStages: string[];
  studiedConceptIds: Set<number>;
  currentStageId: number;
  animatingStageId: string | null;
  buttonRefs: React.MutableRefObject<Record<number, View | null>>;
  onStagePress: (stageId: number, color: string) => void;
};

export default function ChapterSection({
  letter,
  name,
  color,
  darkColor,
  stageIds,
  completedStages,
  studiedConceptIds,
  currentStageId,
  animatingStageId,
  buttonRefs,
  onStagePress,
}: Props) {
  return (
    <View>
      <View style={styles.chapterDivider}>
        <View style={[styles.dividerLine, { backgroundColor: color }]} />
        <View style={[styles.dividerBadge, { backgroundColor: color }]}>
          <Text style={styles.dividerText}>
            {letter}. {name}
          </Text>
        </View>
        <View style={[styles.dividerLine, { backgroundColor: color }]} />
      </View>

      <View style={{ height: ROW_HEIGHT * stageIds.length + STAGES_TOP_PAD, position: "relative" }}>
        {stageIds.map((stageId, s) => {
          const xRatio = ZIGZAG[s % ZIGZAG.length];
          const x = xRatio * (SCREEN_WIDTH - ACORN_W);
          const y = s * ROW_HEIGHT + STAGES_TOP_PAD;
          const side = x > SCREEN_WIDTH / 2 ? "left" : "right";
          const isCompleted =
            studiedConceptIds.has(stageId) || completedStages.includes(String(stageId));
          const isAnimating = animatingStageId === String(stageId);

          return (
            <React.Fragment key={stageId}>
              {stageId === currentStageId && !animatingStageId && (
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
                    side === "left" ? { left: 12, top: y + 4 } : { right: 12, top: y + 4 },
                  ]}
                >
                  <Acorn width={72} height={72} />
                </View>
              )}
              {s === CODING_DOBI_STAGE_IDX && (
                <View style={[styles.codingDobiImg, { left: 8, top: y - ROW_HEIGHT }]}>
                  <DobiCodingAnimated size={CODING_DOBI_SIZE} />
                </View>
              )}
              <AcornButton
                ref={(r) => { buttonRefs.current[stageId] = r; }}
                stageNum={stageId}
                color={color}
                darkColor={darkColor}
                completed={isCompleted}
                style={{ left: x, top: y, opacity: isAnimating ? 0 : 1 }}
                onPress={() => onStagePress(stageId, color)}
              />
            </React.Fragment>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  chapterDivider: {
    height: BANNER_H,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    gap: 10,
    zIndex: 10,
  },
  dividerLine: { flex: 1, height: 1.5, opacity: 0.5 },
  dividerBadge: { borderRadius: 20, paddingHorizontal: 14, paddingVertical: 5 },
  dividerText: { color: "#fff", fontSize: 13, fontWeight: "700" },
  dotoriImg: { position: "absolute", width: 72, height: 72, opacity: 0.88 },
  codingDobiImg: {
    position: "absolute",
    width: CODING_DOBI_SIZE,
    height: CODING_DOBI_SIZE,
    opacity: 0.85,
  },
});
