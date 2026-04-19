import { useUserStore } from "@/store/useUserStore";
import { Redirect } from "expo-router";
import { ActivityIndicator, StyleSheet, View } from "react-native";

export default function Index() {
  const isLoggedIn = useUserStore((s) => s.isLoggedIn);
  const hasOnboarded = useUserStore((s) => s.hasOnboarded);
  const isLoading = useUserStore((s) => s.isLoading);

  // 접속 중 애니메이션 추가 예정
  // TODO: 임시 - 아이콘 확인용 로그인 스킵
  return <Redirect href="/(tabs)" />;

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#58CC02" />
      </View>
    );
  }

  if (isLoggedIn && hasOnboarded) return <Redirect href="/(tabs)" />;
  if (isLoggedIn && !hasOnboarded) return <Redirect href="/(onboarding)" />;
  return <Redirect href="/(auth)" />;
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#191A1C",
  },
});
