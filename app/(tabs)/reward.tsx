import Acorn from "@/components/charactor/Acorn";
import DobiShop from "@/components/charactor/dobi-shop";
import { Button } from "@/components/common/Button";
import { ConfirmModal } from "@/components/common/ConfirmModal";
import { useAppAlert } from "@/hooks/useAppAlert";
import React, { useEffect, useState, useCallback } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import { useItemStore } from "@/store/useItemStore";
import { useUserStore } from "@/store/useUserStore";
import { getAssetForItem } from "@/constants/itemAssets";
import type { ShopItemResponse } from "@/api/items";
import { useFocusEffect } from "expo-router";

type Category = "전체" | "풀이보조" | "경험치" | "보호" | "배너" | "기타";
const CATEGORIES: Category[] = ["전체", "보호", "배너", "기타"];

const BUBBLE_MESSAGES = [
  "어서와!\n뭐 살거야? 🛒",
  "도토리가 많을수록\n득템 확률 UP! ✨",
  "이번엔 어떤\n아이템 쓸거야? 🌟",
];

export default function RewardScreen({ isFocused }: { isFocused?: boolean }) {
  const insets = useSafeAreaInsets();
  const { user } = useUserStore();
  const { shopItems, inventory, protectorCount, isLoading, fetchShopItems, fetchInventory, buyItem, toggleEquip } = useItemStore();

  const { show: showAlert, hide: hideAlert, config: alertConfig, isVisible: alertVisible } = useAppAlert();

  const [tabMode, setTabMode] = useState<"SHOP" | "INVENTORY">("SHOP");
  const [selected, setSelected] = useState<ShopItemResponse | null>(null);
  const [category, setCategory] = useState<Category>("전체");
  const [bubbleIdx, setBubbleIdx] = useState(0);

  const dotori = user?.dotori || 0;

  const handleFocus = useCallback(() => {
    fetchShopItems();
    fetchInventory();
  }, [fetchShopItems, fetchInventory]);

  useFocusEffect(
    useCallback(() => {
      handleFocus();
    }, [handleFocus])
  );

  useEffect(() => {
    if (isFocused) {
      handleFocus();
    }
  }, [isFocused, handleFocus]);

  useEffect(() => {
    const t = setInterval(() => {
      setBubbleIdx((i) => (i + 1) % BUBBLE_MESSAGES.length);
    }, 4000);
    return () => clearInterval(t);
  }, []);

  const handleBuy = async () => {
    if (!selected) return;
    const success = await buyItem(selected.id);
    if (success) {
      setSelected(null);
      showAlert("구매 성공", "구매완료 되었습니다.");
    }
  };

  const canAfford = selected ? dotori >= selected.price : false;

  const filteredItems = category === "전체"
    ? shopItems
    : shopItems.filter((i) => {
      const asset = getAssetForItem(i.itemType, i.id);
      return asset.category === category;
    });

  return (
    <View style={styles.container}>
      {/* 헤더 - 제목 + 도토리 잔액 */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Text style={styles.headerTitle}>도비의 상점</Text>
        <View style={styles.balanceChip}>
          <Acorn width={18} height={18} />
          <Text style={styles.balanceChipText}>{dotori.toLocaleString()}</Text>
        </View>
      </View>

      <View style={styles.tabToggleContainer}>
        <TouchableOpacity
          style={[styles.tabToggleButton, tabMode === "SHOP" && styles.tabToggleButtonActive]}
          onPress={() => setTabMode("SHOP")}
          activeOpacity={0.75}
        >
          <Text style={[styles.tabToggleText, tabMode === "SHOP" && styles.tabToggleTextActive]}>상점</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabToggleButton, tabMode === "INVENTORY" && styles.tabToggleButtonActive]}
          onPress={() => setTabMode("INVENTORY")}
          activeOpacity={0.75}
        >
          <Text style={[styles.tabToggleText, tabMode === "INVENTORY" && styles.tabToggleTextActive]}>내 보관함</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {tabMode === "SHOP" ? (
          <>
            {/* 캐릭터 + 말풍선 */}
            <View style={styles.characterSection}>
              <View style={styles.characterWrap}>
                <DobiShop width={210} height={210} />
              </View>
              <View style={styles.bubbleWrap}>
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
            {isLoading ? (
              <ActivityIndicator size="large" color="#FFC800" style={{ marginTop: 40 }} />
            ) : (
              <View style={styles.grid}>
                {filteredItems.map((item) => {
                  const asset = getAssetForItem(item.itemType, item.id);
                  const affordable = dotori >= item.price;
                  const isBought = item.isPurchased;

                  return (
                    <TouchableOpacity
                      key={item.id}
                      style={[styles.card, isBought && styles.cardBought]}
                      activeOpacity={0.75}
                      onPress={() => !isBought && setSelected(item)}
                      disabled={isBought}
                    >
                      <Text style={styles.cardEmoji}>{asset.emoji}</Text>
                      <Text style={styles.cardTitle}>{asset.title}</Text>
                      <View style={styles.priceRow}>
                        <Acorn width={14} height={14} />
                        <Text
                          style={[
                            styles.priceText,
                            !affordable && !isBought && styles.priceInsufficient,
                          ]}
                        >
                          {isBought ? "보유중" : item.price.toLocaleString()}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </>
        ) : (
          <>
            {/* 내 보관함 뷰 */}
            <Text style={styles.sectionTitle}>보유한 소모품</Text>
            <View style={styles.grid}>
              <View style={styles.card}>
                <Text style={styles.cardEmoji}>🛡️</Text>
                <Text style={styles.cardTitle}>스트릭 보호권</Text>
                <View style={styles.inventoryCountRow}>
                  <Text style={styles.inventoryCountText}>보유: {protectorCount}개</Text>
                </View>
              </View>
            </View>

            <Text style={[styles.sectionTitle, { marginTop: 32 }]}>보유한 꾸미기 아이템</Text>
            {isLoading ? (
              <ActivityIndicator size="large" color="#FFC800" style={{ marginTop: 40 }} />
            ) : inventory.length === 0 ? (
              <Text style={styles.emptyText}>아직 보유한 꾸미기 아이템이 없습니다.</Text>
            ) : (
              <View style={styles.grid}>
                {inventory.map((item) => {
                  const asset = getAssetForItem(item.itemType, item.itemId);
                  return (
                    <View key={item.itemId} style={[styles.card, item.isEquipped && styles.cardEquipped]}>
                      <Text style={styles.cardEmoji}>{asset.emoji}</Text>
                      <Text style={styles.cardTitle}>{asset.title}</Text>
                      <Button
                        label={item.isEquipped ? "해제하기" : "장착하기"}
                        onPress={() => toggleEquip(item.itemId, !item.isEquipped)}
                        style={styles.equipBtn}
                        textStyle={styles.equipBtnText}
                        color={item.isEquipped ? "#333537" : "#FFC800"}
                        textColor={item.isEquipped ? "#aaa" : "#191A1C"}
                      />
                    </View>
                  );
                })}
              </View>
            )}
          </>
        )}
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
            <Text style={styles.sheetEmoji}>{getAssetForItem(selected.itemType, selected.id).emoji}</Text>
            <Text style={styles.sheetTitle}>{getAssetForItem(selected.itemType, selected.id).title}</Text>
            <Text style={styles.sheetDesc}>{getAssetForItem(selected.itemType, selected.id).description}</Text>
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
              label={isLoading ? "구매 중..." : "구매하기"}
              onPress={handleBuy}
              disabled={!canAfford || isLoading}
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
              disabled={isLoading}
            />
          </View>
        )}
      </Modal>
      <ConfirmModal
        visible={alertVisible}
        title={alertConfig?.title ?? ""}
        message={alertConfig?.message}
        buttons={alertConfig?.buttons}
        onDismiss={hideAlert}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#191A1C" },

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

  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },

  characterSection: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: -12,
    marginBottom: 8,
    minHeight: 180,
  },
  characterWrap: {
  },
  bubbleWrap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginLeft: -4,
  },
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

  tabToggleContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 12,
  },
  tabToggleButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: "#242628",
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#333537",
  },
  tabToggleButtonActive: {
    backgroundColor: "#FFC800",
    borderColor: "#FFC800",
  },
  tabToggleText: {
    color: "#aaa",
    fontSize: 15,
    fontWeight: "600",
  },
  tabToggleTextActive: {
    color: "#191A1C",
    fontWeight: "800",
  },

  inventoryCountRow: {
    backgroundColor: "#333537",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 4,
  },
  inventoryCountText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  emptyText: {
    color: "#aaa",
    fontSize: 14,
    textAlign: "center",
    marginTop: 32,
  },
  equipBtn: {
    width: "100%",
    paddingVertical: 8,
    marginTop: 8,
    borderRadius: 8,
  },
  equipBtnText: {
    fontSize: 13,
    fontWeight: "700",
  },
  cardEquipped: {
    borderColor: "#FFC800",
    borderWidth: 2,
  },

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
