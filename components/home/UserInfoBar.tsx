import Acorn from "@/components/charactor/Acorn";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import React, { useEffect, useRef, useState } from "react";
import { Animated, StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Props = {
  position: string | null;
  streak: number;
  acornCount: number;
};

function positionLabel(pos: string | null): string {
  if (!pos) return "개발자";
  return pos.replace(" 개발자", "");
}

function useCountUp(value: number) {
  const [display, setDisplay] = useState(value);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const prevRef = useRef(value);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (value === prevRef.current) return;

    const start = prevRef.current;
    const end = value;
    prevRef.current = end;

    if (timerRef.current) clearInterval(timerRef.current);

    const steps = Math.abs(end - start);
    const stepMs = Math.min(Math.max(400 / steps, 16), 60);
    const dir = end > start ? 1 : -1;
    let cur = start;

    timerRef.current = setInterval(() => {
      cur += dir;
      setDisplay(cur);
      if (cur === end) {
        clearInterval(timerRef.current!);
        timerRef.current = null;
      }
    }, stepMs);

    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 1.3, duration: 140, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 4, useNativeDriver: true }),
    ]).start();

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [value]);

  return { display, scaleAnim };
}

export default function UserInfoBar({ position, streak, acornCount }: Props) {
  const router = useRouter();
  const { display: streakDisplay, scaleAnim: streakScale } = useCountUp(streak);
  const { display: acornDisplay, scaleAnim: acornScale } = useCountUp(acornCount);

  const handlePressBookmark = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push("/bookmark");
  };

  return (
    <View style={styles.userInfoBar}>
      <View style={styles.positionBadge}>
        <Text style={styles.positionText}>💼 {positionLabel(position)}</Text>
      </View>
      <View style={styles.statsGroup}>
        <TouchableOpacity
          style={styles.bookmarkBtn}
          onPress={handlePressBookmark}
          activeOpacity={0.7}
        >
          <Ionicons name="bookmark-outline" size={18} color="#ffffff" />
        </TouchableOpacity>
        <View style={styles.statDivider} />
        <Animated.View style={[styles.statItem, { transform: [{ scale: streakScale }] }]}>
          <Text style={styles.streakEmoji}>🔥</Text>
          <Text style={styles.statValue}>{streakDisplay}</Text>
          <Text style={styles.statUnit}>일</Text>
        </Animated.View>
        <View style={styles.statDivider} />
        <Animated.View style={[styles.statItem, { transform: [{ scale: acornScale }] }]}>
          <Acorn width={20} height={20} />
          <Text style={styles.statValue}>{acornDisplay}</Text>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  userInfoBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  positionBadge: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#58CC02",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  positionText: { color: "#58CC02", fontSize: 13, fontWeight: "700" },
  statsGroup: { flexDirection: "row", alignItems: "center", gap: 10 },
  statItem: { flexDirection: "row", alignItems: "center", gap: 3 },
  streakEmoji: { fontSize: 16 },
  statValue: { color: "#ffffff", fontSize: 15, fontWeight: "700" },
  statUnit: { color: "#888", fontSize: 12, fontWeight: "500" },
  statDivider: { width: 1, height: 16, backgroundColor: "#333537" },
  bookmarkBtn: {
    padding: 2,
    alignItems: "center",
    justifyContent: "center",
  },
});
