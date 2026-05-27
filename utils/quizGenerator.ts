import {
  AnyQuizQuestion,
  MatchingQuestion,
  OXQuestion,
  QuizConceptData,
  QuizQuestion,
  ShortAnswerQuestion,
} from "@/types/quiz";

// Java java.util.Random과 100% 호환되는 LCG 난수 생성기
class JavaRandom {
  private seed: bigint;

  constructor(seed: number) {
    this.seed = (BigInt(seed) ^ 0x5deece66dn) & ((1n << 48n) - 1n);
  }

  private next(bits: number): number {
    this.seed = (this.seed * 0x5deece66dn + 0xbn) & ((1n << 48n) - 1n);
    return Number(this.seed >> BigInt(48 - bits));
  }

  nextInt(n: number): number {
    if (n <= 0) throw new Error("n must be positive");
    if ((n & -n) === n) {
      return Number((BigInt(n) * BigInt(this.next(31))) >> 31n);
    }
    let bits: number, val: number;
    do {
      bits = this.next(31);
      val = bits % n;
    } while (bits - val + (n - 1) < 0);
    return val;
  }

  // Java Collections.shuffle과 동일한 역방향 Fisher-Yates
  shuffle<T>(array: T[]): T[] {
    for (let i = array.length; i > 1; i--) {
      const j = this.nextInt(i);
      const temp = array[i - 1];
      array[i - 1] = array[j];
      array[j] = temp;
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

  data.siblings.forEach((s) => {
    s.detailsList.forEach((d) => {
      all.push({
        concept_id: String(s.conceptId),
        title: s.conceptTitle,
        key: d.key,
        value: d.value,
      });
    });
  });

  // 시드 동기화: 서버와 동일한 정렬 순서 유지
  all.sort((a, b) => {
    if (a.concept_id !== b.concept_id) return a.concept_id.localeCompare(b.concept_id);
    return a.key.localeCompare(b.key);
  });

  return all;
}

function generateMultipleChoice(rawData: RawItem[], rng: JavaRandom): QuizQuestion[] {
  const questions: QuizQuestion[] = [];

  rawData.forEach((item, idx) => {
    let distractors = rawData
      .filter((x) => x.value !== item.value)
      .map((x) => x.value);

    // 시드 동기화: 중복 제거 후 사전순 정렬
    distractors = Array.from(new Set(distractors)).sort();

    let sampledDistractors: string[];
    if (distractors.length < 3) {
      sampledDistractors = [...distractors];
    } else {
      // 시드 동기화: 정렬된 오답 풀 전체 셔플 후 상위 3개
      const tempDist = [...distractors];
      rng.shuffle(tempDist);
      sampledDistractors = tempDist.slice(0, 3);
    }

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

function generateOx(rawData: RawItem[], rng: JavaRandom): OXQuestion[] {
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

    // X 문제: rng.nextInt로 오답 선택
    const distractors = rawData.filter((x) => x.value !== item.value);
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

function generateMatching(rawData: RawItem[], rng: JavaRandom): MatchingQuestion[] {
  const questions: MatchingQuestion[] = [];
  if (rawData.length < 3) return questions;

  const combos: [RawItem, RawItem, RawItem][] = [];
  for (let i = 0; i < rawData.length - 2; i++) {
    for (let j = i + 1; j < rawData.length - 1; j++) {
      for (let k = j + 1; k < rawData.length; k++) {
        combos.push([rawData[i], rawData[j], rawData[k]]);
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

export function generateQuestionsFromConceptData(data: QuizConceptData): AnyQuizQuestion[] {
  const rng = new JavaRandom(data.randomSeed);
  const rawData = toRawData(data);

  if (rawData.length === 0) return [];

  return [
    ...generateMultipleChoice(rawData, rng),
    ...generateOx(rawData, rng),
    ...generateShortAnswer(rawData),
    ...generateMatching(rawData, rng),
  ];
}
