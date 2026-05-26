import { CHAPTER_LETTERS, CHAPTER_NAMES, STAGE_INFO } from "@/constants/stageInfo";
import React from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export type SelectedStage = { id: number; color: string };

type Props = {
  selected: SelectedStage | null;
  onClose: () => void;
  onStart: (stageId: number) => void;
};

export default function StageModal({ selected, onClose, onStart }: Props) {
  const info = selected ? STAGE_INFO[selected.id] : null;
  const chapterName = info
    ? CHAPTER_NAMES[CHAPTER_LETTERS.indexOf(info.chapter as typeof CHAPTER_LETTERS[number])]
    : "";

  return (
    <Modal
      visible={!!selected}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.sheet}>
        {selected && info && (
          <>
            <View style={[styles.accent, { backgroundColor: selected.color }]} />
            <View style={styles.body}>
              <Text style={styles.stageLabel}>스테이지 {selected.id}</Text>
              <Text style={styles.title}>{info.title}</Text>
              <Text style={styles.description}>
                {chapterName} 파트의 {info.title} 퀴즈가 준비되어 있습니다.
              </Text>
              <TouchableOpacity
                style={[styles.startBtn, { backgroundColor: selected.color }]}
                activeOpacity={0.85}
                onPress={() => onStart(selected.id)}
              >
                <Text style={styles.startBtnText}>시작하기</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                <Text style={styles.cancelBtnText}>닫기</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)" },
  sheet: {
    backgroundColor: "#242628",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: "hidden",
  },
  accent: { height: 6 },
  body: { paddingHorizontal: 28, paddingTop: 24, paddingBottom: 36 },
  stageLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#aaa",
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  title: { fontSize: 22, fontWeight: "800", color: "#fff", marginBottom: 12 },
  startBtn: {
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 12,
  },
  startBtnText: { color: "#fff", fontSize: 16, fontWeight: "800" },
  cancelBtn: { alignItems: "center", paddingVertical: 8 },
  cancelBtnText: { color: "#888", fontSize: 14 },
  description: { fontSize: 13, color: "#aaa", marginBottom: 20 },
});
