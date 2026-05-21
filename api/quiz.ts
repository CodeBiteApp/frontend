import api from "@/api/axios";
import { QuizConceptData, SubmitResultRequest, SubmitResultResponse } from "@/types/quiz";

export async function fetchQuizConceptData(conceptId: number): Promise<QuizConceptData> {
  const res = await api.get<QuizConceptData>("/api/quiz/concept-data", {
    params: { conceptId },
  });
  console.log("[quiz] concept-data 응답:", JSON.stringify(res.data, null, 2));
  return res.data;
}

export async function submitQuizResult(
  body: SubmitResultRequest,
): Promise<SubmitResultResponse> {
  const res = await api.post<SubmitResultResponse>("/api/quiz/submit-result", body);
  return res.data;
}
