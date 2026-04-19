import { Tabs } from "expo-router";
import React from "react";
import { Image, StyleSheet, View } from "react-native";

const ICON_SIZE = 30;

function TabIconWrapper({
  children,
  focused,
}: {
  children: React.ReactNode;
  focused: boolean;
}) {
  return (
    <View style={[styles.iconWrapper, focused && styles.iconWrapperActive]}>
      {children}
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#080B0B",
          borderTopWidth: 0,
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "홈",
          tabBarIcon: ({ focused }) => (
            <TabIconWrapper focused={focused}>
              <Image source={require("@/assets/images/icon/home-icon.png")} style={{ width: ICON_SIZE, height: ICON_SIZE }} />
            </TabIconWrapper>
          ),
        }}
      />
      <Tabs.Screen
        name="ranking"
        options={{
          title: "랭킹",
          tabBarIcon: ({ focused }) => (
            <TabIconWrapper focused={focused}>
              <Image source={require("@/assets/images/icon/ranking-icon.png")} style={{ width: ICON_SIZE, height: ICON_SIZE }} />
            </TabIconWrapper>
          ),
        }}
      />
      <Tabs.Screen
        name="reward"
        options={{
          title: "퀴즈보상",
          tabBarIcon: ({ focused }) => (
            <TabIconWrapper focused={focused}>
              <Image source={require("@/assets/images/icon/reward-icon.png")} style={{ width: ICON_SIZE, height: ICON_SIZE }} />
            </TabIconWrapper>
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "설정",
          tabBarIcon: ({ focused }) => (
            <TabIconWrapper focused={focused}>
              <Image source={require("@/assets/images/icon/profile-icon.png")} style={{ width: ICON_SIZE, height: ICON_SIZE }} />
            </TabIconWrapper>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
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
