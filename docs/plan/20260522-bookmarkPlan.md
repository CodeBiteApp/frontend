# 프론트엔드 북마크(Bookmark) 구현 계획

이 계획서는 백엔드 북마크 명세 및 구현 계획(`12-bookmark-plan.md`)을 바탕으로, **프론트엔드(React Native / Expo) 북마크 기능**을 프리미엄 디자인과 안정적인 데이터 상태 관리로 구현하기 위한 상세 아키텍처 및 작업 목록입니다.

북마크 아이콘은 홈 화면 상단 정보 바(`UserInfoBar`)의 **스트릭(🔥) 왼쪽에 배치**하며, 이를 클릭하면 **북마크 목록 화면(`app/bookmark.tsx`)**으로 이동합니다. 또한 학습을 완료한 직후 즉시 북마크할 수 있도록 **퀴즈 결과 화면(`ResultScreen`)**에도 북마크 연동 버튼을 추가합니다.

---

## User Review Required

> [!IMPORTANT]
> 1. **과목 필터링 칩(Chip)의 데이터 원천**:
>    - `GET /api/bookmarks` 응답 DTO에서 각 북마크 아이템은 `subjectName` 필드를 포함하고 있습니다.
>    - 별도로 과목 목록 API를 호출하는 대신, **조회한 전체 북마크 목록에서 고유한 `subjectName`들을 추출하여 동적으로 필터 칩을 생성**하는 방식을 제안합니다. 이는 추가 API 호출을 줄이고 항상 일치하는 과목들만 필터 칩으로 노출시켜 깔끔한 UX를 제공합니다. 이에 동의하시는지 확인 바랍니다.
> 
> 2. **북마크 터치 시 동작**:
>    - 북마크 목록에서 개념 카드를 터치하면, 해당 개념의 퀴즈 스테이지(`/quiz/${conceptId}`)로 **즉시 이동하여 학습을 시작**하도록 연결할 계획입니다. (북마크는 이미 학습을 완료한 개념만 가능하므로 복습 용도로 즉각적인 진입이 가능합니다.)
> 
> 3. **햅틱(Haptic) 피드백 적용**:
>    - 북마크 등록/해제 토글 시 사용자에게 리치한 반응을 주기 위해 `expo-haptics`를 사용해 가벼운 진동 효과를 주어 프리미엄 감성을 극대화합니다.

---

## Proposed Changes

### 1. API 레이어 (frontend/api)

#### [NEW] [bookmark.ts](file:///d:/project/codeBite/frontend/api/bookmark.ts)
- 백엔드 북마크 엔드포인트 연동을 위한 API 클라이언트 함수 정의.
- **주요 함수**:
  - `fetchBookmarks(subjectId?: number)`: 북마크 목록 조회 (`GET /api/bookmarks`)
  - `addBookmark(conceptId: number)`: 북마크 등록 (`POST /api/bookmarks/${conceptId}`)
  - `removeBookmark(conceptId: number)`: 북마크 해제 (`DELETE /api/bookmarks/${conceptId}`)

---

### 2. UI 및 네비게이션 계층 (frontend/app, frontend/components)

#### [MODIFY] [UserInfoBar.tsx](file:///d:/project/codeBite/frontend/components/home/UserInfoBar.tsx)
- 상단 사용자 정보 바의 `statsGroup` 내부에서 **스트릭(🔥)의 바로 왼쪽**에 북마크 버튼(🔖) 추가.
- 버튼 터치 시 `useRouter`를 사용해 `router.push("/bookmark")`로 이동 처리.
- 레이아웃 구성: `[🔖 북마크] [Divider] [🔥 스트릭] [Divider] [도토리]`
- 북마크 아이콘에 미세한 스케일 애니메이션 및 액티브 효과 부여.

#### [NEW] [bookmark.tsx](file:///d:/project/codeBite/frontend/app/bookmark.tsx)
- **북마크 상세 목록 화면** 신설.
- **주요 구성 요소**:
  - **헤더**: 뒤로가기 버튼(◀)과 "북마크한 개념" 타이틀을 배치하고 Premium Glassmorphism 스타일 적용.
  - **과목 필터**: 전체, Java, Spring 등의 과목 칩(Chip). 가로 스크롤을 지원하며, 선택 시 해당 과목의 북마크만 부드럽게 필터링(LayoutAnimation 적용).
  - **북마크 목록**: 북마크된 개념 리스트.
    - 각 카드는 `[과목 태그] [개념 제목]`과 우측 `[🔖 채워진 북마크 아이콘]`으로 구성.
    - 카드를 누르면 즉시 해당 개념 퀴즈(`/quiz/${conceptId}`)로 복습하러 이동.
    - 우측 북마크 아이콘을 터치하면 **낙관적 업데이트(Optimistic Update)**를 사용해 목록에서 카드가 페이드아웃되며 즉시 제거되도록 함.
  - **Empty State**: 북마크가 비었을 때 "아직 북마크한 개념이 없습니다. 학습 후 북마크해 보세요!" 문구와 함께 홈으로 돌아가는 은은한 그라데이션 버튼 노출.

#### [MODIFY] [result-screen.tsx](file:///d:/project/codeBite/frontend/components/quiz/result-screen.tsx)
- 퀴즈 완료 화면에 **북마크 토글 버튼** 추가.
- 방금 푼 퀴즈(학습 완료 상태이므로 100% 북마크 가능)를 그 자리에서 즉시 북마크에 추가하거나 해제할 수 있는 아이콘 제공.
- API 호출 시 즉각적인 햅틱 반응 및 Lottie/Scale 트랜지션 모션 제공.

---

### 3. 상태 관리 및 캐싱 계층 (TanStack Query)

- 북마크 상태는 화면 간(북마크 목록 화면, 퀴즈 결과 화면, 홈 화면 등)에 즉시 동기화되어야 하므로 **React Query(TanStack Query)** 캐시를 활용해 관리합니다.
- `useQuery(["bookmarks"])`로 목록을 캐싱하고, 추가/해제 시 `queryClient.invalidateQueries(["bookmarks"])`를 수행하거나 **낙관적 업데이트**를 통해 속도감 있는 토글 애니메이션을 보장합니다.

---

### 4. 로컬 및 Mocking 계층 (frontend/mocks)

#### [MODIFY] [index.ts](file:///d:/project/codeBite/frontend/mocks/index.ts)
- 백엔드 서버가 오프라인이거나 목(Mock) 실행 시에도 북마크 기능을 정상적으로 체험하고 테스트할 수 있도록 **가상 인메모리 데이터**를 사용한 API Mocking 추가.
- `/api/bookmarks` 호출 시 가상 배열 데이터 반환.
- `/api/bookmarks/{conceptId}` POST/DELETE 요청 시 가상 배열에 추가/삭제 처리 및 적절한 200 OK 응답 반환.

---

## Verification Plan

### Manual Verification

1. **상단 바 및 네비게이션 검증**:
   - 홈 화면 상단 `UserInfoBar`에서 스트릭 왼쪽에 북마크 아이콘(🔖)이 노출되는지 확인.
   - 아이콘 클릭 시 북마크 화면(`/bookmark`)으로 정상 이동하고 헤더 뒤로가기 클릭 시 홈으로 복귀하는지 검증.
2. **Empty State 및 필터 검증**:
   - 북마크가 하나도 없을 때의 Empty 화면(디자인, 그라데이션 버튼)이 예쁘게 나오는지 검증.
   - 퀴즈를 완료하여 학습된 개념을 북마크한 후, 과목 필터 칩(Java, Spring 등)이 동적으로 잘 렌더링되고 필터 터치 시 리스트가 올바르게 스위칭되는지 검증.
3. **토글 및 동기화 검증**:
   - 북마크 목록 화면에서 우측 🔖 아이콘 터치 시 낙관적 업데이트를 통해 카드가 즉시 제거되는지 확인.
   - 퀴즈 결과 화면(`ResultScreen`)에서 우측 상단 북마크 아이콘을 눌러 북마크를 토글하고, 홈으로 돌아가 북마크 목록에 반영되었는지 유기적 동기화 확인.
4. **Mock API 동작 검증**:
   - 백엔드 없이 프론트엔드 독립 실행 모드에서도 북마크 추가, 삭제, 목록 조회가 인메모리로 완벽하게 흘러가는지 검증.
