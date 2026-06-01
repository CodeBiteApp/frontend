import React, { useRef, useState, useEffect, useCallback } from "react";
import { Dimensions, FlatList, Image, StyleSheet, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import HomeScreen from "./index";
import RankingScreen from "./ranking";
import RewardScreen from "./reward";
import SettingsScreen from "./settings";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const ICON_SIZE = 30;

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const [activeIndex, setActiveIndex] = useState(0);
  const [visited, setVisited] = useState<boolean[]>([true, false, false, false]);
  const flatListRef = useRef<FlatList>(null);
  const isClickingRef = useRef(false);

  // 햅틱 피드백 실행
  const triggerHaptic = useCallback(() => {
    try {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // 햅틱 미지원 기기 대응
    }
  }, []);

  // 활성화된 화면 방문 체크 (지연 로딩 용도)
  useEffect(() => {
    if (!visited[activeIndex]) {
      setVisited((prev) => {
        const next = [...prev];
        next[activeIndex] = true;
        return next;
      });
    }
  }, [activeIndex, visited]);

  const SCREENS = [
    { key: "home", component: HomeScreen },
    { key: "ranking", component: RankingScreen },
    { key: "reward", component: RewardScreen },
    { key: "settings", component: SettingsScreen },
  ];

  const handleTabPress = (index: number) => {
    if (index === activeIndex) return;
    triggerHaptic();
    isClickingRef.current = true;
    setActiveIndex(index);
    flatListRef.current?.scrollToIndex({ index, animated: true });
  };

  const onMomentumScrollEnd = (e: any) => {
    isClickingRef.current = false;
    const x = e.nativeEvent.contentOffset.x;
    const index = Math.round(x / SCREEN_WIDTH);
    if (index !== activeIndex && index >= 0 && index < SCREENS.length) {
      setActiveIndex(index);
      triggerHaptic();
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={SCREENS}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        keyExtractor={(item) => item.key}
        getItemLayout={(data, index) => ({
          length: SCREEN_WIDTH,
          offset: SCREEN_WIDTH * index,
          index,
        })}
        onMomentumScrollEnd={onMomentumScrollEnd}
        renderItem={({ item, index }) => {
          const Comp = item.component;
          const isVisited = visited[index];
          return (
            <View style={{ width: SCREEN_WIDTH, flex: 1 }}>
              {isVisited ? (
                <Comp isFocused={activeIndex === index} />
              ) : (
                <View style={{ flex: 1, backgroundColor: "#191A1C" }} />
              )}
            </View>
          );
        }}
        initialNumToRender={1}
        maxToRenderPerBatch={1}
        windowSize={2}
        removeClippedSubviews={false} // 상태 및 스크롤 유지를 위해 뷰 보존
      />

      {/* 커스텀 바텀 탭 바 */}
      <View
        style={[
          styles.tabBar,
          {
            height: 60 + Math.max(insets.bottom, 8),
            paddingBottom: Math.max(insets.bottom, 8),
          },
        ]}
      >
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => handleTabPress(0)}
          activeOpacity={0.7}
          accessibilityLabel="홈"
        >
          <View style={[styles.iconWrapper, activeIndex === 0 && styles.iconWrapperActive]}>
            <Image
              source={require("@/assets/images/icon/home-icon.png")}
              style={{ width: ICON_SIZE, height: ICON_SIZE }}
            />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => handleTabPress(1)}
          activeOpacity={0.7}
          accessibilityLabel="랭킹"
        >
          <View style={[styles.iconWrapper, activeIndex === 1 && styles.iconWrapperActive]}>
            <Image
              source={require("@/assets/images/icon/ranking-icon.png")}
              style={{ width: ICON_SIZE, height: ICON_SIZE }}
            />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => handleTabPress(2)}
          activeOpacity={0.7}
          accessibilityLabel="보상"
        >
          <View style={[styles.iconWrapper, activeIndex === 2 && styles.iconWrapperActive]}>
            <Image
              source={require("@/assets/images/icon/reward-icon.png")}
              style={{ width: ICON_SIZE, height: ICON_SIZE }}
            />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => handleTabPress(3)}
          activeOpacity={0.7}
          accessibilityLabel="설정"
        >
          <View style={[styles.iconWrapper, activeIndex === 3 && styles.iconWrapperActive]}>
            <Image
              source={require("@/assets/images/icon/profile-icon.png")}
              style={{ width: ICON_SIZE, height: ICON_SIZE }}
            />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#191A1C",
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#080B0B",
    borderTopWidth: 0,
    alignItems: "center",
    justifyContent: "space-around",
    paddingTop: 6,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
  },
  iconWrapper: {
    padding: 4,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
  },
  iconWrapperActive: {
    borderColor: "rgba(255, 255, 255, 0.35)",
  },
});
