import { setUnauthorizedHandler } from "@/api/axios";
import { recordVisit, registerPushToken } from "@/api/users";
import {
  getOrRefreshToken,
  setupAndroidChannel,
  setupNotificationHandlers,
} from "@/lib/notifications";
import { useUserStore } from "@/store/useUserStore";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { router, Stack } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import React, { useEffect, useRef } from "react";
import { AppState, AppStateStatus } from "react-native";

const queryClient = new QueryClient();

export default function RootLayout() {
  const restoreSession = useUserStore((s) => s.restoreSession);
  const setUnauthorized = useUserStore((s) => s.setUnauthorized);
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    WebBrowser.maybeCompleteAuthSession();
    // 401 발생 시 로그인 화면으로 이동
    setUnauthorizedHandler(() => {
      setUnauthorized();
      router.replace("/(auth)/login");
    });

    // 앱 시작 시 세션 복원 - index.tsx가 store 상태를 감지해 자동 분기
    restoreSession().catch(() => {});

    // 알림 초기화
    setupAndroidChannel();
    const removeNotificationHandlers = setupNotificationHandlers();
    getOrRefreshToken().then((token) => {
      if (token) registerPushToken(token).catch(() => {});
    });
    recordVisit().catch(() => {});

    // 백그라운드 → 포그라운드 전환 시 자동 로그인 시도 + 방문 기록
    const subscription = AppState.addEventListener(
      "change",
      (nextState: AppStateStatus) => {
        if (
          appState.current.match(/inactive|background/) &&
          nextState === "active"
        ) {
          recordVisit().catch(() => {});

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

    return () => {
      subscription.remove();
      removeNotificationHandlers();
    };
  }, [restoreSession, setUnauthorized]);

  return (
    <QueryClientProvider client={queryClient}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(onboarding)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="quiz-loading" />
        <Stack.Screen name="(social)" options={{ presentation: "modal" }} />
      </Stack>
    </QueryClientProvider>
  );
}
