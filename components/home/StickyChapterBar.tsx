import { CHAPTER_COLORS, CHAPTER_NAMES } from "@/constants/stageInfo";
import React from "react";
import { Animated, StyleSheet, Text, View } from "react-native";

type Props = {
  currentChapter: number;
  fadeAnim: Animated.Value;
};

export default function StickyChapterBar({ currentChapter, fadeAnim }: Props) {
  const color = CHAPTER_COLORS[currentChapter];
  return (
    <Animated.View style={[styles.bar, { borderColor: color, opacity: fadeAnim }]}>
      <View style={[styles.badge, { backgroundColor: color }]}>
        <Text style={styles.badgeText}>{String.fromCharCode(65 + currentChapter)}</Text>
      </View>
      <Text style={styles.name}>{CHAPTER_NAMES[currentChapter]}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  bar: {
    marginHorizontal: 20,
    marginTop: 4,
    marginBottom: 16,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderWidth: 1.5,
    backgroundColor: "#242628",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  badge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  badgeText: { color: "#fff", fontSize: 12, fontWeight: "700" },
  name: { color: "#ffffff", fontSize: 16, fontWeight: "700" },
});
