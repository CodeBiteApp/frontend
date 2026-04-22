import { AcornSvg } from "@/components/common/AcornButton";
import LottieView from "lottie-react-native";
import React, { useEffect } from "react";
import { Dimensions, Modal, View } from "react-native";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from "react-native-reanimated";

const { width: SW } = Dimensions.get("window");
const SQUIRREL_SIZE = 120;

interface Props {
  stageId: string;
  position: { x: number; y: number; width: number; height: number };
  color: string;
  darkColor: string;
  onFinish: () => void;
}

export function AnimatedDobiEatting({
  stageId,
  position,
  color,
  darkColor,
  onFinish,
}: Props) {
  const acornScale = useSharedValue(1);
  const squirrelLeft = useSharedValue(SW);
  const squirrelOpacity = useSharedValue(1);

  const squirrelTargetLeft =
    position.x + position.width / 2 - SQUIRREL_SIZE / 2;
  const squirrelTop = position.y + position.height / 2 - SQUIRREL_SIZE / 2;

  useEffect(() => {
    // 1. 다람쥐 오른쪽에서 슬라이드인 (500ms)
    squirrelLeft.value = withTiming(
      squirrelTargetLeft,
      { duration: 500 },
      () => {
        // 2. 도토리 팝 → 사라짐 (350ms)
        acornScale.value = withSequence(
          withTiming(1.2, { duration: 100 }),
          withTiming(0, { duration: 250 }, () => {
            // 3. 잠깐 뜸 들이다가 다람쥐 퇴장 (650ms 후)
            squirrelOpacity.value = withDelay(
              350,
              withTiming(0, { duration: 300 }, () => {
                runOnJS(onFinish)();
              }),
            );
          }),
        );
      },
    );
  }, []);

  const acornStyle = useAnimatedStyle(() => ({
    transform: [{ scale: acornScale.value }],
  }));

  const squirrelStyle = useAnimatedStyle(() => ({
    left: squirrelLeft.value,
    opacity: squirrelOpacity.value,
  }));

  return (
    <Modal visible transparent animationType="none" onRequestClose={onFinish}>
      <View style={{ flex: 1 }} pointerEvents="none">
        {/* 도토리 오버레이 */}
        <Animated.View
          style={[
            {
              position: "absolute",
              left: position.x,
              top: position.y,
              width: position.width,
              height: position.height,
            },
            acornStyle,
          ]}
        >
          <AcornSvg
            bodyColor={color}
            bodyDark={darkColor}
            capColor="#6D4C41"
            capStripe="#8D6E63"
            textColor="#fff"
            stageNum={Number(stageId)}
            width={position.width}
            height={position.height}
          />
        </Animated.View>

        {/* 다람쥐 */}
        <Animated.View
          style={[
            {
              position: "absolute",
              top: squirrelTop,
              width: SQUIRREL_SIZE,
              height: SQUIRREL_SIZE,
            },
            squirrelStyle,
          ]}
        >
          <LottieView
            source={require("@/animation/DaramRat.json")}
            autoPlay
            loop
            style={{ width: SQUIRREL_SIZE, height: SQUIRREL_SIZE }}
          />
        </Animated.View>
      </View>
    </Modal>
  );
}
