import React, { forwardRef } from "react";
import { TouchableOpacity, View } from "react-native";
import { Ellipse, Path, Rect, Svg, Text as SvgText } from "react-native-svg";

export const ACORN_W = 52;
export const ACORN_H = 66;

interface Props {
  stageNum: number;
  color: string;
  darkColor: string;
  completed: boolean;
  style?: object;
  onPress: () => void;
}

export const AcornButton = forwardRef<View, Props>(
  ({ stageNum, color, darkColor, completed, style, onPress }, ref) => {
    return (
      <View
        ref={ref}
        style={[{ width: ACORN_W, height: ACORN_H, position: "absolute" }, style]}
      >
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={0.8} onPress={onPress}>
          <AcornSvg
            bodyColor={completed ? "#4A4A4A" : color}
            bodyDark={completed ? "#2A2A2A" : darkColor}
            capColor={completed ? "#383838" : "#6D4C41"}
            capStripe={completed ? "#272727" : "#8D6E63"}
            textColor={completed ? "#666" : "#fff"}
            stageNum={stageNum}
          />
        </TouchableOpacity>
      </View>
    );
  }
);

AcornButton.displayName = "AcornButton";

export function AcornSvg({
  bodyColor,
  bodyDark,
  capColor,
  capStripe,
  textColor,
  stageNum,
  width = ACORN_W,
  height = ACORN_H,
}: {
  bodyColor: string;
  bodyDark: string;
  capColor: string;
  capStripe: string;
  textColor: string;
  stageNum: number;
  width?: number;
  height?: number;
}) {
  return (
    <Svg width={width} height={height} viewBox="0 0 52 66">
      {/* 꼭지 */}
      <Rect x="22" y="0" width="8" height="10" rx="4" fill={capColor} />
      {/* 모자 */}
      <Path
        d="M 4 14 Q 26 6 48 14 L 46 30 Q 38 36 26 36 Q 14 36 6 30 Z"
        fill={capColor}
      />
      {/* 모자 결 */}
      <Path
        d="M 8 18 Q 26 24 44 18"
        stroke={capStripe}
        strokeWidth="1.5"
        fill="none"
        opacity="0.7"
      />
      <Path
        d="M 7 25 Q 26 31 45 25"
        stroke={capStripe}
        strokeWidth="1.5"
        fill="none"
        opacity="0.7"
      />
      {/* 몸통 */}
      <Ellipse cx="26" cy="51" rx="22" ry="17" fill={bodyColor} />
      {/* 몸통 아랫부분 그림자 */}
      <Ellipse cx="26" cy="59" rx="15" ry="8" fill={bodyDark} opacity="0.3" />
      {/* 숫자 */}
      <SvgText
        x="26"
        y="56"
        textAnchor="middle"
        fill={textColor}
        fontSize="13"
        fontWeight="700"
      >
        {String(stageNum)}
      </SvgText>
    </Svg>
  );
}
