import {
  equipItem,
  getInventory,
  getShopItems,
  purchaseItem,
} from "@/api/items";
import type { ShopItemResponse, UserItem } from "@/api/items";
import { useUserStore } from "@/store/useUserStore";
import { create } from "zustand";

type ItemState = {
  shopItems: ShopItemResponse[];
  inventory: UserItem[];
  protectorCount: number;
  isLoading: boolean;
  error: string | null;

  fetchShopItems: () => Promise<void>;
  fetchInventory: () => Promise<void>;
  buyItem: (itemId: number) => Promise<boolean>;
  toggleEquip: (itemId: number, equip: boolean) => Promise<boolean>;
};

import { Alert } from "react-native";

export const useItemStore = create<ItemState>((set, get) => ({
  shopItems: [],
  inventory: [],
  protectorCount: 0,
  isLoading: false,
  error: null,

  fetchShopItems: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await getShopItems();
      set({ shopItems: data });
    } catch (e: any) {
      set({ error: e.message || "Failed to fetch shop items" });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchInventory: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await getInventory();
      set({ inventory: data.userItems, protectorCount: data.protector });
    } catch (e: any) {
      set({ error: e.message || "Failed to fetch inventory" });
    } finally {
      set({ isLoading: false });
    }
  },

  buyItem: async (itemId) => {
    set({ isLoading: true, error: null });
    try {
      await purchaseItem({ itemId });
      // Refresh shop items to update isPurchased
      await get().fetchShopItems();
      await get().fetchInventory();
      // Refresh user to get updated dotori balance
      await useUserStore.getState().refreshUser();
      return true;
    } catch (e: any) {
      set({ error: e.response?.data?.message || e.message || "Purchase failed" });
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  toggleEquip: async (itemId, equip) => {
    set({ isLoading: true, error: null });
    try {
      await equipItem({ itemId, equip });
      await get().fetchInventory();
      // Refresh user profile as well to keep equippedBannerId in sync!
      await useUserStore.getState().refreshUser();
      return true;
    } catch (e: any) {
      console.error("[toggleEquip] 실패:", e);
      Alert.alert("장착 실패", e.response?.data?.message || e.message || "장착 처리 중 오류가 발생했습니다.");
      set({ error: e.message || "Equip failed" });
      return false;
    } finally {
      set({ isLoading: false });
    }
  },
}));
