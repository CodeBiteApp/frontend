import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { router } from "expo-router";
import { Platform } from "react-native";

const PUSH_TOKEN_KEY = "@push_token";

function isExpoGo(): boolean {
  return Constants.executionEnvironment === "storeClient";
}

export async function setupAndroidChannel() {
  if (Platform.OS !== "android") return;
  const Notifications = await import("expo-notifications");
  await Notifications.setNotificationChannelAsync("default", {
    name: "기본 알림",
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
  });
}

export async function requestPermissionsAndGetToken(): Promise<string | null> {
  try {
    const Notifications = await import("expo-notifications");
    const { status: existing } = await Notifications.getPermissionsAsync() as any;
    let finalStatus = existing;

    if (existing !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync() as any;
      finalStatus = status;
    }

    if (finalStatus !== "granted") return null;

    // FCM 토큰 발급은 Dev Build 이상에서만 가능
    if (isExpoGo()) return null;

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

  if (cached !== newToken) {
    await AsyncStorage.setItem(PUSH_TOKEN_KEY, newToken);
    return newToken;
  }

  return null;
}

export async function scheduleQuizNotification(delaySeconds = 5): Promise<boolean> {
  try {
    const Notifications = await import("expo-notifications");
    const { granted } = await Notifications.requestPermissionsAsync() as any;
    if (!granted) return false;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "퀴즈 시간이에요! 📝",
        body: "지금 퀴즈가 시작됐어요. 들어와서 풀어보세요!",
        data: { type: "quiz_start" },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: delaySeconds,
      },
    });
    return true;
  } catch {
    return false;
  }
}

export function setupNotificationHandlers() {
  let cleanup: (() => void) | undefined;

  import("expo-notifications").then((Notifications) => {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowList: true,
      }),
    });

    const subscription = Notifications.addNotificationResponseReceivedListener(
      (response: any) => {
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
    cleanup = () => subscription.remove();
  });

  return () => cleanup?.();
}
