import api from "@/api/axios";
import { ConceptStage, QuizConceptData, Subject, SubmitResultRequest, SubmitResultResponse } from "@/types/quiz";

export async function fetchSubjects(): Promise<Subject[]> {
  const res = await api.get<Subject[]>("/api/subjects");
  return res.data;
}

export async function fetchConceptsBySubject(subjectId: number): Promise<ConceptStage[]> {
  const res = await api.get<ConceptStage[]>(`/api/subjects/${subjectId}/concepts`);
  return res.data;
}

export async function fetchQuizConceptData(conceptId: number): Promise<QuizConceptData> {
  const res = await api.get<QuizConceptData>("/api/quiz/concept-data", {
    params: { conceptId },
  });
  return res.data;
}

export async function submitQuizResult(
  body: SubmitResultRequest,
): Promise<SubmitResultResponse> {
  const res = await api.post<SubmitResultResponse>("/api/quiz/submit-result", body);
  return res.data;
}
