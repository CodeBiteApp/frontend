import React from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export function LoadingState() {
  return (
    <View style={styles.centerBox}>
      <ActivityIndicator size="large" color="#FFC800" />
      <Text style={styles.stateText}>랭킹을 불러오는 중...</Text>
    </View>
  );
}

export function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <View style={styles.centerBox}>
      <Text style={styles.stateText}>랭킹을 불러오지 못했어요 😢</Text>
      <TouchableOpacity style={styles.retryBtn} onPress={onRetry} activeOpacity={0.8}>
        <Text style={styles.retryBtnText}>다시 시도</Text>
      </TouchableOpacity>
    </View>
  );
}

export function EmptyState() {
  return (
    <View style={styles.centerBox}>
      <Text style={styles.stateText}>표시할 랭킹이 없어요 🐿️</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  centerBox: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    gap: 16,
  },
  stateText: { color: "#aaa", fontSize: 15 },
  retryBtn: {
    backgroundColor: "#FFC800",
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 10,
  },
  retryBtnText: { color: "#191A1C", fontWeight: "700", fontSize: 14 },
});
