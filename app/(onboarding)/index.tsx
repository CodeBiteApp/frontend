import { Button } from "@/components/common/Button";
import { useUserStore } from "@/store/useUserStore";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const STEPS = [
  {
    title: "진출하고자 하는 분야는?",
    subtitle: "퀴즈 주제를 추천해드릴게요",
    options: [
      "프론트엔드 개발자",
      "백엔드 개발자",
      "AI 개발자",
      "데이터 개발자",
      "게임 개발자",
    ],
  },
  {
    title: "주로 사용하는 기술이 있나요?",
    subtitle: "맞춤형 퀴즈를 준비할게요",
    options: ["JavaScript/TypeScript", "Java", "Python", "C/C++"],
  },
  {
    title: "실력 수준을 알려주세요",
    subtitle: "난이도를 조절해드릴게요",
    options: ["입문자", "초급", "중급", "고급"],
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const completeOnboarding = useUserStore((s) => s.completeOnboarding);

  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState<(number | null)[]>(
    Array(STEPS.length).fill(null),
  );

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;
  const isSelected = selected[step] !== null;

  const handleSelect = (index: number) => {
    const next = [...selected];
    next[step] = index;
    setSelected(next);
  };

  const handleNext = () => {
    if (!isSelected) return;
    if (isLast) {
      completeOnboarding();
      router.replace("/quiz-loading");
    } else {
      setStep((s) => s + 1);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.progressRow}>
        {STEPS.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              i <= step ? styles.dotActive : styles.dotInactive,
            ]}
          />
        ))}
      </View>

      <View style={styles.content}>
        <Text style={styles.stepLabel}>
          {step + 1} / {STEPS.length}
        </Text>
        <Text style={styles.title}>{current.title}</Text>
        <Text style={styles.subtitle}>{current.subtitle}</Text>

        <View style={styles.options}>
          {current.options.map((option, i) => {
            const active = selected[step] === i;
            return (
              <TouchableOpacity
                key={i}
                style={[styles.option, active && styles.optionActive]}
                onPress={() => handleSelect(i)}
                activeOpacity={0.8}
              >
                <Text
                  style={[styles.optionText, active && styles.optionTextActive]}
                >
                  {option}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <Button
        label={isLast ? "시작하기" : "다음"}
        onPress={handleNext}
        disabled={!isSelected}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#191A1C",
    paddingHorizontal: 28,
    paddingTop: 60,
    paddingBottom: 40,
  },
  progressRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 48,
  },
  dot: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  dotActive: { backgroundColor: "#58CC02" },
  dotInactive: { backgroundColor: "#333537" },
  content: { flex: 1 },
  stepLabel: {
    fontSize: 13,
    color: "#58CC02",
    fontWeight: "600",
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 8,
    lineHeight: 32,
  },
  subtitle: { fontSize: 14, color: "#888", marginBottom: 36 },
  options: { gap: 12 },
  option: {
    borderWidth: 1.5,
    borderColor: "#333537",
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: "#242628",
  },
  optionActive: {
    borderColor: "#58CC02",
    backgroundColor: "#1a2e12",
  },
  optionText: { fontSize: 16, color: "#888" },
  optionTextActive: { color: "#58CC02", fontWeight: "700" },
});
