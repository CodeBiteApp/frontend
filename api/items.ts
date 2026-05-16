import axiosInstance from "./axios";

export type ShopItemResponse = {
  id: number;
  itemType: "PROTECTOR" | "BANNER" | "ICON" | string;
  price: number;
  isPurchased: boolean;
};

export type PurchaseRequest = {
  itemId: number;
};

export type PurchaseResponse = {
  itemId: number;
  itemType: string;
  remainingDotori: number;
};

export type UserItem = {
  itemId: number;
  itemType: string;
  isEquipped: boolean;
};

export type InventoryResponse = {
  protector: number;
  userItems: UserItem[];
};

export type EquipRequest = {
  itemId: number;
  equip: boolean;
};

export type EquipResponse = {
  itemId: number;
  isEquipped: boolean;
};

export const getShopItems = async (): Promise<ShopItemResponse[]> => {
  const { data } = await axiosInstance.get<ShopItemResponse[]>("/api/items/shop");
  return data;
};

export const purchaseItem = async (body: PurchaseRequest): Promise<PurchaseResponse> => {
  const { data } = await axiosInstance.post<PurchaseResponse>("/api/items/purchase", body);
  return data;
};

export const getInventory = async (): Promise<InventoryResponse> => {
  const { data } = await axiosInstance.get<InventoryResponse>("/api/items/inventory");
  return data;
};

export const equipItem = async (body: EquipRequest): Promise<EquipResponse> => {
  const { data } = await axiosInstance.put<EquipResponse>("/api/items/equip", body);
  return data;
};
