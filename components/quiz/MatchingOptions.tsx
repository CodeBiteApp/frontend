import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

const PAIR_COLORS = ["#FF9600", "#CE82FF", "#00CD9C"];

type Props = {
  leftItems: string[];
  rightItems: string[]; // 표시 순서 (셔플 가능)
  correctPairs: Record<number, number>; // leftIndex -> rightIndex
  isAnswered: boolean;
  accentColor?: string;
  onComplete: (pairs: Record<number, number>) => void;
};

export function MatchingOptions({
  leftItems,
  rightItems,
  correctPairs,
  isAnswered,
  accentColor = "#1CB0F6",
  onComplete,
}: Props) {
  const [selectedLeft, setSelectedLeft] = useState<number | null>(null);
  const [userPairs, setUserPairs] = useState<Record<number, number>>({});

  const handleLeftPress = (index: number) => {
    if (isAnswered) return;
    setSelectedLeft((prev) => (prev === index ? null : index));
  };

  const handleRightPress = (rightIndex: number) => {
    if (isAnswered || selectedLeft === null) return;
    const newPairs = { ...userPairs };
    for (const k of Object.keys(newPairs)) {
      if (newPairs[Number(k)] === rightIndex) delete newPairs[Number(k)];
    }
    newPairs[selectedLeft] = rightIndex;
    setUserPairs(newPairs);
    setSelectedLeft(null);
    if (Object.keys(newPairs).length === leftItems.length) {
      onComplete(newPairs);
    }
  };

  const getLeftColor = (i: number): string | null => {
    if (selectedLeft === i) return accentColor;
    if (!(i in userPairs)) return null;
    return correctPairs[i] === userPairs[i] ? "#58CC02" : "#FF4B4B";
  };

  const getRightColor = (rightIndex: number): string | null => {
    const entry = Object.entries(userPairs).find(([, v]) => v === rightIndex);
    if (!entry) return null;
    const leftIndex = Number(entry[0]);
    return correctPairs[leftIndex] === rightIndex ? "#58CC02" : "#FF4B4B";
  };

  const getRightIcon = (rightIndex: number): string | null => {
    const entry = Object.entries(userPairs).find(([, v]) => v === rightIndex);
    if (!entry) return null;
    const leftIndex = Number(entry[0]);
    return correctPairs[leftIndex] === rightIndex ? "✓" : "✗";
  };

  return (
    <View style={styles.container}>
      <View style={styles.columns}>
        {/* 왼쪽 열 */}
        <View style={styles.column}>
          {leftItems.map((item, i) => {
            const color = getLeftColor(i);
            const isSelected = selectedLeft === i;
            return (
              <TouchableOpacity
                key={i}
                style={[
                  styles.item,
                  color
                    ? { borderColor: color, backgroundColor: color + "22" }
                    : isSelected
                    ? { borderColor: accentColor, backgroundColor: "#1e2022" }
                    : null,
                ]}
                onPress={() => handleLeftPress(i)}
                activeOpacity={0.8}
              >
                <View
                  style={[
                    styles.badge,
                    { backgroundColor: color || (isSelected ? accentColor : "#333537") },
                  ]}
                >
                  <Text style={styles.badgeText}>{i + 1}</Text>
                </View>
                <Text
                  style={[
                    styles.itemText,
                    (color || isSelected) && { color: color || accentColor },
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.divider} />

        {/* 오른쪽 열 */}
        <View style={styles.column}>
          {rightItems.map((item, i) => {
            const color = getRightColor(i);
            const icon = getRightIcon(i);
            const isTargetable = selectedLeft !== null && !color;
            return (
              <TouchableOpacity
                key={i}
                style={[
                  styles.item,
                  color
                    ? { borderColor: color, backgroundColor: color + "22" }
                    : isTargetable
                    ? { borderColor: accentColor + "55" }
                    : null,
                ]}
                onPress={() => handleRightPress(i)}
                activeOpacity={0.8}
              >
                <Text style={[styles.itemText, color ? { color } : null]}>
                  {item}
                </Text>
                {icon && (
                  <Text style={[styles.icon, { color }]}>{icon}</Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {!isAnswered && (
        <Text style={styles.hint}>
          {selectedLeft !== null
            ? "오른쪽 항목을 선택하세요"
            : "왼쪽 항목을 먼저 선택하세요"}
        </Text>
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 12 },
  columns: { flexDirection: "row" },
  column: { flex: 1, gap: 8 },
  divider: {
    width: 1,
    backgroundColor: "#333537",
    marginHorizontal: 10,
    alignSelf: "stretch",
  },
  item: {
    borderRadius: 12,
    padding: 12,
    borderWidth: 2,
    borderColor: "#333537",
    backgroundColor: "#242628",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    minHeight: 60,
  },
  badge: {
    width: 22,
    height: 22,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  badgeText: { color: "#fff", fontSize: 12, fontWeight: "700" },
  itemText: {
    fontSize: 13,
    color: "#ccc",
    flex: 1,
    lineHeight: 18,
  },
  hint: {
    textAlign: "center",
    color: "#666",
    fontSize: 13,
  },
  icon: {
    fontSize: 16,
    fontWeight: "700",
    flexShrink: 0,
  },
});
