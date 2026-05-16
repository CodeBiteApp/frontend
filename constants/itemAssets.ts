export type ItemAsset = {
  emoji: string;
  title: string;
  description: string;
  category: "풀이보조" | "경험치" | "보호" | "배너" | "기타";
};

// Map by Item Type or Item ID depending on backend implementation
export const ITEM_ASSETS: Record<string, ItemAsset> = {
  PROTECTOR: {
    emoji: "🛡️",
    title: "스트릭 보호권",
    description: "결석 시 스트릭이 초기화되는 것을 막아줘요.",
    category: "보호",
  },
  BANNER: {
    emoji: "🖼️",
    title: "기본 배너",
    description: "프로필을 장식할 수 있는 기본 배너입니다.",
    category: "배너",
  },
  ICON: {
    emoji: "✨",
    title: "스페셜 아이콘",
    description: "프로필 아이콘을 특별하게 꾸며보세요.",
    category: "배너", // Using 배너 category for decorations
  },
};

export const getAssetForItem = (itemType: string, itemId?: number): ItemAsset => {
  // If backend returns specific IDs for different banners, we can map by ID here
  // For now, mapping by type
  if (ITEM_ASSETS[itemType]) {
    return ITEM_ASSETS[itemType];
  }
  return {
    emoji: "🎁",
    title: `알 수 없는 아이템 (${itemType})`,
    description: "새로운 아이템입니다.",
    category: "기타",
  };
};
