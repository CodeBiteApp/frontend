import React, { useRef, useEffect, useState } from "react";
import {
  Animated,
  Easing,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const MOCK_RANKING = [
  { rank: 1, name: "퀴즈왕",    score: 4280, dotori: 980 },
  { rank: 2, name: "지식인",    score: 3970, dotori: 870 },
  { rank: 3, name: "천재소년",  score: 3650, dotori: 760 },
  { rank: 4, name: "공부벌레",  score: 3100, dotori: 650 },
  { rank: 5, name: "알고왕",    score: 2880, dotori: 540 },
  { rank: 6, name: "코딩마스터",score: 2470, dotori: 490 },
  { rank: 7, name: "나",        score: 2200, dotori: 300, isMe: true },
  { rank: 8, name: "열공중",    score: 1950, dotori: 270 },
  { rank: 9, name: "뉴비",      score: 1340, dotori: 180 },
  { rank: 10, name: "도전자",   score:  890, dotori: 120 },
];

const MOCK_FRIENDS = [
  { rank: 1, name: "나",        score: 2200, dotori: 300, isMe: true },
  { rank: 2, name: "친구A",     score: 1980, dotori: 260 },
  { rank: 3, name: "친구B",     score: 1750, dotori: 210 },
  { rank: 4, name: "친구C",     score: 1400, dotori: 170 },
  { rank: 5, name: "친구D",     score:  980, dotori: 110 },
];

const TOP3_COLORS  = ["#FFC800", "#C0C0C0", "#CD7F32"] as const;
const TOP3_LABELS  = ["1st", "2nd", "3rd"] as const;
const TOP3_HEIGHTS = [110, 80, 60] as const;
const SPOKE_COUNT  = 8;

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
// 랭킹 목록 (시상대 + 리스트 + 내 순위)
// ────────────────────────────────────────────────────────────
function RankingList({ data }: { data: typeof MOCK_RANKING }) {
  const me   = data.find((u) => u.isMe);
  const top3 = data.slice(0, 3);
  const rest = data.slice(3).filter((u) => !u.isMe);

  return (
    <>
      {/* ── 시상대 TOP 3 ── */}
      <View style={styles.podiumRow}>
        {[1, 0, 2].map((idx) => {
          if (!top3[idx]) return null;
          const user  = top3[idx];
          const color = TOP3_COLORS[idx];
          const label = TOP3_LABELS[idx];
          const barH  = TOP3_HEIGHTS[idx];
          return (
            <View key={user.rank} style={styles.podiumItem}>
              <Text style={styles.podiumName}>{user.name}</Text>
              <View style={styles.podiumDotoriRow}>
                <Image
                  source={require("@/assets/images/dotori-1.png")}
                  style={styles.dotoriTiny}
                  resizeMode="contain"
                />
                <Text style={styles.podiumDotori}>{user.dotori}</Text>
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
        {rest.map((user) => (
          <View key={user.rank} style={styles.row}>
            <Text style={styles.rowRank}>{user.rank}</Text>
            <Text style={styles.rowName}>{user.name}</Text>
            <View style={styles.rowRight}>
              <Image
                source={require("@/assets/images/dotori-1.png")}
                style={styles.dotoriTiny}
                resizeMode="contain"
              />
              <Text style={styles.rowDotori}>{user.dotori}</Text>
              <Text style={styles.rowScore}>{user.score.toLocaleString()}점</Text>
            </View>
          </View>
        ))}
      </View>

      {/* ── 내 순위 고정 카드 ── */}
      {me && (
        <View style={styles.meCard}>
          <View style={styles.meLeft}>
            <Text style={styles.meRank}>{me.rank}위</Text>
            <Text style={styles.meName}>나  ({me.name})</Text>
          </View>
          <View style={styles.rowRight}>
            <Image
              source={require("@/assets/images/dotori-1.png")}
              style={styles.dotoriTiny}
              resizeMode="contain"
            />
            <Text style={styles.rowDotori}>{me.dotori}</Text>
            <Text style={styles.rowScore}>{me.score.toLocaleString()}점</Text>
          </View>
        </View>
      )}
    </>
  );
}

// ────────────────────────────────────────────────────────────
// 메인 스크린
// ────────────────────────────────────────────────────────────
export default function RankingScreen() {
  const [activeTab, setActiveTab] = useState<"all" | "friends">("all");

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* ── 헤더: 쳇바퀴 + 코비 ── */}
      <View style={styles.wheelSection}>
        <View style={styles.wheelWrapper}>
          <Wheel size={110} />
        </View>
        <Image
          source={require("@/assets/images/cobi-1.png")}
          style={styles.cobiImg}
          resizeMode="contain"
        />
        <View style={styles.wheelTextBox}>
          <Text style={styles.wheelTitle}>이번 주 랭킹</Text>
          <Text style={styles.wheelSub}>열심히 달리는 중 🐿️</Text>
        </View>
      </View>

      {/* ── 탭 스위처 ── */}
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

      {/* ── 탭 콘텐츠 ── */}
      {activeTab === "all" ? (
        <RankingList data={MOCK_RANKING} />
      ) : (
        <RankingList data={MOCK_FRIENDS} />
      )}
    </ScrollView>
  );
}

// ────────────────────────────────────────────────────────────
// 스타일
// ────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#191A1C" },
  content:   { paddingTop: 56, paddingBottom: 40 },

  // 헤더
  wheelSection: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    marginBottom: 24,
    gap: 16,
  },
  wheelWrapper: { padding: 6 },
  cobiImg: { width: 90, height: 90, marginLeft: -10 },
  wheelTextBox: { flex: 1 },
  wheelTitle: { color: "#fff", fontSize: 20, fontWeight: "800", marginBottom: 4 },
  wheelSub:   { color: "#aaa", fontSize: 13 },

  // 탭 바
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
  rowRank:   { color: "#888", fontSize: 14, fontWeight: "700", width: 28 },
  rowName:   { flex: 1, color: "#fff", fontSize: 15, fontWeight: "600" },
  rowRight:  { flexDirection: "row", alignItems: "center", gap: 4 },
  dotoriTiny: { width: 16, height: 16 },
  rowDotori: { color: "#FFC800", fontSize: 13, fontWeight: "700", marginRight: 8 },
  rowScore:  { color: "#aaa", fontSize: 13 },

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
  meLeft:  { flex: 1, flexDirection: "row", alignItems: "center", gap: 10 },
  meRank:  { color: "#FFC800", fontSize: 16, fontWeight: "800" },
  meName:  { color: "#fff", fontSize: 15, fontWeight: "700" },
});
