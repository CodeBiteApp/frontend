구현 계획

현재 상태 파악
concept-data 응답에서 conceptId/randomSeed를 받지만 제출용으로 저장하지 않음
사용자 답변은 정오(boolean)만 기록 — 실제 값(선택 인덱스, 문자열 등)은 버림
결과 화면(dotori, streak)은 전부 로컬/목업 데이터
작업 목록 (4개 파일)

1. types/quiz.ts — 타입 추가

UserAnswer { questionNumber, quizType, answer }
SubmitResultRequest { conceptId, randomSeed, isCompleted, userAnswers }
SubmitResultResponse { valid, score, correctCount, totalCount, dotoriEarned, streak: {...} } 2. api/quiz.ts — API 함수 추가

submitQuizResult(body: SubmitResultRequest) → POST /api/quiz/submit-result 3. store/useQuizStore.ts — 상태 확장
conceptId, randomSeed 저장 (concept-data 받을 때)
userAnswers[] — 문제별 실제 답변 누적
serverResult — submit-result 응답 저장
setConceptMeta(), recordAnswer() 액션 추가 4. app/quiz/[id].tsx — 핵심 연결
fetchQuizConceptData 후 conceptId/randomSeed store에 저장
각 문제 타입 onAnswer 콜백에서 실제 답변값 함께 기록
MultipleChoice → 선택 인덱스 (number), quizType: MULTIPLE_CASE
OX → true/false, quizType: OX
ShortAnswer → 문자열, quizType: SHORT_ANSWER
Matching → {0:1, 1:0, ...} 객체, quizType: MATCHING
finishQuiz() 후 submitQuizResult 호출 (isCompleted: true)
응답을 결과 화면으로 전달 5. 결과 화면 3종 — props 교체
화면 현재 (로컬) 변경 후 (서버)
ResultScreen correct \* 10 포인트 score, dotoriEarned
StreakScreen completedStages.length streak.currentStreak, bonusEarned
QuestRewardScreen 하드코딩 목업 일단 유지 (범위 외)
처리 순서 주의사항
submit-result는 isFinished 전환 직전에 호출 (비동기 → await 또는 낙관적 처리)
alreadyCheckedIn: true면 dotori 0, UI에서 "이미 오늘 획득" 처리
재풀이 미구현이면 항상 isCompleted: true로 전송
이 계획대로 진행할까요? 재풀이(retry) 플로우 유무나 로딩 처리 방식 등 결정이 필요한 부분 있으면 말씀해 주세요.

[07]Quiz-reward.md 참고
