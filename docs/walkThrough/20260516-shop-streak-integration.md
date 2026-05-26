# 상점 및 스트릭 백엔드 연동 가이드

이 문서는 프론트엔드에 상점(Shop) 및 스트릭(Streak) 백엔드 API를 연동한 상세 내역을 기록합니다.

## 1. 개요
기존에 하드코딩된 데이터(Mock)로 구현되어 있던 상점 및 스트릭 UI를 실제 백엔드 API와 연결하고, 도메인 모델에 맞게 데이터 구조를 최적화했습니다.

## 2. 주요 변경 사항

### 2.1 타입 및 API 정의
- **`types/auth.ts`**: `User` 타입의 `cookie` 필드를 `dotori`로 변경하고, `AuthResponse`가 `UserSummary` 대신 전체 `User` 정보를 포함하도록 수정했습니다.
- **`api/items.ts`**: 상점 아이템 조회, 구매, 인벤토리, 장착 API 추가.
- **`api/streak.ts`**: 스트릭 상태 조회 API 추가.
- **`api/users.ts`**: `getMe` API가 풍부한 정보를 담은 `User` 타입을 반환하도록 수정.

### 2.2 상태 관리 (Zustand Store)
- **`useUserStore`**: 
    - `streak` 개별 상태를 제거하고 `user.currentStreak`를 직접 사용하도록 통합.
    - `refreshUser()` 메서드를 추가하여 구매 등 이벤트 발생 시 최신 정보를 서버에서 동기화할 수 있게 함.
- **`useItemStore` (신규)**:
    - `shopItems`, `inventory`, `protectorCount` 등을 관리.
    - `buyItem`, `toggleEquip` 등 비즈니스 로직 캡슐화.

### 2.3 UI 매핑 및 연동
- **`constants/itemAssets.ts` (신규)**: 백엔드의 아이템 타입(PROTECTOR, BANNER 등)을 프론트엔드 UI 에셋(이모지, 제목, 설명)과 연결하는 매핑 테이블.
- **`reward.tsx` (상점)**: `useItemStore`와 연동하여 실시간 아이템 목록 및 구매 로직 구현.
- **`settings.tsx` (설정)**: `user.dotori`, `user.currentStreak` 등을 활용하여 실제 지표 노출.
- **`index.tsx` (메인)**: 상단 헤더 스트릭 정보를 실제 서버 데이터와 동기화.

## 3. 사용 가이드

### 아이템 구매 흐름
1. `useItemStore`의 `fetchShopItems()` 호출로 목록 로드.
2. `buyItem(itemId)` 호출 시 백엔드 구매 API 실행.
3. 구매 성공 시 내부적으로 `useUserStore.refreshUser()`를 실행하여 재화(도토리) 잔액 자동 갱신.

### 스트릭 데이터 참조
- 앱 어디서든 `useUserStore`의 `user.currentStreak`를 참조하면 항상 최신 서버 데이터 기반의 스트릭을 확인할 수 있습니다.

---
**작성일**: 2026-05-16
**관련 브랜치**: `feature/shin-store`
