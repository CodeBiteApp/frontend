import {
  AnyQuizQuestion,
  MatchingQuestion,
  OXQuestion,
  QuizConceptData,
  QuizQuestion,
  ShortAnswerQuestion,
} from "@/types/quiz";

function createSeededRandom(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = ((Math.imul(1664525, s) + 1013904223) >>> 0);
    return s / 4294967296;
  };
}

function shuffle<T>(arr: T[], rand: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function generateQuestionsFromConceptData(data: QuizConceptData): AnyQuizQuestion[] {
  const rand = createSeededRandom(data.randomSeed);
  const questions: AnyQuizQuestion[] = [];
  const { conceptId, conceptTitle, detailsList, siblings } = data;

  const cid = String(conceptId);
  const definition = detailsList.find((d) => d.key === "definition");
  const feature = detailsList.find((d) => d.key === "feature");

  // 1. 객관식 — definition 기반 (현재 정답 + 형제 oops 3개)
  if (definition && siblings.length >= 3) {
    const wrongOptions = siblings
      .map((s) => s.detailsList.find((d) => d.key === "definition")?.value)
      .filter((v): v is string => !!v)
      .slice(0, 3);

    const allOptions = shuffle([definition.value, ...wrongOptions], rand);
    const answerIndex = allOptions.indexOf(definition.value);

    questions.push({
      id: `${cid}-mc`,
      categoryId: cid,
      question: `"${conceptTitle}"에 대한 설명으로 옳은 것은?`,
      options: allOptions,
      answerIndex,
      explanation: definition.value,
    } as QuizQuestion);
  }

  // 2. OX — feature 우선, 없으면 definition 사용
  // O: 현재 concept의 값 / X: 형제의 definition으로 속이기
  const oxSource = feature ?? definition;
  if (oxSource && siblings.length >= 1) {
    const useCorrect = rand() > 0.5;
    let question: string;
    let answer: boolean;

    if (useCorrect) {
      question = `다음 설명은 "${conceptTitle}"에 대한 옳은 설명인가?\n\n${oxSource.value}`;
      answer = true;
    } else {
      const sibling = siblings[Math.floor(rand() * siblings.length)];
      const sibDef = sibling.detailsList.find((d) => d.key === "definition");
      if (sibDef) {
        question = `다음 설명은 "${conceptTitle}"에 대한 옳은 설명인가?\n\n${sibDef.value}`;
        answer = false;
      } else {
        question = `다음 설명은 "${conceptTitle}"에 대한 옳은 설명인가?\n\n${oxSource.value}`;
        answer = true;
      }
    }

    questions.push({
      id: `${cid}-ox`,
      categoryId: cid,
      type: "ox",
      question,
      answer,
    } as OXQuestion);
  }

  // 3. 단답형 — definition value → conceptTitle 맞추기
  if (definition) {
    questions.push({
      id: `${cid}-sa`,
      categoryId: cid,
      type: "short-answer",
      question: `"${definition.value}"\n\n무엇에 관한 설명인가?`,
      answer: conceptTitle,
    } as ShortAnswerQuestion);
  }

  // 4. 매칭형 — 현재 + 형제에서 3개 선택 → title ↔ definition
  const allConcepts = [
    { title: conceptTitle, def: definition?.value ?? "" },
    ...siblings.map((s) => ({
      title: s.conceptTitle,
      def: s.detailsList.find((d) => d.key === "definition")?.value ?? "",
    })),
  ].filter((c) => c.def);

  if (allConcepts.length >= 3) {
    const picked = shuffle(allConcepts, rand).slice(0, 3);
    const leftItems = picked.map((c) => c.title);

    // indices 셔플로 rightItems 구성 → correctPairs 충돌 없이 계산
    const shuffledIndices = shuffle([0, 1, 2], rand);
    const rightItems = shuffledIndices.map((i) => picked[i].def);
    const correctPairs: Record<number, number> = {};
    picked.forEach((_, li) => {
      correctPairs[li] = shuffledIndices.indexOf(li);
    });

    questions.push({
      id: `${cid}-matching`,
      categoryId: cid,
      type: "matching",
      question: "각 개념과 그 설명을 올바르게 연결하세요.",
      leftItems,
      rightItems,
      correctPairs,
    } as MatchingQuestion);
  }

  return questions;
}
