import { Button } from "@/components/common/Button";
import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { FlameParticle } from "./fire-particle";

type ServerStreak = {
  alreadyCheckedIn: boolean;
  currentStreak: number;
  bonusEarned: number;
};

type Props = {
  streakDays: number;
  serverStreak?: ServerStreak;
  onNext: () => void;
};

const FLAMES = [
  { offsetX: -90, size: 44, delay: 0, duration: 1400 },
  { offsetX: -50, size: 60, delay: 180, duration: 1200 },
  { offsetX: -10, size: 80, delay: 80, duration: 1600 },
  { offsetX: 30, size: 68, delay: 300, duration: 1350 },
  { offsetX: 75, size: 50, delay: 140, duration: 1500 },
  { offsetX: -70, size: 36, delay: 420, duration: 1100 },
  { offsetX: 55, size: 38, delay: 260, duration: 1300 },
  { offsetX: 10, size: 56, delay: 500, duration: 1450 },
];

export function StreakScreen({ streakDays, serverStreak, onNext }: Props) {
  const displayDays = serverStreak?.currentStreak ?? streakDays;
  const titleScale = useSharedValue(0.3);
  const titleOpacity = useSharedValue(0);
  const subtitleOpacity = useSharedValue(0);
  const glowOpacity = useSharedValue(0);

  useEffect(() => {
    titleScale.value = withSpring(1, { damping: 7, stiffness: 110 });
    titleOpacity.value = withTiming(1, { duration: 450 });
    subtitleOpacity.value = withDelay(600, withTiming(1, { duration: 500 }));
    glowOpacity.value = withDelay(
      200,
      withRepeat(
        withSequence(
          withTiming(0.6, { duration: 1000 }),
          withTiming(0.2, { duration: 1000 }),
        ),
        -1,
        true,
      ),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const titleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: titleScale.value }],
    opacity: titleOpacity.value,
  }));

  const subtitleStyle = useAnimatedStyle(() => ({
    opacity: subtitleOpacity.value,
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.fireGlow, glowStyle]} />

      <View style={styles.fireArea}>
        {FLAMES.map((f, i) => (
          <FlameParticle key={i} {...f} />
        ))}
      </View>

      <Animated.View style={[styles.textContainer, titleStyle]}>
        <Text style={styles.daysNumber}>{displayDays}</Text>
        <Text style={styles.daysLabel}>일째</Text>
        <Text style={styles.mainLabel}>연속 학습중!</Text>
      </Animated.View>

      <Animated.Text style={[styles.subtitle, subtitleStyle]}>
        {serverStreak?.alreadyCheckedIn
          ? "오늘 이미 도토리를 획득했어요"
          : "🎯 오늘도 코딩 한 입 완료!"}
      </Animated.Text>

      <View style={{ flex: 1 }} />

      <Button
        label="다음"
        onPress={onNext}
        color="#FF9600"
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
    paddingHorizontal: 28,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#242628",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "flex-start",
    marginTop: 56,
    marginBottom: 4,
  },
  fireGlow: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 400,
    backgroundColor: "#FF6B0022",
    borderRadius: 200,
  },
  fireArea: {
    height: 200,
    width: 220,
    justifyContent: "flex-end",
    alignItems: "center",
    marginTop: 40,
    marginBottom: 16,
  },
  textContainer: {
    alignItems: "center",
    gap: 4,
  },
  daysNumber: {
    fontSize: 88,
    fontWeight: "900",
    color: "#FF9600",
    lineHeight: 96,
    letterSpacing: -2,
  },
  daysLabel: {
    fontSize: 28,
    fontWeight: "800",
    color: "#FFC800",
    marginTop: -8,
  },
  mainLabel: {
    fontSize: 32,
    fontWeight: "900",
    color: "#fff",
    marginTop: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: "#aaa",
    marginTop: 16,
    fontWeight: "600",
  },
});
