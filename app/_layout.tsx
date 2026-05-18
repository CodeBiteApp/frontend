import { setUnauthorizedHandler } from "@/api/axios";
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
<<<<<<< HEAD
    const boot = async () => {
      if (process.env.EXPO_PUBLIC_MOCK_AUTH === "true") {
        // @ts-ignore
        const { seedMockSession } = await import("@/mocks");
        await seedMockSession();
      }
      await restoreSession().catch(() => {});
    };
    boot();
=======
    // const boot = async () => {
    //   if (process.env.EXPO_PUBLIC_MOCK_AUTH === "true") {
    //     // @ts-ignore
    //     const { seedMockSession } = await import("@/mocks");
    //     await seedMockSession();
    //   }
    //   await restoreSession().catch(() => {});
    // };
    // boot();
>>>>>>> dev

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
