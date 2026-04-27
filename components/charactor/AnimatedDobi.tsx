import React, { useEffect } from "react";
import { useWindowDimensions } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import DobiCommon from "./dobi-common";

export function AnimatedDobi() {
  const { width, height } = useWindowDimensions();
  const size = Math.min(width, height) * 0.55;

  const opacity = useSharedValue(0);
  const translateY = useSharedValue(40);
  const floatY = useSharedValue(0);

  useEffect(() => {
    // 입장 애니메이션
    opacity.value = withTiming(1, {
      duration: 400,
      easing: Easing.out(Easing.quad),
    });
    translateY.value = withTiming(
      0,
      { duration: 400, easing: Easing.out(Easing.quad) },
      () => {
        // 입장 완료 후 둥실 루프
        floatY.value = withRepeat(
          withSequence(
            withTiming(-10, {
              duration: 750,
              easing: Easing.inOut(Easing.sin),
            }),
            withTiming(0, { duration: 750, easing: Easing.inOut(Easing.sin) }),
          ),
          -1,
          false,
        );
      },
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value + floatY.value }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <DobiCommon size={size} />
    </Animated.View>
  );
}
