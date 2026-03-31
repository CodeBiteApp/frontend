import { useUserStore } from "@/store/useUserStore";
import { Redirect } from "expo-router";
import React from "react";

export default function Index() {
  const isLoggedIn = useUserStore((s) => s.isLoggedIn);

  if (isLoggedIn) {
    return <Redirect href="/(tabs)" />;
  }
  return <Redirect href="/(auth)/login" />;
}
