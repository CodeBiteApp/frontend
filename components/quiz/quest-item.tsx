import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";

type Props = {
  icon: string;
  title: string;
  current: number;
  total: number;
  color: string;
  delay: number;
};

export function QuestItem({ icon, title, current, total, color, delay }: Props) {
  const fillProgress = useSharedValue(0);
  const cardOpacity = useSharedValue(0);
  const cardTranslateY = useSharedValue(24);

  useEffect(() => {
    cardOpacity.value = withDelay(delay, withTiming(1, { duration: 400 }));
    cardTranslateY.value = withDelay(
      delay,
      withTiming(0, { duration: 400, easing: Easing.out(Easing.cubic) })
    );
    fillProgress.value = withDelay(
      delay + 350,
      withTiming(current / total, {
        duration: 900,
        easing: Easing.out(Easing.cubic),
      })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cardStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [{ translateY: cardTranslateY.value }],
  }));

  const fillStyle = useAnimatedStyle(() => ({
    width: `${fillProgress.value * 100}%`,
    backgroundColor: color,
    height: 10,
    borderRadius: 5,
  }));

  const isDone = current >= total;

  return (
    <Animated.View style={[styles.card, cardStyle]}>
      <View style={styles.cardInner}>
        <View style={[styles.iconBadge, { backgroundColor: `${color}22` }]}>
          <Text style={styles.icon}>{icon}</Text>
        </View>
        <View style={styles.info}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{title}</Text>
            {isDone && (
              <View style={[styles.doneBadge, { backgroundColor: color }]}>
                <Text style={styles.doneBadgeText}>완료</Text>
              </View>
            )}
          </View>
          <Text style={[styles.progressText, { color }]}>
            {current} / {total}
          </Text>
        </View>
      </View>
      <View style={styles.progressTrack}>
        <Animated.View style={fillStyle} />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#242628",
    borderRadius: 18,
    padding: 18,
    gap: 14,
    borderWidth: 1,
    borderColor: "#333537",
  },
  cardInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  iconBadge: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  icon: { fontSize: 24 },
  info: { flex: 1, gap: 4 },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  title: {
    fontSize: 15,
    fontWeight: "700",
    color: "#fff",
    flex: 1,
  },
  doneBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  doneBadgeText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#fff",
  },
  progressText: { fontSize: 13, fontWeight: "600" },
  progressTrack: {
    height: 10,
    backgroundColor: "#333537",
    borderRadius: 5,
    overflow: "hidden",
  },
});
