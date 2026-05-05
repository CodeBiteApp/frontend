import { Button } from "@/components/common/Button";
import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { QuestItem } from "./quest-item";

type Props = {
  onDone: () => void;
};

// 실제 서비스에서는 사용자/퀘스트 상태에서 가져와야 합니다
const QUESTS = [
  { icon: "📚", title: "오늘의 퀴즈 도전", current: 1, total: 5, color: "#58CC02", delay: 100 },
  { icon: "🔥", title: "연속 학습 달성", current: 2, total: 3, color: "#FF9600", delay: 280 },
  { icon: "⭐", title: "완벽한 점수 달성", current: 0, total: 1, color: "#FFC800", delay: 460 },
];

export function QuestRewardScreen({ onDone }: Props) {
  const titleOpacity = useSharedValue(0);
  const titleTranslateY = useSharedValue(-20);

  useEffect(() => {
    titleOpacity.value = withTiming(1, { duration: 450 });
    titleTranslateY.value = withTiming(0, {
      duration: 450,
      easing: Easing.out(Easing.cubic),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleTranslateY.value }],
  }));

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.titleArea, titleStyle]}>
        <Text style={styles.mainIcon}>🎁</Text>
        <Text style={styles.mainTitle}>퀘스트 보상</Text>
        <Text style={styles.mainSubtitle}>퀘스트를 완료하고 보상을 받아보세요</Text>
      </Animated.View>

      <View style={styles.list}>
        {QUESTS.map((q, i) => (
          <QuestItem key={i} {...q} />
        ))}
      </View>

      <View style={{ flex: 1 }} />

      <Button
        label="홈으로"
        onPress={onDone}
        color="#58CC02"
        style={{ width: "100%", paddingVertical: 16, marginBottom: 40 }}
        textStyle={{ fontWeight: "800", fontSize: 18 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#191A1C",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  titleArea: {
    alignItems: "center",
    marginBottom: 32,
    gap: 6,
  },
  mainIcon: { fontSize: 52, marginBottom: 4 },
  mainTitle: { fontSize: 28, fontWeight: "900", color: "#fff" },
  mainSubtitle: { fontSize: 14, color: "#888", fontWeight: "500" },
  list: { width: "100%", gap: 14 },
});
