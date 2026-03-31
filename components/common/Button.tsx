import React from "react";
import { StyleSheet, Text, TouchableOpacity, TouchableOpacityProps } from "react-native";

type Variant = "primary" | "secondary" | "outline";

type Props = TouchableOpacityProps & {
  title: string;
  variant?: Variant;
};

export function Button({ title, variant = "primary", style, ...rest }: Props) {
  return (
    <TouchableOpacity style={[styles.base, styles[variant], style]} activeOpacity={0.8} {...rest}>
      <Text style={[styles.text, variant === "outline" && styles.outlineText]}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  primary: { backgroundColor: "#0a7ea4" },
  secondary: { backgroundColor: "#f5a623" },
  outline: { backgroundColor: "transparent", borderWidth: 2, borderColor: "#0a7ea4" },
  text: { color: "#fff", fontSize: 16, fontWeight: "700" },
  outlineText: { color: "#0a7ea4" },
});
