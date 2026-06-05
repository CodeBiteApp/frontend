import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { router } from "expo-router";
import { Platform } from "react-native";

const PUSH_TOKEN_KEY = "@push_token";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowList: true,
  }),
});

export async function setupAndroidChannel() {
  if (Platform.OS !== "android") return;
  await Notifications.setNotificationChannelAsync("default", {
    name: "기본 알림",
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
  });
}

export async function requestPermissionsAndGetToken(): Promise<string | null> {
  try {
    const { status: existing } = (await Notifications.getPermissionsAsync()) as any;
    let finalStatus = existing;

    if (existing !== "granted") {
      const { status } = (await Notifications.requestPermissionsAsync()) as any;
      finalStatus = status;
    }

    if (finalStatus !== "granted") return null;

    // 실기기에서만 토큰 발급 가능 (FCM 구글 네이티브 푸시 토큰 획득)
    // Expo Go SDK 53+에서는 지원 안 됨 → development build 필요
    const { data } = await Notifications.getDevicePushTokenAsync();
    return data;
  } catch {
    return null;
  }
}

export async function getOrRefreshToken(): Promise<string | null> {
  const newToken = await requestPermissionsAndGetToken();
  if (!newToken) return null;

  const cached = await AsyncStorage.getItem(PUSH_TOKEN_KEY);

  // 토큰이 변경된 경우에만 서버 재등록이 필요함을 알림
  if (cached !== newToken) {
    await AsyncStorage.setItem(PUSH_TOKEN_KEY, newToken);
    return newToken; // 새 토큰 → 서버에 등록 필요
  }

  return null; // 동일 토큰 → 서버 재등록 불필요
}

export async function scheduleQuizNotification(delaySeconds = 5) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "퀴즈 시간이에요! 📝",
      body: "지금 퀴즈가 시작됐어요. 들어와서 풀어보세요!",
      data: { type: "quiz_start" },
    },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: delaySeconds },
  });
}

export function setupNotificationHandlers() {
  // 알림 탭 시 화면 이동
  const subscription = Notifications.addNotificationResponseReceivedListener(
    (response: Notifications.NotificationResponse) => {
      const type = response.notification.request.content.data?.type;
      if (type === "ranking_overtaken") {
        router.push("/(tabs)/ranking");
      } else if (type === "quiz_start") {
        router.push("/(tabs)");
      } else {
        router.push("/(tabs)");
      }
    }
  );

  return () => subscription.remove();
}
