import { AnimatedDobi } from "@/components/charactor/AnimatedDobi";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

export default function QuizLoadingScreen() {
  const router = useRouter();
  const [dots, setDots] = useState(".");

  useEffect(() => {
    const dotInterval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "." : prev + "."));
    }, 400);

    const navTimer = setTimeout(() => {
      router.replace("/(tabs)");
    }, 2800);

    return () => {
      clearInterval(dotInterval);
      clearTimeout(navTimer);
    };
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.characterWrapper}>
        <AnimatedDobi />
      </View>
      <View style={styles.textRow}>
        <Text style={styles.label}>퀴즈 생성중</Text>
        <Text style={[styles.label, styles.dots]}>{dots}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#191A1C",
    alignItems: "center",
    justifyContent: "center",
    gap: 32,
  },
  characterWrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
  textRow: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  label: {
    fontSize: 22,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: 0.5,
  },
  dots: {
    color: "#58CC02",
    width: 28,
  },
});
