import React from "react";
import {
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  ViewStyle,
} from "react-native";

export type ButtonVariant =
  | "primary"
  | "kakao"
  | "outline"
  | "ghost"
  | "danger";

type Props = {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  variant?: ButtonVariant;
  color?: string;
  textColor?: string;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
};

/**
 * 앱 전역 공통 버튼 컴포넌트.
 *
 * @example
 * // 기본 (초록 primary)
 * <Button label="시작하기" onPress={handleStart} />
 *
 * @example
 * // 비활성화
 * <Button label="다음" onPress={handleNext} disabled={!isSelected} />
 *
 * @example
 * // variant 지정
 * <Button label="카카오로 시작하기" variant="kakao" />
 * <Button label="구글로 시작하기" variant="outline" />
 * <Button label="회원가입으로 이동" variant="ghost" onPress={() => router.push("/(auth)/signup")} />
 * <Button label="로그아웃" variant="danger" onPress={handleLogout} />
 *
 * @example
 * // 퀴즈처럼 동적 색상
 * <Button label="다음 문제" onPress={handleNext} color={accentColor} />
 *
 * @example
 * // 스타일 오버라이드
 * <Button label="확인" style={{ marginTop: 20 }} textStyle={{ fontSize: 14 }} />
 */
export function Button({
  label,
  onPress,
  disabled = false,
  variant = "primary",
  color,
  textColor,
  style,
  textStyle,
}: Props) {
  return (
    <TouchableOpacity
      style={[
        styles.base,
        variantContainer[variant],
        disabled ? disabledContainer[variant] : undefined,
        color ? { backgroundColor: color } : undefined,
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.85}
      disabled={disabled}
    >
      <Text
        style={[
          styles.text,
          variantText[variant],
          textColor ? { color: textColor } : undefined,
          textStyle,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
  },
  text: {
    fontSize: 16,
    fontWeight: "700",
  },
});

const variantContainer: Record<ButtonVariant, ViewStyle> = {
  primary: { backgroundColor: "#58CC02" },
  kakao: { backgroundColor: "#FEE500" },
  outline: {
    backgroundColor: "#242628",
    borderWidth: 1.5,
    borderColor: "#333537",
  },
  ghost: {},
  danger: {
    backgroundColor: "#242628",
    borderWidth: 1,
    borderColor: "#FF4B4B33",
  },
};

const variantText: Record<ButtonVariant, TextStyle> = {
  primary: { color: "#fff" },
  kakao: { color: "#191919" },
  outline: { color: "#fff" },
  ghost: { color: "#58CC02" },
  danger: { color: "#FF4B4B" },
};

const disabledContainer: Record<ButtonVariant, ViewStyle> = {
  primary: { backgroundColor: "#1e3a10" },
  kakao: { opacity: 0.6 },
  outline: { opacity: 0.5 },
  ghost: { opacity: 0.5 },
  danger: { opacity: 0.5 },
};
