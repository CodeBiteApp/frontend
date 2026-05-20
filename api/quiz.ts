import api from "@/api/axios";
import { QuizConceptData } from "@/types/quiz";

export async function fetchQuizConceptData(conceptId: number): Promise<QuizConceptData> {
  const res = await api.get<QuizConceptData>("/api/quiz/concept-data", {
    params: { conceptId },
  });
  console.log("[quiz] concept-data 응답:", JSON.stringify(res.data, null, 2));
  return res.data;
}
