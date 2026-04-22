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
const PARTICLE_COUNT = 10;
const PARTICLE_COLORS = ["#6D4C41", "#8D6E63", "#EFAC00", "#BCAAA4", "#795548"];

type ParticleConfig = {
  angle: number;      // 발사 방향 (도)
  distance: number;   // 비산 거리 (px)
  size: number;       // 파티클 크기 (px)
  color: string;      // 파티클 색상
  delayRatio: number; // 발사 딜레이 (0~0.3, burstTrigger 0→1 기준)
  isRect: boolean;    // true면 사각형, false면 원형
};

// burstTrigger (0→1) 값을 받아 개별 파티클 애니메이션을 계산하는 서브 컴포넌트.
// hooks-in-loop 문제를 피하기 위해 컴포넌트로 분리.
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
    // delayRatio만큼 뒤에 시작하고, 나머지 구간에서 0→1로 정규화
    const t = Math.min(1, Math.max(0, (raw - dr) / (1 - dr)));
    const eased = 1 - (1 - t) * (1 - t); // ease-out quad

    // 후반 40%에서 fade out
    const opacity = t < 0.6 ? 1 : 1 - (t - 0.6) / 0.4;

    return {
      transform: [
        { translateX: eased * dx },
        // dy 방향 이동 + 중력 (t² 가중치로 아래로 처짐)
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
  const startY = position.y + position.height + 10;

  const acornScale = useSharedValue(1);
  const dobiTranslateY = useSharedValue(startY);
  const dobiScaleY = useSharedValue(1);
  const dobiOpacity = useSharedValue(1);
  const burstTrigger = useSharedValue(0);

  const dobiTargetY = position.y + position.height / 2 - DOBI_SIZE * 0.55;
  const dobiX = position.x + position.width / 2 - DOBI_SIZE / 2;
  const acornCenterX = position.x + position.width / 2;
  const acornCenterY = position.y + position.height / 2;

  // 마운트 시 1회 생성. 랜덤 방향/크기/딜레이로 자연스러운 분산 연출.
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
    dobiTranslateY.value = withTiming(
      dobiTargetY,
      { duration: 350, easing: Easing.out(Easing.quad) },
      () => {
        acornScale.value = withSequence(
          withTiming(1.25, { duration: 80 }),
          withTiming(0, { duration: 180 }, () => {
            // 도토리가 사라지는 순간 파티클 발사
            burstTrigger.value = withTiming(1, {
              duration: 550,
              easing: Easing.out(Easing.quad),
            });
          }),
        );

        dobiScaleY.value = withSequence(
          withTiming(0.65, { duration: 100, easing: Easing.in(Easing.quad) }),
          withTiming(1.1, { duration: 100, easing: Easing.out(Easing.quad) }),
          withTiming(0.7, { duration: 100, easing: Easing.in(Easing.quad) }),
          withTiming(1.05, { duration: 100, easing: Easing.out(Easing.quad) }),
          withTiming(0.8, { duration: 80, easing: Easing.in(Easing.quad) }),
          withTiming(1, { duration: 80, easing: Easing.out(Easing.quad) }, () => {
            dobiOpacity.value = withDelay(150, withTiming(0, { duration: 250 }));
            dobiTranslateY.value = withDelay(
              150,
              withTiming(
                startY,
                { duration: 350, easing: Easing.in(Easing.quad) },
                () => { runOnJS(onFinish)(); },
              ),
            );
          }),
        );
      },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const acornStyle = useAnimatedStyle(() => ({
    transform: [{ scale: acornScale.value }],
  }));

  const dobiStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: dobiTranslateY.value },
      { scaleY: dobiScaleY.value },
    ],
    opacity: dobiOpacity.value,
  }));

  return (
    <Modal visible transparent animationType="none" onRequestClose={onFinish}>
      <View style={{ flex: 1 }} pointerEvents="none">
        {/* 도토리 부스러기 파티클 */}
        {particles.map((p, i) => (
          <ParticleItem
            key={i}
            config={p}
            originX={acornCenterX}
            originY={acornCenterY}
            burstTrigger={burstTrigger}
          />
        ))}

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

        {/* 도비 먹기 */}
        <Animated.View
          style={[
            {
              position: "absolute",
              left: dobiX,
              top: 0,
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
