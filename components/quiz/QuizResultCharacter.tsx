import { AnimatedDobi } from "@/components/charactor/AnimatedDobi";
import { AnimatedDobiExciting } from "@/components/charactor/AnimatedDobiExciting";
import { AnimatedDobiHappy } from "@/components/charactor/AnimatedDobiHappy";
import { getDailyCharacterIndex } from "@/utils/dailyCharacter";
import React from "react";

const CHARACTERS = [
  () => <AnimatedDobiExciting />,
  () => <AnimatedDobiHappy />,
  () => <AnimatedDobi />,
];

export function QuizResultCharacter() {
  const index = getDailyCharacterIndex(CHARACTERS.length);
  const Character = CHARACTERS[index];
  return <Character />;
}
