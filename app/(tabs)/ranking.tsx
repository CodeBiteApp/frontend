import DobiCommon from "@/components/charactor/dobi-common";
<<<<<<< HEAD
import RankingList from "@/components/ranking/RankingList";
import Wheel from "@/components/ranking/Wheel";
import { MOCK_FRIENDS, MOCK_RANKING } from "@/constants/ranking";
import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

=======
import { getFollowingRanking, getGlobalRanking } from "@/api/ranking";
import type { RankingEntry, RankingResponse } from "@/types/ranking";
import { useUserStore } from "@/store/useUserStore";
import React, { useRef, useEffect, useState, useCallback } from "react";
import {
  ActivityIndicator,
  Animated,
  Easing,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const TOP3_COLORS = ["#FFC800", "#C0C0C0", "#CD7F32"] as const;
const TOP3_LABELS = ["1st", "2nd", "3rd"] as const;
const TOP3_HEIGHTS = [110, 80, 60] as const;
const SPOKE_COUNT = 8;

// ────────────────────────────────────────────────────────────
// 쳇바퀴 컴포넌트
// ────────────────────────────────────────────────────────────
function Wheel({ size = 120 }: { size?: number }) {
  const rot = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(rot, {
        toValue: 1,
        duration: 1800,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, [rot]);

  const rotate = rot.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] });

  return (
    <Animated.View style={[{ width: size, height: size }, { transform: [{ rotate }] }]}>
      <View
        style={{
          position: "absolute",
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: 5,
          borderColor: "#C68B3A",
        }}
      />
      <View
        style={{
          position: "absolute",
          width: size * 0.2,
          height: size * 0.2,
          borderRadius: (size * 0.2) / 2,
          backgroundColor: "#C68B3A",
          top: size * 0.4,
          left: size * 0.4,
        }}
      />
      {Array.from({ length: SPOKE_COUNT }).map((_, i) => (
        <View
          key={i}
          style={{
            position: "absolute",
            width: size - 10,
            height: 3,
            backgroundColor: "#C68B3A",
            borderRadius: 2,
            top: (size - 3) / 2,
            left: 5,
            opacity: 0.7,
            transform: [{ rotate: `${(180 / SPOKE_COUNT) * i}deg` }],
            transformOrigin: "center",
          }}
        />
      ))}
    </Animated.View>
  );
}

// ────────────────────────────────────────────────────────────
// 로딩 / 에러 / 빈 상태 컴포넌트
// ────────────────────────────────────────────────────────────
function LoadingState() {
  return (
    <View style={styles.centerBox}>
      <ActivityIndicator size="large" color="#FFC800" />
      <Text style={styles.stateText}>랭킹을 불러오는 중...</Text>
    </View>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <View style={styles.centerBox}>
      <Text style={styles.stateText}>랭킹을 불러오지 못했어요 😢</Text>
      <TouchableOpacity style={styles.retryBtn} onPress={onRetry} activeOpacity={0.8}>
        <Text style={styles.retryBtnText}>다시 시도</Text>
      </TouchableOpacity>
    </View>
  );
}

function EmptyState() {
  return (
    <View style={styles.centerBox}>
      <Text style={styles.stateText}>표시할 랭킹이 없어요 🐿️</Text>
    </View>
  );
}

// ────────────────────────────────────────────────────────────
// 랭킹 목록 (시상대 + 리스트 + 내 순위)
// ────────────────────────────────────────────────────────────
function RankingList({
  rankings,
  myUserId,
  myRank,
}: {
  rankings: RankingEntry[];
  myUserId: number | null;
  myRank: number | null;
}) {
  const top3 = rankings.slice(0, 3);
  const rest = rankings.slice(3).filter((u) => u.userId !== myUserId);
  const meEntry = rankings.find((u) => u.userId === myUserId) ?? null;

  return (
    <>
      {/* ── 시상대 TOP 3 ── */}
      <View style={styles.podiumRow}>
        {[1, 0, 2].map((idx) => {
          if (!top3[idx]) return null;
          const user = top3[idx];
          const color = TOP3_COLORS[idx];
          const label = TOP3_LABELS[idx];
          const barH = TOP3_HEIGHTS[idx];
          const isMe = user.userId === myUserId;
          return (
            <View key={user.userId} style={styles.podiumItem}>
              <Text style={[styles.podiumName, isMe && styles.meHighlight]}>
                {isMe ? "나" : user.nickname}
              </Text>
              <View style={styles.podiumDotoriRow}>
                <Text style={styles.podiumStreakLabel}>🔥</Text>
                <Text style={styles.podiumDotori}>{user.currentStreak}</Text>
              </View>
              <View style={[styles.podiumBar, { height: barH, backgroundColor: color }]}>
                <Text style={styles.podiumLabel}>{label}</Text>
              </View>
            </View>
          );
        })}
      </View>

      {/* ── 4위~ 리스트 ── */}
      <View style={styles.listBox}>
        {rest.map((user) => {
          const isMe = user.userId === myUserId;
          return (
            <View key={user.userId} style={[styles.row, isMe && styles.rowMe]}>
              <Text style={[styles.rowRank, isMe && styles.meHighlight]}>{user.rank}</Text>
              <Text style={[styles.rowName, isMe && styles.meHighlight]}>
                {isMe ? `나 (${user.nickname})` : user.nickname}
              </Text>
              <View style={styles.rowRight}>
                <Text style={styles.streakIcon}>🔥</Text>
                <Text style={styles.rowDotori}>{user.currentStreak}</Text>
                <Text style={styles.rowScore}>{user.longestStreak}최장</Text>
              </View>
            </View>
          );
        })}
      </View>

      {/* ── 내 순위 고정 카드 (top3·rest에 없는 경우) ── */}
      {meEntry && !top3.some((u) => u.userId === myUserId) && !rest.some((u) => u.userId === myUserId) && (
        <View style={styles.meCard}>
          <View style={styles.meLeft}>
            <Text style={styles.meRank}>{myRank ?? meEntry.rank}위</Text>
            <Text style={styles.meName}>나 ({meEntry.nickname})</Text>
          </View>
          <View style={styles.rowRight}>
            <Text style={styles.streakIcon}>🔥</Text>
            <Text style={styles.rowDotori}>{meEntry.currentStreak}</Text>
            <Text style={styles.rowScore}>{meEntry.longestStreak}최장</Text>
          </View>
        </View>
      )}

      {/* ── 내 순위 카드 (항상 하단 고정 — top3이나 rest에 있어도 표시) ── */}
      {meEntry && (top3.some((u) => u.userId === myUserId) || rest.some((u) => u.userId === myUserId)) && (
        <View style={styles.meCard}>
          <View style={styles.meLeft}>
            <Text style={styles.meRank}>{myRank ?? meEntry.rank}위</Text>
            <Text style={styles.meName}>나 ({meEntry.nickname})</Text>
          </View>
          <View style={styles.rowRight}>
            <Text style={styles.streakIcon}>🔥</Text>
            <Text style={styles.rowDotori}>{meEntry.currentStreak}</Text>
            <Text style={styles.rowScore}>{meEntry.longestStreak}최장</Text>
          </View>
        </View>
      )}
    </>
  );
}

// ────────────────────────────────────────────────────────────
// 메인 스크린
// ────────────────────────────────────────────────────────────
>>>>>>> feature/shin-social
export default function RankingScreen() {
  const [activeTab, setActiveTab] = useState<"all" | "friends">("all");
  const [data, setData] = useState<RankingResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Zustand에서 현재 로그인 유저의 userId 조회
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
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  // 탭 전환 또는 마운트 시 fetch
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
    <ScrollView
      style={styles.container}
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

<<<<<<< HEAD
      {/* 탭 콘텐츠 */}
      {activeTab === "all" ? (
        <RankingList data={MOCK_RANKING} />
      ) : (
        <RankingList data={MOCK_FRIENDS} />
      )}
=======
      {/* ── 탭 콘텐츠 ── */}
      {renderContent()}
>>>>>>> feature/shin-social
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#191A1C" },
  content: { paddingTop: 56, paddingBottom: 40 },

  wheelSection: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    marginBottom: 24,
    gap: 16,
  },
  wheelWrapper: { padding: 6 },
  wheelTextBox: { flex: 1 },
<<<<<<< HEAD
  wheelTitle:   { color: "#fff", fontSize: 20, fontWeight: "800", marginBottom: 4 },
  wheelSub:     { color: "#aaa", fontSize: 13 },
=======
  wheelTitle: { color: "#fff", fontSize: 20, fontWeight: "800", marginBottom: 4 },
  wheelSub: { color: "#aaa", fontSize: 13 },
>>>>>>> feature/shin-social

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
<<<<<<< HEAD
=======

  // 로딩/에러/빈 상태
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

  // 시상대
  podiumRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "center",
    marginHorizontal: 20,
    marginBottom: 24,
    gap: 8,
  },
  podiumItem: { flex: 1, alignItems: "center" },
  podiumName: { color: "#fff", fontSize: 13, fontWeight: "700", marginBottom: 2, textAlign: "center" },
  podiumDotoriRow: { flexDirection: "row", alignItems: "center", gap: 3, marginBottom: 6 },
  podiumStreakLabel: { fontSize: 14 },
  podiumDotori: { color: "#FFC800", fontSize: 12, fontWeight: "700" },
  podiumBar: {
    width: "100%",
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  podiumLabel: { color: "#191A1C", fontSize: 14, fontWeight: "800", paddingVertical: 8 },

  // 리스트
  listBox: {
    marginHorizontal: 20,
    backgroundColor: "#242628",
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 16,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#2e3032",
  },
  rowMe: { backgroundColor: "#2C2A1E" },
  rowRank: { color: "#888", fontSize: 14, fontWeight: "700", width: 28 },
  rowName: { flex: 1, color: "#fff", fontSize: 15, fontWeight: "600" },
  rowRight: { flexDirection: "row", alignItems: "center", gap: 4 },
  streakIcon: { fontSize: 14 },
  rowDotori: { color: "#FFC800", fontSize: 13, fontWeight: "700", marginRight: 8 },
  rowScore: { color: "#aaa", fontSize: 13 },

  // 내 순위 강조
  meHighlight: { color: "#FFC800" },

  // 내 순위 카드
  meCard: {
    marginHorizontal: 20,
    backgroundColor: "#2C2A1E",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#FFC800",
  },
  meLeft: { flex: 1, flexDirection: "row", alignItems: "center", gap: 10 },
  meRank: { color: "#FFC800", fontSize: 16, fontWeight: "800" },
  meName: { color: "#fff", fontSize: 15, fontWeight: "700" },
>>>>>>> feature/shin-social
});
