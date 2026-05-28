import api from "@/api/axios";
import {
  ConceptStage,
  QuizConceptData,
  Subject,
  SubjectPage,
  SubmitResultRequest,
  SubmitResultResponse,
} from "@/types/quiz";

export async function fetchSubjects(page = 0, size = 20): Promise<SubjectPage> {
  const res = await api.get<SubjectPage | Subject[]>("/api/subjects", {
    params: { page, size },
  });
  //console.log("[quiz/fetchSubjects] page:", page, "응답:", JSON.stringify(res.data, null, 2));
  if (Array.isArray(res.data)) {
    return { content: res.data, hasNext: false };
  }
  return res.data;
}

export async function fetchConceptsBySubject(
  subjectId: number,
): Promise<ConceptStage[]> {
  const res = await api.get<ConceptStage[]>(
    `/api/subjects/${subjectId}/concepts`,
  );
  // console.log(
  //   `[quiz/fetchConceptsBySubject] subjectId=${subjectId} 개념 수: ${res.data.length}`,
  //   "\n첫 3개:", JSON.stringify(res.data.slice(0, 3), null, 2),
  // );
  return res.data;
}

export async function fetchQuizConceptData(
  conceptId: number,
): Promise<QuizConceptData> {
  const res = await api.get<QuizConceptData>("/api/quiz/concept-data", {
    params: { conceptId },
  });
  // console.log(
  //   "[quiz/fetchQuizConceptData] 응답:",
  //   JSON.stringify(res.data, null, 2),
  // );
  return res.data;
}

export async function submitQuizResult(
  body: SubmitResultRequest,
): Promise<SubmitResultResponse> {
  const res = await api.post<SubmitResultResponse>(
    "/api/quiz/submit-result",
    body,
  );
  // console.log(
  //   "[quiz/submitQuizResult] 응답:",
  //   JSON.stringify(res.data, null, 2),
  // );
  return res.data;
}
