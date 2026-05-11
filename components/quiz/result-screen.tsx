import { Button } from "@/components/common/Button";
import { QuizResultCharacter } from "@/components/quiz/QuizResultCharacter";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type Props = {
  correct: number;
  total: number;
  accentColor: string;
  onBack: () => void;
  onNext: () => void;
};

export function ResultScreen({ correct, total, accentColor, onBack, onNext }: Props) {
  const points = correct * 10;
  const isPerfect = correct === total;

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backBtn} onPress={onBack}>
        <Text style={styles.backBtnText}>✕</Text>
      </TouchableOpacity>
      <QuizResultCharacter />
      <Text style={styles.title}>
        {isPerfect
          ? "완벽해요!"
          : correct >= total / 2
          ? "잘했어요!"
          : "다시 도전해봐요!"}
      </Text>
      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.label}>정답</Text>
          <Text style={[styles.value, { color: accentColor }]}>
            {correct} / {total}
          </Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.row}>
          <Text style={styles.label}>획득 포인트</Text>
          <Text style={[styles.value, { color: "#FFC800" }]}>+{points}P</Text>
        </View>
      </View>
      <Button
        label="다음"
        onPress={onNext}
        color={accentColor}
        style={{ width: "100%", paddingVertical: 16, marginTop: 8 }}
        textStyle={{ fontWeight: "800" }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#191A1C",
    alignItems: "center",
    paddingTop: 60,
    paddingHorizontal: 28,
    gap: 16,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#242628",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "flex-start",
  },
  backBtnText: { color: "#fff", fontSize: 18, fontWeight: "600" },
  title: { fontSize: 26, fontWeight: "800", color: "#fff" },
  card: {
    width: "100%",
    backgroundColor: "#242628",
    borderRadius: 20,
    padding: 24,
    gap: 16,
    marginTop: 8,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  divider: { height: 1, backgroundColor: "#333537" },
  label: { color: "#888", fontSize: 15 },
  value: { fontSize: 20, fontWeight: "800" },
});
