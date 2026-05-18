import { QuizConceptData } from "@/types/quiz";
import { MOCK_CONCEPT_DATA } from "@/mocks/quizConceptData";

export async function fetchQuizConceptData(conceptId: number): Promise<QuizConceptData> {
  // TODO: 실제 API로 교체
  // return api.get(`/api/quiz/concept-data?conceptId=${conceptId}`).then((r) => r.data);

  await new Promise((resolve) => setTimeout(resolve, 800));

  const data = MOCK_CONCEPT_DATA[conceptId];
  if (!data) throw new Error(`CONCEPT_NOT_FOUND: ${conceptId}`);
  return data;
}
