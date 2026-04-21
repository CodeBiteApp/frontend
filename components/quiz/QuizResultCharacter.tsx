import { AnimatedDobi } from "@/components/common/AnimatedDobi";
import { DaramRat } from "@/components/common/DaramRat";
import { getDailyCharacterIndex } from "@/utils/dailyCharacter";
import React from "react";

const CHARACTERS = [
  () => <AnimatedDobi />,
  () => <DaramRat />,
  // C 캐릭터 추가 시 여기에 넣기
  () => <AnimatedDobi />,
];

export function QuizResultCharacter() {
  const index = getDailyCharacterIndex(CHARACTERS.length);
  const Character = CHARACTERS[index];
  return <Character />;
}
