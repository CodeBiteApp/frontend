import DobiCommon from "@/components/charactor/dobi-common";
import RankingList from "@/components/ranking/RankingList";
import { EmptyState, ErrorState, LoadingState } from "@/components/ranking/RankingStates";
import Wheel from "@/components/ranking/Wheel";
import { getFollowingRanking, getGlobalRanking } from "@/api/ranking";
import type { RankingResponse } from "@/types/ranking";
import { useUserStore } from "@/store/useUserStore";
import React, { useCallback, useEffect, useState } from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function RankingScreen() {
  const [activeTab, setActiveTab] = useState<"all" | "friends">("all");
  const [data, setData]           = useState<RankingResponse | null>(null);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const myUserId = useUserStore((s) => s.user?.id ?? null);

  const fetchRanking = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const res = activeTab === "all"
        ? await getGlobalRanking()
        : await getFollowingRanking();
      setData(res);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchRanking();
  }, [fetchRanking]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchRanking();
    setRefreshing(false);
  };

  const renderContent = () => {
    if (loading && !refreshing) return <LoadingState />;
    if (error)                  return <ErrorState onRetry={fetchRanking} />;
    if (!data || data.rankings.length === 0) return <EmptyState />;
    return <RankingList rankings={data.rankings} myUserId={myUserId} myRank={data.myRank} />;
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FFC800" />
      }
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

      {renderContent()}
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
