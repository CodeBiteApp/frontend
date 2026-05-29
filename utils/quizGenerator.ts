import {
  AnyQuizQuestion,
  MatchingQuestion,
  OXQuestion,
  QuizConceptData,
  QuizQuestion,
  ShortAnswerQuestion,
  SiblingConcept,
} from "@/types/quiz";

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

type RawItem = {
  concept_id: string;
  title: string;
  key: string;
  value: string;
};

function toRawData(data: QuizConceptData): RawItem[] {
  const all: RawItem[] = [];

  data.detailsList.forEach((d) => {
    all.push({
      concept_id: String(data.conceptId),
      title: data.conceptTitle,
      key: d.key,
      value: d.value,
    });
  });

  // 시드 동기화: 서버와 동일한 정렬 순서 유지
  all.sort((a, b) => {
    if (a.concept_id !== b.concept_id) return a.concept_id.localeCompare(b.concept_id);
    return a.key.localeCompare(b.key);
  });

  return all;
}

function generateMultipleChoice(rawData: RawItem[], rng: SeededRandom, siblings?: SiblingConcept[]): QuizQuestion[] {
  const questions: QuizQuestion[] = [];

  rawData.forEach((item, idx) => {
    let distractors = rawData
      .filter((x) => x.value !== item.value)
      .map((x) => x.value);

    // 시드 동기화: 중복 제거 후 사전순 정렬
    distractors = Array.from(new Set(distractors)).sort();

    // 오답이 3개 미만이면 인접 개념(siblings)에서 보충
    if (distractors.length < 3 && siblings && siblings.length > 0) {
      const siblingValues = siblings
        .flatMap((s) => s.detailsList.map((d) => d.value))
        .filter((v) => v !== item.value && !distractors.includes(v));
      const extra = Array.from(new Set(siblingValues)).sort();
      distractors = [...distractors, ...extra];
    }

    // 시드 동기화: 항상 shuffle하여 RNG 소비 경로 단일화
    const tempDist = [...distractors];
    rng.shuffle(tempDist);
    const sampledDistractors = tempDist.slice(0, Math.min(3, tempDist.length));

    const choices = [...sampledDistractors, item.value];
    rng.shuffle(choices);
    const answerIndex = choices.indexOf(item.value);

    questions.push({
      id: `${item.concept_id}-${item.key}-mc-${idx}`,
      categoryId: item.concept_id,
      question: `[${item.title}]에 대한 설명으로 올바른 것은?`,
      options: choices,
      answerIndex,
      explanation: item.value,
    } as QuizQuestion);
  });

  return questions;
}

function generateOx(rawData: RawItem[], rng: SeededRandom): OXQuestion[] {
  const questions: OXQuestion[] = [];

  rawData.forEach((item, idx) => {
    // O 문제: 난수 소비 없음
    questions.push({
      id: `${item.concept_id}-${item.key}-ox-o-${idx}`,
      categoryId: item.concept_id,
      type: "ox",
      question: `[${item.title}]에 대한 설명으로 다음 내용은 참인가 거짓인가?\n\n${item.value}`,
      answer: true,
    });

    // X 문제: rng.nextInt로 오답 선택 (시드 동기화: 사전순 정렬)
    const distractors = rawData
      .filter((x) => x.value !== item.value)
      .sort((a, b) => a.value.localeCompare(b.value));
    if (distractors.length > 0) {
      const dist = distractors[rng.nextInt(distractors.length)];
      questions.push({
        id: `${item.concept_id}-${item.key}-ox-x-${idx}`,
        categoryId: item.concept_id,
        type: "ox",
        question: `[${item.title}]에 대한 설명으로 다음 내용은 참인가 거짓인가?\n\n${dist.value}`,
        answer: false,
        explanation: `해당 내용은 [${dist.title}]에 대한 설명입니다.`,
      });
    }
  });

  return questions;
}

function generateShortAnswer(rawData: RawItem[]): ShortAnswerQuestion[] {
  return rawData.map((item, idx) => ({
    id: `${item.concept_id}-${item.key}-sa-${idx}`,
    categoryId: item.concept_id,
    type: "short-answer" as const,
    question: `다음은 무엇에 관한 설명인가?\n\n${item.value}`,
    answer: item.title,
  }));
}

function generateMatching(rawData: RawItem[], rng: SeededRandom): MatchingQuestion[] {
  const questions: MatchingQuestion[] = [];
  if (rawData.length < 3) return questions;

  const combos: [RawItem, RawItem, RawItem][] = [];
  for (let i = 0; i < rawData.length - 2; i++) {
    for (let j = i + 1; j < rawData.length - 1; j++) {
      for (let k = j + 1; k < rawData.length; k++) {
        const titles = [rawData[i].title, rawData[j].title, rawData[k].title];
        if (new Set(titles).size === 3) {
          combos.push([rawData[i], rawData[j], rawData[k]]);
        }
      }
    }
  }

  let targetCombos = combos as [RawItem, RawItem, RawItem][];
  if (combos.length > 100) {
    // 시드 동기화: 결정론적 샘플링
    const tempCombos = [...combos] as [RawItem, RawItem, RawItem][];
    rng.shuffle(tempCombos);
    targetCombos = tempCombos.slice(0, 100);
  }

  targetCombos.forEach((combo, comboIdx) => {
    const values = combo.map((x) => x.value);
    const shuffledValues = [...values];
    rng.shuffle(shuffledValues);

    const leftItems = combo.map((item) => item.title);
    const correctPairs: Record<number, number> = {};
    combo.forEach((item, li) => {
      correctPairs[li] = shuffledValues.indexOf(item.value);
    });

    questions.push({
      id: `${combo[0].concept_id}-${combo[1].concept_id}-${combo[2].concept_id}-mt-${comboIdx}`,
      categoryId: combo[0].concept_id,
      type: "matching",
      question: "각 개념과 그 설명을 올바르게 연결하세요.",
      leftItems,
      rightItems: shuffledValues,
      correctPairs,
    });
  });

  return questions;
}

export function shuffleWithSeed<T>(array: T[], seed: number): T[] {
  const rng = new SeededRandom(seed);
  return rng.shuffle([...array]);
}

export function selectBalancedQuestions(
  all: AnyQuizQuestion[],
  count: number,
  seed: number,
): { selected: AnyQuizQuestion[]; rest: AnyQuizQuestion[] } {
  const rng = new SeededRandom(seed);

  const byType: Record<string, AnyQuizQuestion[]> = {
    "multiple-choice": [],
    ox: [],
    "short-answer": [],
    matching: [],
  };

  for (const q of all) {
    const t = (q as any).type ?? "multiple-choice";
    if (byType[t]) byType[t].push(q);
  }

  for (const t in byType) {
    rng.shuffle(byType[t]);
  }

  const selected: AnyQuizQuestion[] = [];
  const types = ["multiple-choice", "ox", "short-answer", "matching"] as const;

  for (const t of types) {
    if (selected.length < count && byType[t].length > 0) {
      selected.push(byType[t].shift()!);
    }
  }

  const remaining = [
    ...byType["multiple-choice"],
    ...byType["ox"],
    ...byType["short-answer"],
    ...byType["matching"],
  ];
  rng.shuffle(remaining);

  while (selected.length < count && remaining.length > 0) {
    selected.push(remaining.shift()!);
  }

  rng.shuffle(selected);

  return { selected, rest: remaining };
}

export function generateQuestionsFromConceptData(data: QuizConceptData): AnyQuizQuestion[] {
  const rng = new SeededRandom(data.randomSeed);
  const rawData = toRawData(data);

  if (rawData.length === 0) return [];

  return [
    ...generateMultipleChoice(rawData, rng, data.siblings),
    ...generateOx(rawData, rng),
    ...generateShortAnswer(rawData),
    ...generateMatching(rawData, rng),
  ];
}
