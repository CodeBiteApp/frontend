import {
  AnyQuizQuestion,
  ConceptSlot,
  MatchingQuestion,
  OXQuestion,
  QuizConceptData,
  QuizQuestion,
  ShortAnswerQuestion,
  SubjectBatchQuizData,
} from "@/types/quiz";

export const BATCH_SIZE = 5;

// 백엔드 SeededRandom과 동일한 Numerical Recipes LCG (2^32)
// state = (1664525 * state + 1013904223) & 0xFFFFFFFF
// nextInt(bound) = floor(state / 2^32 * bound)
class SeededRandom {
  private state: number;

  constructor(seed: number) {
    this.state = (seed & 0xFFFFFFFF) >>> 0;
  }

  private nextDouble(): number {
    this.state = ((1664525 * this.state + 1013904223) & 0xFFFFFFFF) >>> 0;
    return this.state / 4294967296.0;
  }

  nextInt(bound: number): number {
    return Math.floor(this.nextDouble() * bound);
  }

  shuffle<T>(array: T[]): T[] {
    for (let i = array.length; i > 1; i--) {
      const j = this.nextInt(i);
      [array[i - 1], array[j]] = [array[j], array[i - 1]];
    }
    return array;
  }
}

/**
 * 배치 퀴즈: slot당 1문제씩, BE ValidationService.verifyBatchAnswers와 동일한 RNG 소비.
 * 유형 우선순위: MULTIPLE_CASE → SHORT_ANSWER → OX (조건 미충족 시 다음 유형)
 */
export function generateQuestionsFromBatchData(data: SubjectBatchQuizData): AnyQuizQuestion[] {
  const rng = new SeededRandom(data.randomSeed);
  const questions: AnyQuizQuestion[] = [];

  data.slots.forEach((slot, slotIdx) => {
    const q = generateSlotQuestion(slot, slotIdx + 1, rng, data.subjectId);
    if (q) questions.push(q);
  });

  return questions;
}

function generateSlotQuestion(
  slot: ConceptSlot,
  questionNumber: number,
  rng: SeededRandom,
  subjectId: number,
): AnyQuizQuestion | null {
  const conceptDef = slot.detailsList.find(d => d.key === "definition")
    ?? (slot.detailsList.length > 0 ? slot.detailsList[0] : undefined);

  // siblings는 BE에서 conceptId 오름차순으로 전달됨
  const siblings = slot.siblings;

  // BE extractSiblingDefs와 동일: definition 키만 추출 → 중복 제거 → 사전순 정렬
  const rawDefs = siblings
    .map(s => s.detailsList.find(d => d.key === "definition")?.value)
    .filter((v): v is string => v !== undefined);
  const siblingDefs = Array.from(new Set(rawDefs)).sort();

  const id = `${subjectId}-${slot.conceptId}`;

  if (conceptDef && siblingDefs.length >= 3) {
    // MULTIPLE_CASE
    const distractors = [...siblingDefs];
    rng.shuffle(distractors);
    const options = [...distractors.slice(0, 3), conceptDef.value];
    rng.shuffle(options);
    const answerIndex = options.indexOf(conceptDef.value);
    return {
      id: `${id}-mc`,
      categoryId: String(slot.conceptId),
      question: `[${slot.conceptTitle}]에 대한 설명으로 올바른 것은?`,
      options,
      answerIndex,
    } as QuizQuestion;
  }

  if (conceptDef) {
    // SHORT_ANSWER — RNG 소비 없음
    return {
      id: `${id}-sa`,
      categoryId: String(slot.conceptId),
      type: "short-answer" as const,
      question: `다음은 무엇에 관한 설명인가?\n\n${conceptDef.value}`,
      answer: slot.conceptTitle,
    } as ShortAnswerQuestion;
  }

  if (siblings.length >= 1) {
    // OX
    const isTrue = rng.nextInt(2) === 0;
    let answer: boolean;
    let oxText: string;
    if (isTrue) {
      answer = true;
      oxText = conceptDef?.value ?? slot.detailsList[0]?.value ?? "";
    } else {
      const sibIdx = rng.nextInt(siblings.length);
      const sib = siblings[sibIdx];
      const sibDef = sib.detailsList.find(d => d.key === "definition");
      answer = sibDef == null;
      oxText = sibDef?.value ?? conceptDef?.value ?? slot.detailsList[0]?.value ?? "";
    }
    return {
      id: `${id}-ox`,
      categoryId: String(slot.conceptId),
      type: "ox" as const,
      question: `[${slot.conceptTitle}]에 대한 설명으로 다음 내용은 참인가 거짓인가?\n\n${oxText}`,
      answer,
    } as OXQuestion;
  }

  return null;
}

export function shuffleWithSeed<T>(array: T[], seed: number): T[] {
  const rng = new SeededRandom(seed);
  return rng.shuffle([...array]);
}

/**
 * 백엔드 ValidationService와 동일한 순서/RNG 소비로 문제를 생성합니다.
 * 생성 순서: MULTIPLE_CASE → OX → SHORT_ANSWER → MATCHING (각 1문제)
 * 조건 미충족 시 해당 유형은 생략됩니다.
 */
export function generateQuestionsFromConceptData(data: QuizConceptData): AnyQuizQuestion[] {
  const rng = new SeededRandom(data.randomSeed);
  const questions: AnyQuizQuestion[] = [];

  const conceptDef = data.detailsList.find(d => d.key === "definition");

  // siblings를 conceptId 기준 오름차순 정렬 (결정론적 순서)
  const siblings = [...data.siblings].sort((a, b) => a.conceptId - b.conceptId);

  // 형제들의 definition 값 수집 → 중복 제거 → 사전순 정렬
  const rawSiblingDefs = siblings
    .map(s => s.detailsList.find(d => d.key === "definition")?.value)
    .filter((v): v is string => v !== undefined);
  const siblingDefs = Array.from(new Set(rawSiblingDefs)).sort();

  // 1. MULTIPLE_CASE: 형제 definition이 3개 이상이고 개념 definition 존재
  if (siblingDefs.length >= 3 && conceptDef) {
    const distractors = [...siblingDefs];
    rng.shuffle(distractors);
    const sampledDistractors = distractors.slice(0, 3);
    const choices = [...sampledDistractors, conceptDef.value];
    rng.shuffle(choices);
    const answerIndex = choices.indexOf(conceptDef.value);

    questions.push({
      id: `${data.conceptId}-mc`,
      categoryId: String(data.conceptId),
      question: `[${data.conceptTitle}]에 대한 설명으로 올바른 것은?`,
      options: choices,
      answerIndex,
    } as QuizQuestion);
  }

  // 2. OX: 형제가 1개 이상
  if (siblings.length >= 1) {
    const isTrue = rng.nextInt(2) === 0;
    if (isTrue) {
      const detail = conceptDef ?? data.detailsList[0];
      if (detail) {
        questions.push({
          id: `${data.conceptId}-ox`,
          categoryId: String(data.conceptId),
          type: "ox" as const,
          question: `[${data.conceptTitle}]에 대한 설명으로 다음 내용은 참인가 거짓인가?\n\n${detail.value}`,
          answer: true,
        } as OXQuestion);
      }
    } else {
      const sibIdx = rng.nextInt(siblings.length);
      const sib = siblings[sibIdx];
      const sibDef = sib.detailsList.find(d => d.key === "definition");
      if (sibDef) {
        questions.push({
          id: `${data.conceptId}-ox`,
          categoryId: String(data.conceptId),
          type: "ox" as const,
          question: `[${data.conceptTitle}]에 대한 설명으로 다음 내용은 참인가 거짓인가?\n\n${sibDef.value}`,
          answer: false,
        } as OXQuestion);
      }
    }
  }

  // 3. SHORT_ANSWER: 개념 definition 존재
  if (conceptDef) {
    questions.push({
      id: `${data.conceptId}-sa`,
      categoryId: String(data.conceptId),
      type: "short-answer" as const,
      question: `다음은 무엇에 관한 설명인가?\n\n${conceptDef.value}`,
      answer: data.conceptTitle,
    } as ShortAnswerQuestion);
  }

  // 4. MATCHING: 개념 + definition 있는 형제 2개 이상
  const siblingsWithDef = siblings.filter(s =>
    s.detailsList.some(d => d.key === "definition"),
  );
  if (siblingsWithDef.length >= 2 && conceptDef) {
    const selected = siblingsWithDef.slice(0, 2);
    const items = [
      { title: data.conceptTitle, def: conceptDef.value },
      ...selected.map(s => ({
        title: s.conceptTitle,
        def: s.detailsList.find(d => d.key === "definition")!.value,
      })),
    ];

    const leftItems = items.map(c => c.title);
    const shuffledDefs = items.map(c => c.def);
    rng.shuffle(shuffledDefs);

    const correctPairs: Record<number, number> = {};
    items.forEach((item, i) => {
      correctPairs[i] = shuffledDefs.indexOf(item.def);
    });

    questions.push({
      id: `${data.conceptId}-mt`,
      categoryId: String(data.conceptId),
      type: "matching" as const,
      question: "각 개념과 그 설명을 올바르게 연결하세요.",
      leftItems,
      rightItems: shuffledDefs,
      correctPairs,
    } as MatchingQuestion);
  }

  return questions;
}
