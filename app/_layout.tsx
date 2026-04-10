import { setUnauthorizedHandler } from "@/api/axios";
import { useUserStore } from "@/store/useUserStore";
import { router, Stack } from "expo-router";
import React, { useEffect, useRef } from "react";
import { AppState, AppStateStatus } from "react-native";

export default function RootLayout() {
  const restoreSession = useUserStore((s) => s.restoreSession);
  const setUnauthorized = useUserStore((s) => s.setUnauthorized);
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    // 401 발생 시 로그인 화면으로 이동
    setUnauthorizedHandler(() => {
      setUnauthorized();
      router.replace("/(auth)/login");
    });

    // 앱 시작 시 세션 복원 - 성공하면 탭으로, 실패하면 로그인 유지
    restoreSession()
      .then((restored) => {
        if (restored) {
          router.replace("/(tabs)");
        }
      })
      .catch(() => {});

    // 백그라운드 → 포그라운드 전환 시 자동 로그인 시도
    const subscription = AppState.addEventListener(
      "change",
      (nextState: AppStateStatus) => {
        if (
          appState.current.match(/inactive|background/) &&
          nextState === "active"
        ) {
          const { isLoggedIn } = useUserStore.getState();
          if (!isLoggedIn) {
            useUserStore
              .getState()
              .restoreSession()
              .then((restored) => {
                if (restored) router.replace("/(tabs)");
              })
              .catch(() => {});
          }
        }
        appState.current = nextState;
      },
    );

    return () => subscription.remove();
  }, []);

  return (
    <Stack screenOptions={{ headerShown: false }} initialRouteName="(auth)">
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(onboarding)" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}
