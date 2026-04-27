import React, { useEffect } from "react";
import { useWindowDimensions } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import DobiExciting from "./dobi-exciting";

export function AnimatedDobiExciting() {
  const { width, height } = useWindowDimensions();
  const size = Math.min(width, height) * 0.55;

  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withTiming(1, {
      duration: 250,
      easing: Easing.out(Easing.quad),
    });
    scale.value = withSequence(
      withTiming(1.25, {
        duration: 350,
        easing: Easing.out(Easing.back(2)),
      }),
      withTiming(1, {
        duration: 250,
        easing: Easing.inOut(Easing.quad),
      }),
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <DobiExciting size={size} />
    </Animated.View>
  );
}
