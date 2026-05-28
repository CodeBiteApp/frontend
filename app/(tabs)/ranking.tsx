import { getFollowingRanking, getGlobalRanking } from "@/api/ranking";
import DobiCommon from "@/components/charactor/dobi-common";
import RankingList from "@/components/ranking/RankingList";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/components/ranking/RankingStates";
import FriendSearchModal from "@/components/social/FriendSearchModal";
import { useUserStore } from "@/store/useUserStore";
import type { RankingResponse } from "@/types/ranking";
import React, { useCallback, useEffect, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function RankingScreen({ isFocused }: { isFocused?: boolean }) {
  const insets = useSafeAreaInsets();
  const [showFriendSearch, setShowFriendSearch] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "friends">("all");
  const [data, setData] = useState<RankingResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const myUserId = useUserStore((s) => s.user?.id ?? null);

  const fetchRanking = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const res =
        activeTab === "all"
          ? await getGlobalRanking()
          : await getFollowingRanking();
      setData(res);
    } catch {
      setError(true);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  const handleTabPress = (tab: "all" | "friends") => {
    if (tab === activeTab) return;
    setData(null);
    setLoading(true);
    setActiveTab(tab);
  };

  useEffect(() => {
    if (isFocused || isFocused === undefined) {
      fetchRanking();
    }
  }, [isFocused, fetchRanking]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchRanking();
    setRefreshing(false);
  };

  const renderContent = () => {
    if (loading && !refreshing && !data) return <LoadingState />;
    if (error) return <ErrorState onRetry={fetchRanking} />;
    if (!data || data.rankings.length === 0) return <EmptyState />;
    return (
      <RankingList
        rankings={data.rankings}
        myUserId={myUserId}
        myRank={data.myRank}
      />
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 16 }]}>
      {/* 친구추가 버튼 */}
      <TouchableOpacity
        style={[styles.friendBtn, { top: insets.top + 16 }]}
        onPress={() => setShowFriendSearch(true)}
        accessibilityLabel="친구 찾기"
      >
        <Text style={styles.friendBtnText}>친구 추가</Text>
      </TouchableOpacity>

      <FriendSearchModal
        visible={showFriendSearch}
        onClose={() => setShowFriendSearch(false)}
      />

      {/* 헤더: 쳇바퀴 + 도비 */}
      <View style={styles.wheelSection}>
        <View style={styles.wheelWrapper}>{/* <Wheel size={110} /> */}</View>
        <DobiCommon size={90} />
        <View style={styles.wheelTextBox}>
          <Text style={styles.wheelTitle}>이번 주 랭킹</Text>
          <Text style={styles.wheelSub}>열심히 달리는 중</Text>
        </View>
      </View>

      {/* 탭 스위처 */}
      <View style={styles.tabBar}>
        <Pressable
          style={[styles.tabBtn, activeTab === "all" && styles.tabBtnActive]}
          onPress={() => handleTabPress("all")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "all" && styles.tabTextActive,
            ]}
          >
            전체 랭킹
          </Text>
        </Pressable>
        <Pressable
          style={[
            styles.tabBtn,
            activeTab === "friends" && styles.tabBtnActive,
          ]}
          onPress={() => handleTabPress("friends")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "friends" && styles.tabTextActive,
            ]}
          >
            친구 랭킹
          </Text>
        </Pressable>
      </View>

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#FFC800"
          />
        }
      >
        {renderContent()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#191A1C", paddingTop: 56 },
  scrollArea: { flex: 1 },
  content: { paddingBottom: 40 },

  wheelSection: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    marginBottom: 24,
    gap: 16,
  },
  wheelWrapper: { padding: 6 },
  wheelTextBox: { flex: 1 },
  wheelTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 4,
  },
  wheelSub: { color: "#aaa", fontSize: 13 },

  tabBar: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginBottom: 24,
    backgroundColor: "#242628",
    borderRadius: 12,
    padding: 4,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 9,
    alignItems: "center",
  },
  tabBtnActive: { backgroundColor: "#FFC800" },
  tabText: { color: "#888", fontSize: 14, fontWeight: "700" },
  tabTextActive: { color: "#191A1C" },

  friendBtn: {
    position: "absolute",
    top: 56,
    right: 20,
    backgroundColor: "#FFC800",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
    zIndex: 10,
  },
  friendBtnText: { color: "#191A1C", fontSize: 13, fontWeight: "800" },
});
