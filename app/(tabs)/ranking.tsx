import DobiCommon from "@/components/charactor/dobi-common";
import RankingList from "@/components/ranking/RankingList";
import Wheel from "@/components/ranking/Wheel";
import { MOCK_FRIENDS, MOCK_RANKING } from "@/constants/ranking";
import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function RankingScreen() {
  const [activeTab, setActiveTab] = useState<"all" | "friends">("all");

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* 헤더: 쳇바퀴 + 도비 */}
      <View style={styles.wheelSection}>
        <View style={styles.wheelWrapper}>
          <Wheel size={110} />
        </View>
        <DobiCommon size={90} />
        <View style={styles.wheelTextBox}>
          <Text style={styles.wheelTitle}>이번 주 랭킹</Text>
          <Text style={styles.wheelSub}>열심히 달리는 중 🐿️</Text>
        </View>
      </View>

      {/* 탭 스위처 */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === "all" && styles.tabBtnActive]}
          onPress={() => setActiveTab("all")}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabText, activeTab === "all" && styles.tabTextActive]}>
            전체 랭킹
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === "friends" && styles.tabBtnActive]}
          onPress={() => setActiveTab("friends")}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabText, activeTab === "friends" && styles.tabTextActive]}>
            친구 랭킹
          </Text>
        </TouchableOpacity>
      </View>

      {/* 탭 콘텐츠 */}
      {activeTab === "all" ? (
        <RankingList data={MOCK_RANKING} />
      ) : (
        <RankingList data={MOCK_FRIENDS} />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#191A1C" },
  content:   { paddingTop: 56, paddingBottom: 40 },

  wheelSection: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    marginBottom: 24,
    gap: 16,
  },
  wheelWrapper: { padding: 6 },
  wheelTextBox: { flex: 1 },
  wheelTitle:   { color: "#fff", fontSize: 20, fontWeight: "800", marginBottom: 4 },
  wheelSub:     { color: "#aaa", fontSize: 13 },

  tabBar: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginBottom: 24,
    backgroundColor: "#242628",
    borderRadius: 12,
    padding: 4,
  },
  tabBtn:        { flex: 1, paddingVertical: 10, borderRadius: 9, alignItems: "center" },
  tabBtnActive:  { backgroundColor: "#FFC800" },
  tabText:       { color: "#888", fontSize: 14, fontWeight: "700" },
  tabTextActive: { color: "#191A1C" },
});
