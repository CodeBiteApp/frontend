import LottieView from "lottie-react-native";
import React from "react";
import { StyleSheet, useWindowDimensions, View } from "react-native";

interface DaramRatProps {
  autoPlay?: boolean;
  loop?: boolean;
}

export function DaramRat({ autoPlay = true, loop = true }: DaramRatProps) {
  const { width, height } = useWindowDimensions();
  const size = Math.min(width, height) * 0.55;

  return (
    <View style={styles.wrapper}>
      <LottieView
        source={require("@/animation/DaramRat.json")}
        autoPlay={autoPlay}
        loop={loop}
        style={{ width: size, height: size }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
});
