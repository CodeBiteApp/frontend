# CodeBite 프로젝트 실행 가이드

## 사전 요구사항

| 항목 | 버전 |
|------|------|
| Node.js | 18 이상 |
| Yarn | 최신 버전 |
| Expo Go (모바일) | App Store / Google Play |

> **패키지 매니저**: 이 프로젝트는 반드시 `yarn`을 사용합니다. `npm install`은 사용하지 마세요.

---

## 1. 의존성 설치

```bash
yarn install
```

---

## 2. 앱 실행

### 기본 실행 (QR 코드 제공)

```bash
yarn start
```

터미널에 QR 코드가 출력됩니다. **Expo Go 앱**으로 스캔하면 실기기에서 바로 실행됩니다.

### 플랫폼별 실행

```bash
# Android 에뮬레이터
yarn android

# iOS 시뮬레이터 (macOS 전용)
yarn ios

# 웹 브라우저
yarn web
```

---

## 3. Expo Go로 실기기에서 테스트

1. 스마트폰에 **Expo Go** 앱 설치
   - [Android (Google Play)](https://play.google.com/store/apps/details?id=host.exp.exponent)
   - [iOS (App Store)](https://apps.apple.com/app/expo-go/id982107779)
2. 개발 PC와 스마트폰을 **같은 Wi-Fi**에 연결
3. `yarn start` 실행 후 QR 코드 스캔

---

## 4. 프로젝트 구조

```
knu-codebite/
├── app/                  # 화면 (파일 기반 라우팅)
│   ├── (auth)/           # 로그인/인증 관련 화면
│   ├── (onboarding)/     # 온보딩 화면
│   ├── (tabs)/           # 탭 네비게이션 화면
│   ├── quiz/             # 퀴즈 화면
│   └── _layout.tsx       # 루트 레이아웃
├── components/           # 공통 컴포넌트
├── constants/            # 상수 값
├── store/                # Zustand 상태 관리
├── types/                # TypeScript 타입 정의
├── assets/               # 이미지, 폰트 등 정적 파일
└── app.json              # Expo 설정
```

---

## 5. 주요 기술 스택

| 분류 | 기술 |
|------|------|
| 프레임워크 | React Native + Expo ~54 |
| 라우팅 | Expo Router ~6 |
| 상태 관리 | Zustand ^5 |
| 서버 상태 | TanStack Query ^5 |
| 애니메이션 | React Native Reanimated ~4, Lottie |
| 언어 | TypeScript ~5.9 |

---

## 6. 패키지 추가 방법

```bash
# 일반 패키지
yarn add <package-name>

# 개발 전용 패키지
yarn add -D <package-name>

# Expo 호환성이 필요한 패키지 (권장)
npx expo install <package-name>
```

> `package-lock.json`은 생성하거나 커밋하지 마세요.

---

## 7. 코드 검사

```bash
yarn lint
```

---

## 8. 자주 발생하는 문제

### Metro 캐시 초기화

```bash
yarn start --clear
```

### 의존성 재설치

```bash
rm -rf node_modules
yarn install
```

### 프로젝트 초기화 (스타터 코드 제거)

```bash
yarn reset-project
```
