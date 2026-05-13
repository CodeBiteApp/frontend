import React, { useRef, useEffect } from "react";
import { Animated, Easing, View } from "react-native";

const SPOKE_COUNT = 8;

export default function Wheel({ size = 120 }: { size?: number }) {
  const rot = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(rot, {
        toValue: 1,
        duration: 1800,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, [rot]);

  const rotate = rot.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] });

  return (
    <Animated.View style={[{ width: size, height: size }, { transform: [{ rotate }] }]}>
      <View
        style={{
          position: "absolute",
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: 5,
          borderColor: "#C68B3A",
        }}
      />
      <View
        style={{
          position: "absolute",
          width: size * 0.2,
          height: size * 0.2,
          borderRadius: (size * 0.2) / 2,
          backgroundColor: "#C68B3A",
          top: size * 0.4,
          left: size * 0.4,
        }}
      />
      {Array.from({ length: SPOKE_COUNT }).map((_, i) => (
        <View
          key={i}
          style={{
            position: "absolute",
            width: size - 10,
            height: 3,
            backgroundColor: "#C68B3A",
            borderRadius: 2,
            top: (size - 3) / 2,
            left: 5,
            opacity: 0.7,
            transform: [{ rotate: `${(180 / SPOKE_COUNT) * i}deg` }],
            transformOrigin: "center",
          }}
        />
      ))}
    </Animated.View>
  );
}
