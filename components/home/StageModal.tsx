import React from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export type SelectedStage = {
  subjectId: number;
  batchIndex: number;
  color: string;
  chapterName: string;
};

type Props = {
  selected: SelectedStage | null;
  onClose: () => void;
  onStart: (subjectId: number, batchIndex: number) => void;
};

export default function StageModal({ selected, onClose, onStart }: Props) {
  return (
    <Modal
      visible={!!selected}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.sheet}>
        {selected && (
          <>
            <View style={[styles.accent, { backgroundColor: selected.color }]} />
            <View style={styles.body}>
              <Text style={styles.stageLabel}>
                {selected.chapterName} {selected.batchIndex + 1}번
              </Text>
              <Text style={styles.title}>
                {selected.chapterName} {selected.batchIndex + 1}
              </Text>
              <Text style={styles.description}>
                {selected.chapterName} 파트의 {selected.batchIndex + 1}번 퀴즈가 준비되어 있습니다.
              </Text>
              <TouchableOpacity
                style={[styles.startBtn, { backgroundColor: selected.color }]}
                activeOpacity={0.85}
                onPress={() => onStart(selected.subjectId, selected.batchIndex)}
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
