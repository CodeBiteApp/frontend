import { AcornSvg } from "@/components/common/AcornButton";
import DobiEatting from "@/components/charactor/dobi-eatting";
import React, { useEffect, useMemo } from "react";
import { Modal, View } from "react-native";
import Animated, {
  Easing,
  SharedValue,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from "react-native-reanimated";

const DOBI_SIZE = 130;
const ACORN_ANIM_SCALE = 1.6;
const PARTICLE_COUNT = 10;
const PARTICLE_COLORS = ["#6D4C41", "#8D6E63", "#EFAC00", "#BCAAA4", "#795548"];

type ParticleConfig = {
  angle: number;
  distance: number;
  size: number;
  color: string;
  delayRatio: number;
  isRect: boolean;
};

function ParticleItem({
  config,
  originX,
  originY,
  burstTrigger,
}: {
  config: ParticleConfig;
  originX: number;
  originY: number;
  burstTrigger: SharedValue<number>;
}) {
  const rad = (config.angle * Math.PI) / 180;
  const dx = Math.cos(rad) * config.distance;
  const dy = Math.sin(rad) * config.distance;
  const dr = config.delayRatio;

  const style = useAnimatedStyle(() => {
    const raw = burstTrigger.value;
    const t = Math.min(1, Math.max(0, (raw - dr) / (1 - dr)));
    const eased = 1 - (1 - t) * (1 - t);
    const opacity = t < 0.6 ? 1 : 1 - (t - 0.6) / 0.4;
    return {
      transform: [
        { translateX: eased * dx },
        { translateY: eased * dy + t * t * 30 },
        { scale: Math.max(0, 1 - t * 0.55) },
        { rotate: `${eased * config.angle * 0.5}deg` },
      ],
      opacity: Math.max(0, opacity),
    };
  });

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          left: originX - config.size / 2,
          top: originY - config.size / 2,
          width: config.size,
          height: config.size,
          borderRadius: config.isRect ? 2 : config.size / 2,
          backgroundColor: config.color,
        },
        style,
      ]}
    />
  );
}

interface Props {
  stageId: string;
  position: { x: number; y: number; width: number; height: number };
  nextPosition: { x: number; y: number; width: number; height: number } | null;
  color: string;
  darkColor: string;
  onFinish: () => void;
}

export function AnimatedDobiTransition({
  stageId,
  position,
  nextPosition,
  color,
  darkColor,
  onFinish,
}: Props) {
  const dobiLeft = position.x + position.width / 2 - DOBI_SIZE / 2;
  const dobiTop = position.y - DOBI_SIZE + 30;
  // 도토리 중심이 도비 입 위치(도비 높이 55%)까지 이동하는 거리
  const acornFlyDistance = position.height / 2 + DOBI_SIZE * 0.45 - 14;
  const particleX = dobiLeft + DOBI_SIZE / 2;
  const particleY = dobiTop + DOBI_SIZE * 0.55;

  // 확대된 도토리 크기 및 위치 (원래 도토리 중심 기준으로 중앙 정렬)
  const acornW = position.width * ACORN_ANIM_SCALE;
  const acornH = position.height * ACORN_ANIM_SCALE;
  const acornLeft = position.x + position.width / 2 - acornW / 2;
  const acornTop = position.y + position.height / 2 - acornH / 2;
  const stageNum = (Number(stageId.split("_")[1]) || 0) + 1;

  const acornTranslateY = useSharedValue(0);
  const acornScale = useSharedValue(1);
  const acornOpacity = useSharedValue(1);
  const dobiScaleY = useSharedValue(1);
  const dobiOpacity = useSharedValue(1);
  const dobiTranslateX = useSharedValue(0);
  const dobiTranslateY = useSharedValue(0);
  const burstTrigger = useSharedValue(0);

  const nextDobiLeft = nextPosition
    ? nextPosition.x + nextPosition.width / 2 - DOBI_SIZE / 2
    : dobiLeft;
  const nextDobiTop = nextPosition ? nextPosition.y - DOBI_SIZE + 14 : dobiTop;
  const moveDX = nextDobiLeft - dobiLeft;
  const moveDY = nextDobiTop - dobiTop;

  const particles = useMemo<ParticleConfig[]>(
    () =>
      Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
        angle: (360 / PARTICLE_COUNT) * i + (Math.random() * 30 - 15),
        distance: 45 + Math.random() * 65,
        size: 7 + Math.random() * 9,
        color: PARTICLE_COLORS[i % PARTICLE_COLORS.length],
        delayRatio: Math.random() * 0.25,
        isRect: i % 3 === 0,
      })),
    [],
  );

  useEffect(() => {
    // Phase 1: 도토리가 위로 날아올라 도비에게 도달 (300ms)
    acornTranslateY.value = withTiming(
      -acornFlyDistance,
      { duration: 300, easing: Easing.out(Easing.quad) },
      () => {
        // Phase 2: 도토리 소멸 + 파티클 버스트
        acornScale.value = withSequence(
          withTiming(1.25, { duration: 80 }),
          withTiming(0, { duration: 150 }, () => {
            acornOpacity.value = 0;
            burstTrigger.value = withTiming(1, {
              duration: 550,
              easing: Easing.out(Easing.quad),
            });
          }),
        );

        // Phase 2 (병렬): 도비 먹기 squish
        dobiScaleY.value = withSequence(
          withTiming(0.7, { duration: 100, easing: Easing.in(Easing.quad) }),
          withTiming(1.15, { duration: 100, easing: Easing.out(Easing.quad) }),
          withTiming(0.8, { duration: 80, easing: Easing.in(Easing.quad) }),
          withTiming(1.05, { duration: 80, easing: Easing.out(Easing.quad) }),
          withTiming(
            1,
            { duration: 60, easing: Easing.out(Easing.quad) },
            () => {
              // Phase 3: 다음 스테이지로 이동하거나 페이드아웃
              if (nextPosition) {
                dobiTranslateX.value = withTiming(moveDX, {
                  duration: 450,
                  easing: Easing.inOut(Easing.quad),
                });
                dobiTranslateY.value = withTiming(
                  moveDY,
                  { duration: 450, easing: Easing.inOut(Easing.quad) },
                  () => {
                    dobiOpacity.value = withTiming(0, { duration: 200 }, () => {
                      runOnJS(onFinish)();
                    });
                  },
                );
              } else {
                dobiOpacity.value = withDelay(
                  100,
                  withTiming(0, { duration: 300 }, () => {
                    runOnJS(onFinish)();
                  }),
                );
              }
            },
          ),
        );
      },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const acornStyle = useAnimatedStyle(() => ({
    opacity: acornOpacity.value,
    transform: [
      { translateY: acornTranslateY.value },
      { scale: acornScale.value },
    ],
  }));

  const dobiStyle = useAnimatedStyle(() => ({
    opacity: dobiOpacity.value,
    transform: [
      { translateX: dobiTranslateX.value },
      { translateY: dobiTranslateY.value },
      { scaleY: dobiScaleY.value },
    ],
  }));

  return (
    <Modal visible transparent animationType="none" onRequestClose={onFinish}>
      <View style={{ flex: 1 }} pointerEvents="none">
        {particles.map((p, i) => (
          <ParticleItem
            key={i}
            config={p}
            originX={particleX}
            originY={particleY}
            burstTrigger={burstTrigger}
          />
        ))}

        {/* 도토리 오버레이 - 위로 날아오름 */}
        <Animated.View
          style={[
            {
              position: "absolute",
              left: acornLeft,
              top: acornTop,
              width: acornW,
              height: acornH,
              shadowColor: "#EFAC00",
              shadowOpacity: 0.55,
              shadowRadius: 10,
              shadowOffset: { width: 0, height: 0 },
              elevation: 8,
            },
            acornStyle,
          ]}
        >
          <AcornSvg
            bodyColor={color}
            bodyDark={darkColor}
            capColor="#8B6147"
            capStripe="#A67B5B"
            textColor="#fff"
            stageNum={stageNum}
            width={acornW}
            height={acornH}
          />
        </Animated.View>

        {/* 도비 오버레이 - 먹기 후 다음 스테이지로 이동 */}
        <Animated.View
          style={[
            {
              position: "absolute",
              left: dobiLeft,
              top: dobiTop,
              width: DOBI_SIZE,
              height: DOBI_SIZE,
            },
            dobiStyle,
          ]}
        >
          <DobiEatting size={DOBI_SIZE} />
        </Animated.View>
      </View>
    </Modal>
  );
}
