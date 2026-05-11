import Acorn from "@/components/charactor/Acorn";
import { Button } from "@/components/common/Button";
import React, { useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type ShopItem = {
  id: string;
  emoji: string;
  title: string;
  description: string;
  price: number;
};

const SHOP_ITEMS: ShopItem[] = [
  { id: "1", emoji: "💡", title: "힌트 사용권", description: "퀴즈 풀이 중 힌트를 1회 사용할 수 있어요.", price: 50 },
  { id: "2", emoji: "🔍", title: "정답 보기권", description: "틀린 문제의 정답을 바로 확인할 수 있어요.", price: 80 },
  { id: "3", emoji: "⏭️", title: "스테이지 건너뛰기", description: "원하는 스테이지 1개를 건너뛸 수 있어요.", price: 150 },
  { id: "4", emoji: "⚡", title: "경험치 2배 (1시간)", description: "1시간 동안 획득 경험치가 2배가 돼요.", price: 200 },
  { id: "5", emoji: "🛡️", title: "오답 보호권", description: "틀려도 하트가 차감되지 않아요. (1회)", price: 120 },
  { id: "6", emoji: "🎯", title: "연습 모드 해금", description: "제한 없이 스테이지를 반복 연습할 수 있어요.", price: 300 },
];

export default function RewardScreen() {
  const [dotori] = useState(300);
  const [selected, setSelected] = useState<ShopItem | null>(null);
  const [purchased, setPurchased] = useState<string[]>([]);

  const handleBuy = () => {
    if (!selected) return;
    setPurchased((prev) => [...prev, selected.id]);
    setSelected(null);
  };

  const canAfford = selected ? dotori >= selected.price : false;

  return (
    <>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* 헤더 */}
        <Text style={styles.header}>상점</Text>

        {/* 도토리 잔액 */}
        <View style={styles.balanceCard}>
          <Acorn width={52} height={52} />
          <View>
            <Text style={styles.balanceLabel}>보유 도토리</Text>
            <Text style={styles.balanceValue}>{dotori.toLocaleString()}</Text>
          </View>
        </View>

        {/* 아이템 목록 */}
        <Text style={styles.sectionTitle}>아이템</Text>
        <View style={styles.grid}>
          {SHOP_ITEMS.map((item) => {
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
                  <Acorn width={16} height={16} />
                  <Text style={[styles.priceText, !affordable && !isBought && styles.priceInsufficient]}>
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
              <Text style={styles.sheetPrice}>{selected.price.toLocaleString()} 도토리</Text>
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
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#191A1C" },
  content: { paddingTop: 56, paddingHorizontal: 20, paddingBottom: 40 },

  header: {
    fontSize: 26,
    fontWeight: "800",
    color: "#ffffff",
    textAlign: "center",
    marginBottom: 24,
    letterSpacing: 1,
  },

  // 잔액 카드
  balanceCard: {
    backgroundColor: "#242628",
    borderRadius: 16,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 28,
    borderWidth: 1.5,
    borderColor: "#C68B3A",
  },
  dotoriImg: { width: 52, height: 52 },
  balanceLabel: { color: "#aaa", fontSize: 13, marginBottom: 2 },
  balanceValue: { color: "#FFC800", fontSize: 30, fontWeight: "800" },

  sectionTitle: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 14,
    letterSpacing: 0.4,
  },

  // 그리드
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
  cardEmoji: { fontSize: 28, marginBottom: 8 },
  cardTitle: { color: "#ffffff", fontSize: 14, fontWeight: "700", marginBottom: 12, lineHeight: 20 },
  priceRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  dotoriSmall: { width: 16, height: 16 },
  priceText: { color: "#FFC800", fontSize: 14, fontWeight: "700" },
  priceInsufficient: { color: "#ff4b4b" },

  // 모달
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
  sheetDesc: { color: "#aaa", fontSize: 14, textAlign: "center", lineHeight: 22, marginBottom: 20 },
  sheetPriceRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 6 },
  dotoriMedium: { width: 24, height: 24 },
  sheetPrice: { color: "#FFC800", fontSize: 22, fontWeight: "800" },
  insufficientText: { color: "#ff4b4b", fontSize: 13, marginBottom: 4 },
});
