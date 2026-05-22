구현 계획: User 조회 + 헤더 Streak/Dotori 반영
현재 문제점
항목 현재 문제
UserInfoBar streak user?.currentStreak 퀴즈 완료 후 store가 갱신 안 됨
UserInfoBar acornCount completedStages.length (로컬) 서버의 실제 user.dotori와 무관
useUserStore.ts:123 const { user, position, streak } streak은 fetchUserWithSession 반환값에 없음 → TS 에러
변경 파일 3개

1. store/useUserStore.ts — 버그 수정
   line 123: fetchUserWithSession 반환값에 없는 streak 제거

// before
const { user, position, streak } = await fetchUserWithSession();

// after
const { user, position } = await fetchUserWithSession(); 2. app/quiz/[id].tsx — submit 후 User 갱신
퀴즈 완료 → submit-result 성공 → refreshUser() 호출하여 store의 currentStreak·dotori 최신화

// useEffect([isFinished]) 내부
submitQuizResult({ ... })
.then(async (result) => {
setServerResult(result);
await refreshUser(); // ← 추가: store 갱신
})
.catch(console.error)
.finally(() => setIsSubmitting(false));
useUserStore에서 refreshUser 구독 추가.

3. app/(tabs)/index.tsx — 헤더 데이터 수정
   ① acornCount → user.dotori

// before
const acornCount = completedStages.length;

// after
const acornCount = user?.dotori ?? 0;
② 홈 포커스 시 refreshUser

퀴즈 → 홈 복귀 시 항상 최신값을 보여주기 위한 안전망

const { position, user, refreshUser } = useUserStore();

// 기존 useFocusEffect(justCompletedStageId) 와 별도로 추가
useFocusEffect(
useCallback(() => {
refreshUser();
}, [refreshUser]),
);
데이터 흐름 (변경 후)

퀴즈 완료
→ submitQuizResult()
→ refreshUser() → GET /api/users/me
→ store.user 갱신 (currentStreak, dotori 최신값)
→ 홈으로 복귀 시 UserInfoBar에 즉시 반영
🔥 streak = user.currentStreak ✅ 서버값
🌰 dotori = user.dotori ✅ 서버값

---

StreakRewardService 보상 로직 정리
상수
상수 값 의미
QUIZ_COMPLETION_DOTORI 10 퀴즈 완료 기본 도토리
DAILY_CHECKIN_BONUS 5 일일 첫 체크인 보너스
타임존 Asia/Seoul 날짜 경계 기준
보상 지급 흐름 (grantQuizCompletionReward)

submitResult 호출
│
├─ valid=false OR isCompleted=false
│ → dotoriEarned: 0 / alreadyCheckedIn: false (skipped, 변경 없음)
│
└─ valid=true AND isCompleted=true
│
├─ lastStudy == 오늘 (서울 시간 기준)
│ → dotoriEarned: 0 / alreadyCheckedIn: true (멱등, 변경 없음)
│
└─ lastStudy != 오늘
→ dotoriEarned: 15 (10 + 5)
→ alreadyCheckedIn: false
→ streak 재계산 후 user 업데이트
스트릭 재계산 (calculateNewStreak)
마지막 학습 날짜 조건 결과
null (첫 학습) — streak = 1
어제 (today - 1) — streak = currentStreak + 1
그제 (today - 2) protector > 0 streak 유지, protector 1 소모
그 외 (공백 2일 이상) — streak = 1 (리셋)
submit-result 응답 필드 매핑
필드 보상 지급 이미 체크인 스킵
dotoriEarned 15 0 0
alreadyCheckedIn false true false
currentStreak 갱신값 현재값 현재값
longestStreak 갱신값 현재값 현재값
bonusEarned 5 0 0
한 줄 요약
오늘 처음 퀴즈를 완료하면 도토리 15개 + streak +1 (어제 학습 기준). 같은 날 두 번째 호출은 보상 없이 현재 상태만 반환.
