구현 계획: Quiz 보상 연동
변경 파일 6개

1. types/quiz.ts — 타입 추가

// 추가
export type UserAnswer = {
questionNumber: number;
quizType: "MULTIPLE_CASE" | "OX" | "SHORT_ANSWER" | "MATCHING";
answer: number | boolean | string | Record<string, number>;
};

export type SubmitResultRequest = {
conceptId: number;
randomSeed: number;
isCompleted: boolean;
userAnswers: UserAnswer[];
};

export type SubmitResultResponse = {
valid: boolean;
score: number;
correctCount: number;
totalCount: number;
dotoriEarned: number;
streak: {
alreadyCheckedIn: boolean;
currentStreak: number;
longestStreak: number;
bonusEarned: number;
studyHistory: unknown[];
};
}; 2. api/quiz.ts — 함수 추가

export async function submitQuizResult(
body: SubmitResultRequest
): Promise<SubmitResultResponse> {
const res = await api.post<SubmitResultResponse>("/api/quiz/submit-result", body);
return res.data;
} 3. store/useQuizStore.ts — 상태 확장
추가 상태:

conceptId: number | null
randomSeed: number | null
userAnswers: UserAnswer[]
추가 액션:

setConceptMeta(conceptId, randomSeed) — concept-data 받을 때 저장
recordAnswer(questionNumber, quizType, answer) — 정답/오답 관계없이 실제 선택값 누적
resetQuiz()에서 이 세 상태 초기화 포함.

4. app/quiz/[id].tsx — 핵심 연결
   변경 포인트:

위치 변경 내용
fetchQuizConceptData.then setConceptMeta(data.conceptId, data.randomSeed) 호출
useEffect([isFinished]) isFinished 전환 시 submitQuizResult() 호출 → serverResult 로컬 state에 저장
renderOptions onRecord 콜백 추가 — 일반 모드에서만 recordAnswer() 호출 (retry 시 no-op)
MultipleChoice onSelect={(i) => { onRecord(i); onMark(...) }}
OX onSelect={(v) => { onRecord(v); onMark(...) }}
ShortAnswer onSubmit={(text, correct) => { onRecord(text); onMark(correct) }}
Matching onComplete={(pairs) => { onRecord(pairs); onMark(...) }}
isFinished && isSubmitting 로딩 인디케이터 렌더
ResultScreen score={serverResult.score}, dotoriEarned={serverResult.dotoriEarned} prop 전달
StreakScreen serverStreak={serverResult.streak} prop 전달 5. components/quiz/result-screen.tsx — 서버 데이터 반영
Props에 score?: number, dotoriEarned?: number 추가.

획득 포인트: dotoriEarned ?? correct \* 10
점수 행 추가: score가 있으면 {score}점 표시 6. components/quiz/streak-screen.tsx — 서버 데이터 반영
Props에 serverStreak?: { currentStreak, bonusEarned, alreadyCheckedIn } 추가.

streakDays → serverStreak?.currentStreak ?? streakDays
alreadyCheckedIn: true면 "오늘 이미 획득" 안내 문구 표시
타이밍 흐름

마지막 문제 완료
→ finishQuiz() / nextRetryQuestion() → isFinished = true
→ useEffect 발화 → submitQuizResult() 호출 (isSubmitting = true)
→ [로딩 화면]
→ 응답 도착 → serverResult 저장, isSubmitting = false
→ ResultScreen (score, dotoriEarned 반영)
→ StreakScreen (currentStreak 반영)
→ QuestRewardScreen (유지)
주의 사항
retry 답변은 기록 안 함 — recordAnswer는 일반 모드 onRecord에서만 호출
Matching answer: Record<number, number> → Record<string, number> 변환 필요 (Object.fromEntries(Object.entries(pairs)))
submit 실패 시: serverResult = null → 기존 로컬 계산값으로 폴백 (에러 핸들링은 console.error만)
isCompleted: 항상 true (retry 포함 전체 플로우가 끝난 후 호출)
