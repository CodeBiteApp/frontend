import Acorn from "@/components/charactor/Acorn";
import DobiShop from "@/components/charactor/dobi-shop";
import { Button } from "@/components/common/Button";
import React, { useEffect, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type Category = "전체" | "풀이보조" | "경험치" | "보호";

type ShopItem = {
  id: string;
  emoji: string;
  title: string;
  description: string;
  price: number;
  category: "풀이보조" | "경험치" | "보호";
};

const CATEGORIES: Category[] = ["전체", "풀이보조", "경험치", "보호"];

const SHOP_ITEMS: ShopItem[] = [
  {
    id: "1",
    emoji: "💡",
    title: "힌트 사용권",
    description: "퀴즈 풀이 중 힌트를 1회 사용할 수 있어요.",
    price: 50,
    category: "풀이보조",
  },
  {
    id: "2",
    emoji: "🔍",
    title: "정답 보기권",
    description: "틀린 문제의 정답을 바로 확인할 수 있어요.",
    price: 80,
    category: "풀이보조",
  },
  {
    id: "3",
    emoji: "⏭️",
    title: "스테이지 건너뛰기",
    description: "원하는 스테이지 1개를 건너뛸 수 있어요.",
    price: 150,
    category: "풀이보조",
  },
  {
    id: "4",
    emoji: "⚡",
    title: "경험치 2배 (1시간)",
    description: "1시간 동안 획득 경험치가 2배가 돼요.",
    price: 200,
    category: "경험치",
  },
  {
    id: "5",
    emoji: "🛡️",
    title: "오답 보호권",
    description: "틀려도 하트가 차감되지 않아요. (1회)",
    price: 120,
    category: "보호",
  },
  {
    id: "6",
    emoji: "🎯",
    title: "연습 모드 해금",
    description: "제한 없이 스테이지를 반복 연습할 수 있어요.",
    price: 300,
    category: "풀이보조",
  },
];

const BUBBLE_MESSAGES = [
  "어서와!\n뭐 살거야? 🛒",
  "도토리가 많을수록\n득템 확률 UP! ✨",
  "이번엔 어떤\n아이템 쓸거야? 🌟",
];

export default function RewardScreen() {
  const [dotori] = useState(300);
  const [selected, setSelected] = useState<ShopItem | null>(null);
  const [purchased, setPurchased] = useState<string[]>([]);
  const [category, setCategory] = useState<Category>("전체");
  const [bubbleIdx, setBubbleIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setBubbleIdx((i) => (i + 1) % BUBBLE_MESSAGES.length);
    }, 4000);
    return () => clearInterval(t);
  }, []);

  const handleBuy = () => {
    if (!selected) return;
    setPurchased((prev) => [...prev, selected.id]);
    setSelected(null);
  };

  const canAfford = selected ? dotori >= selected.price : false;

  const filteredItems =
    category === "전체"
      ? SHOP_ITEMS
      : SHOP_ITEMS.filter((i) => i.category === category);

  return (
    <View style={styles.container}>
      {/* 헤더 - 제목 + 도토리 잔액 */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>도비의 상점</Text>
        <View style={styles.balanceChip}>
          <Acorn width={18} height={18} />
          <Text style={styles.balanceChipText}>{dotori.toLocaleString()}</Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* 캐릭터 + 말풍선 */}
        <View style={styles.characterSection}>
          <View style={styles.characterWrap}>
            <DobiShop width={210} height={210} />
          </View>
          <View style={styles.bubbleWrap}>
            {/* 말풍선 꼬리 (왼쪽 방향) */}
            <View style={styles.bubbleTail} />
            <View style={styles.bubble}>
              <Text style={styles.bubbleText}>
                {BUBBLE_MESSAGES[bubbleIdx]}
              </Text>
            </View>
          </View>
        </View>

        {/* 카테고리 가로스크롤 */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.catScroll}
          contentContainerStyle={styles.catContent}
        >
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.catTab, category === cat && styles.catTabActive]}
              onPress={() => setCategory(cat)}
              activeOpacity={0.75}
            >
              <Text
                style={[
                  styles.catText,
                  category === cat && styles.catTextActive,
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* 아이템 그리드 */}
        <Text style={styles.sectionTitle}>아이템</Text>
        <View style={styles.grid}>
          {filteredItems.map((item) => {
            const isBought = purchased.includes(item.id);
            const affordable = dotori >= item.price;
            return (
              <TouchableOpacity
                key={item.id}
                style={[styles.card, isBought && styles.cardBought]}
                activeOpacity={0.75}
                onPress={() => !isBought && setSelected(item)}
                disabled={isBought}
              >
                <Text style={styles.cardEmoji}>{item.emoji}</Text>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <View style={styles.priceRow}>
                  <Acorn width={14} height={14} />
                  <Text
                    style={[
                      styles.priceText,
                      !affordable && !isBought && styles.priceInsufficient,
                    ]}
                  >
                    {isBought ? "구매완료" : item.price.toLocaleString()}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* 구매 확인 모달 */}
      <Modal
        visible={!!selected}
        transparent
        animationType="slide"
        onRequestClose={() => setSelected(null)}
      >
        <Pressable style={styles.backdrop} onPress={() => setSelected(null)} />
        {selected && (
          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetEmoji}>{selected.emoji}</Text>
            <Text style={styles.sheetTitle}>{selected.title}</Text>
            <Text style={styles.sheetDesc}>{selected.description}</Text>
            <View style={styles.sheetPriceRow}>
              <Acorn width={24} height={24} />
              <Text style={styles.sheetPrice}>
                {selected.price.toLocaleString()} 도토리
              </Text>
            </View>
            {!canAfford && (
              <Text style={styles.insufficientText}>도토리가 부족해요</Text>
            )}
            <Button
              label="구매하기"
              onPress={handleBuy}
              disabled={!canAfford}
              color={canAfford ? "#FFC800" : "#3a3a3a"}
              textColor="#191A1C"
              style={{ width: "100%", marginTop: 16, marginBottom: 10 }}
              textStyle={{ fontWeight: "800" }}
            />
            <Button
              label="취소"
              onPress={() => setSelected(null)}
              variant="ghost"
              style={{ paddingVertical: 8 }}
              textStyle={{ color: "#888", fontSize: 14 }}
            />
          </View>
        )}
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#191A1C" },

  // 헤더
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 56,
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  balanceChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#242628",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 7,
    gap: 6,
    borderWidth: 1.5,
    borderColor: "#C68B3A",
  },
  balanceChipText: {
    color: "#FFC800",
    fontSize: 15,
    fontWeight: "800",
  },

  // 스크롤
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },

  // 캐릭터 섹션
  characterSection: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: -12,
    marginBottom: 8,
    minHeight: 180,
  },
  characterWrap: {
    // DobiShop SVG 자체 여백 보정
  },
  bubbleWrap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginLeft: -4,
  },
  // 말풍선 꼬리 (왼쪽 방향 삼각형)
  bubbleTail: {
    width: 0,
    height: 0,
    borderTopWidth: 8,
    borderBottomWidth: 8,
    borderRightWidth: 10,
    borderTopColor: "transparent",
    borderBottomColor: "transparent",
    borderRightColor: "#2A2D31",
    marginRight: -1,
  },
  bubble: {
    flex: 1,
    backgroundColor: "#2A2D31",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderWidth: 1.5,
    borderColor: "#383B40",
  },
  bubbleText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 21,
  },

  // 카테고리 가로스크롤
  catScroll: {
    marginHorizontal: -20,
    marginBottom: 20,
  },
  catContent: {
    paddingHorizontal: 20,
    gap: 8,
    paddingVertical: 6,
  },
  catTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#242628",
    borderWidth: 1.5,
    borderColor: "#333537",
  },
  catTabActive: {
    backgroundColor: "#FFC800",
    borderColor: "#FFC800",
  },
  catText: {
    color: "#aaa",
    fontSize: 13,
    fontWeight: "600",
  },
  catTextActive: {
    color: "#191A1C",
    fontWeight: "700",
  },

  sectionTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 14,
    letterSpacing: 0.3,
  },

  // 아이템 그리드
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  card: {
    width: "47%",
    backgroundColor: "#242628",
    borderRadius: 16,
    padding: 16,
    alignItems: "flex-start",
    borderWidth: 1.5,
    borderColor: "#333537",
  },
  cardBought: {
    opacity: 0.45,
    borderColor: "#444",
  },
  cardEmoji: { fontSize: 26, marginBottom: 8 },
  cardTitle: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 12,
    lineHeight: 19,
  },
  priceRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  priceText: { color: "#FFC800", fontSize: 13, fontWeight: "700" },
  priceInsufficient: { color: "#ff4b4b" },

  // 구매 모달
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.55)" },
  sheet: {
    backgroundColor: "#242628",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 28,
    paddingTop: 16,
    paddingBottom: 40,
    alignItems: "center",
  },
  sheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: "#444",
    borderRadius: 2,
    marginBottom: 20,
  },
  sheetEmoji: { fontSize: 52, marginBottom: 12 },
  sheetTitle: { color: "#fff", fontSize: 20, fontWeight: "800", marginBottom: 8 },
  sheetDesc: {
    color: "#aaa",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 20,
  },
  sheetPriceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  sheetPrice: { color: "#FFC800", fontSize: 22, fontWeight: "800" },
  insufficientText: { color: "#ff4b4b", fontSize: 13, marginBottom: 4 },
});
