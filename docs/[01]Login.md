# 10 — 인증 · 유저 API

> **용도**: 인증(회원가입, 로그인, 소셜, 토큰 재발급, 로그아웃)과 유저 프로필 API를 상세히 정의한다.
> **우선순위**: Must Have (MVP)
> **관련 엔티티**: `Account`, `UserData`, `RefreshToken` → `04-domain-model.md`, `05-database-schema.md` 참고

---

## 1. 인증 아키텍처 개요

### 토큰 전략

| 토큰         | 용도               | 전달 방식                            | 만료 |
| ------------ | ------------------ | ------------------------------------ | ---- |
| accessToken  | API 인증           | `Authorization: Bearer {token}` 헤더 | 25분 |
| refreshToken | accessToken 재발급 | `HttpOnly + Secure + SameSite` 쿠키  | 30일 |

### 핵심 정책

1. **refreshToken은 Body/LocalStorage에 저장 금지** — HttpOnly 쿠키 전용
2. **accessToken 발급마다 refreshToken rotation 강제** — 신규 로그인·재발급 모두 포함
3. **폐기된 refreshToken 재사용(reuse) 감지 시 전체 세션 강제 만료** — MVP 즉시 구현
4. **userId는 클라이언트 입력이 아닌 JWT(SecurityContext)에서 추출**
5. **서버는 refreshToken 원문 저장 금지** — SHA-256 해시만 DB 저장, `jti` 기준 상태 관리
6. **클라이언트 사전 갱신 권장** — 만료 5분 전 `POST /api/auth/refresh`, clock skew 30~60초 허용

### 인증 흐름 다이어그램

```
[클라이언트]                          [서버]
    │                                  │
    ├─ POST /api/auth/login ──────────▶│ 1. email+password 검증
    │                                  │ 2. accessToken + refreshToken 생성
    │◀── accessToken (JSON body) ──────│ 3. refreshToken → SHA-256 해시 DB 저장
    │◀── Set-Cookie: refreshToken ─────│ 4. 쿠키 반환
    │                                  │
    ├─ GET /api/users/me ─────────────▶│ 5. Bearer 헤더에서 JWT 파싱
    │  Authorization: Bearer {access}  │ 6. userId 추출 → 데이터 조회
    │◀── 프로필 JSON ─────────────────│
    │                                  │
    ├─ POST /api/auth/refresh ────────▶│ 7. 쿠키에서 refreshToken 파싱
    │  Cookie: refreshToken=...        │ 8. jti 조회 → revoked 여부 확인
    │                                  │ 9. 기존 토큰 폐기 + 새 토큰 발급
    │◀── 새 accessToken + 새 쿠키 ────│
```

---

## 2. API 상세 명세

### 2.1 회원가입

**POST** `/api/auth/register`

- **설명**: 이메일 기반 신규 계정 생성
- **인증**: 불필요
- **구현 상태**: ✅ 구현 완료

#### Request

```json
{
  "email": "user@example.com",
  "password": "P@ssw0rd!",
  "nickname": "codebiter"
}
```

#### 유효성 검증

| 필드       | 규칙                              | 에러                            |
| ---------- | --------------------------------- | ------------------------------- |
| `email`    | 이메일 형식, 중복 불가            | `409 AUTH_EMAIL_ALREADY_EXISTS` |
| `password` | 8자 이상, 영문+숫자+특수문자 조합 | `400 BAD_REQUEST`               |
| `nickname` | 2~20자, 공백만으로 구성 불가      | `400 BAD_REQUEST`               |

#### 처리 흐름

1. 이메일 중복 확인 (`Account` 테이블 조회)
2. 비밀번호 BCrypt 해시
3. `UserData` 생성 → `Account(provider=LOCAL)` 생성
4. accessToken + refreshToken 발급 (rotation 수행)
5. refreshToken SHA-256 해시 DB 저장

#### Response — 201 Created

```json
{
  "accessToken": "<jwt-access-token>",
  "tokenType": "Bearer",
  "expiresIn": 1500,
  "user": {
    "id": 1,
    "email": "user@example.com",
    "nickname": "codebiter"
  }
}
```

**헤더:** `Set-Cookie: refreshToken=...; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=2592000`

#### 에러

| 상태 | 코드                        | 설명               |
| ---- | --------------------------- | ------------------ |
| 409  | `AUTH_EMAIL_ALREADY_EXISTS` | 이미 가입된 이메일 |
| 400  | `VALIDATION_ERROR`          | 입력값 형식 오류   |

---

### 2.2 이메일 로그인

**POST** `/api/auth/login`

- **설명**: 로컬 계정 인증
- **인증**: 불필요
- **구현 상태**: ✅ 구현 완료

#### Request

```json
{
  "email": "user@example.com",
  "password": "P@ssw0rd!"
}
```

#### 유효성 검증

| 필드       | 규칙                  |
| ---------- | --------------------- |
| `email`    | `@Email`, `@NotBlank` |
| `password` | `@NotBlank`           |

#### 처리 흐름 (현재 구현 기준)

1. `AccountRepository.findByProviderAndProviderUserId("LOCAL", email)` 조회
2. 계정 없음 → `401 AUTH_INVALID_CREDENTIALS`
3. `BCryptPasswordEncoder.matches(password, account.passwordHash)` 검증
4. 불일치 → `401 AUTH_INVALID_CREDENTIALS`
5. `JwtTokenProvider.createAccessToken(userId, email)` — accessToken 생성
6. `JwtTokenProvider.createRefreshToken(jti, userId)` — refreshToken 생성
7. refreshToken → `HashUtils.sha256(token)` → `RefreshToken` 엔티티 DB 저장
8. `LoginResult(authResponse, refreshToken, expirySeconds)` 반환
9. 컨트롤러: accessToken JSON + refreshToken HttpOnly 쿠키 응답

#### Response — 200 OK

```json
{
  "accessToken": "<jwt-access-token>",
  "tokenType": "Bearer",
  "expiresIn": 1500,
  "user": {
    "id": 1,
    "email": "user@example.com",
    "nickname": "codebiter"
  }
}
```

**헤더:** `Set-Cookie: refreshToken=...; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=2592000`

#### 에러

| 상태 | 코드                       | 설명                       |
| ---- | -------------------------- | -------------------------- |
| 401  | `AUTH_INVALID_CREDENTIALS` | 이메일/비밀번호 불일치     |
| 400  | `VALIDATION_ERROR`         | 입력값 누락                |
| 423  | `AUTH_ACCOUNT_LOCKED`      | (선택) 연속 실패 임시 잠금 |

---

### 2.3 소셜 로그인

**POST** `/api/auth/oauth/{provider}`

- **설명**: OAuth 콜백 결과로 사용자 인증 후 JWT 발급
- **Path 변수**: `provider` = `kakao` | `github` | `google`
- **인증**: 불필요
- **구현 상태**: 미구현 (Should Have)

#### Request — Authorization Code 방식

```json
{
  "code": "oauth_authorization_code",
  "redirectUri": "codebite://oauth/callback"
}
```

#### Request — ID Token 방식 (Google Sign-In SDK)

```json
{
  "idToken": "eyJhbGciOiJSUzI1NiIs..."
}
```

#### 처리 흐름

1. **provider 유효성 검사** — `Provider` enum에 없는 값 → `400 AUTH_PROVIDER_NOT_SUPPORTED`
2. **Authorization Code 교환** — `code` + `redirectUri`로 provider 서버에 access token 요청 (PKCE 시 `codeVerifier` 함께)
3. **provider 사용자 정보 조회** — 발급받은 access token으로 provider 프로필 API 호출 → `provider_user_id` + 이메일 추출
4. **계정 조회/생성** — `(provider, provider_user_id)` 기준 `Account` 조회
   - 있음 → 기존 유저로 로그인
   - 없음 → `UserData` + `Account` 자동 생성 (닉네임은 provider 프로필에서 추출)
5. **JWT 발급** — accessToken + refreshToken rotation

> `idToken` 방식의 경우 2~3단계 대신 provider 공개키로 JWT 서명 검증 후 `sub` 클레임을 `provider_user_id`로 사용

#### Response — 200 OK

```json
{
  "accessToken": "<jwt-access-token>",
  "tokenType": "Bearer",
  "expiresIn": 1500,
  "user": {
    "id": 1,
    "email": "user@example.com",
    "nickname": "codebiter"
  }
}
```

#### 에러

| 상태 | 코드                             | 설명                            |
| ---- | -------------------------------- | ------------------------------- |
| 400  | `AUTH_PROVIDER_NOT_SUPPORTED`    | 지원하지 않는 provider          |
| 401  | `AUTH_OAUTH_EXCHANGE_FAILED`     | provider access token 교환 실패 |
| 401  | `AUTH_OAUTH_VERIFICATION_FAILED` | idToken 서명 검증 실패          |

---

### 2.4 토큰 재발급

**POST** `/api/auth/refresh`

- **설명**: refreshToken 쿠키로 accessToken 재발급
- **인증**: 쿠키 기반 (refreshToken 필수)
- **구현 상태**: ✅ 구현 완료

#### Request

Body 없음. refreshToken 쿠키만으로 처리.

#### 처리 흐름

1. 쿠키에서 refreshToken 파싱 → JWT 디코딩 → `jti` 추출
2. `RefreshToken` 테이블에서 `jti` 조회
   - 레코드 없음 → `401 AUTH_INVALID_TOKEN`
   - `revoked=true` → **reuse detection**: 해당 `user_id`의 모든 RefreshToken `revoked=true` + `403 AUTH_REFRESH_REUSE_DETECTED`
3. `HashUtils.sha256(refreshToken)` 과 DB `tokenHash` 비교 → 불일치 → `401`
4. `expiresAt` 검증 → 만료 → `401`
5. 기존 RefreshToken `revoked=true` 폐기
6. 새 refreshToken 생성 + 해시 DB 저장
7. 새 accessToken 생성
8. 새 refreshToken `Set-Cookie` + 새 accessToken JSON 반환

#### Response — 200 OK

```json
{
  "accessToken": "<new-access-token>",
  "tokenType": "Bearer",
  "expiresIn": 1500
}
```

**헤더:** `Set-Cookie: refreshToken=<new-token>; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=2592000`

#### 에러

| 상태 | 코드                          | 설명                                |
| ---- | ----------------------------- | ----------------------------------- |
| 401  | `AUTH_INVALID_TOKEN`          | refreshToken 없음/만료/위조         |
| 403  | `AUTH_REFRESH_REUSE_DETECTED` | 폐기된 토큰 재사용 → 전체 세션 만료 |

---

### 2.5 로그아웃

**POST** `/api/auth/logout`

- **설명**: 현재 세션의 refreshToken 폐기 + 쿠키 삭제
- **인증**: refreshToken 쿠키 또는 accessToken
- **구현 상태**: ✅ 구현 완료

#### Request

Body 없음.

#### 처리 흐름

1. 쿠키 또는 Authorization 헤더에서 토큰 파싱
2. `jti` 기반으로 `RefreshToken` 조회 → `revoked=true`
3. `Set-Cookie: refreshToken=; Max-Age=0` 로 쿠키 만료 처리

#### Response — 200 OK

```json
{
  "success": true
}
```

---

## 3. 유저 프로필 API

### 3.1 내 정보 조회

**GET** `/api/users/me`

- **설명**: 로그인 사용자 상세 정보 조회
- **인증**: accessToken 필수
- **구현 상태**: ✅ 구현 완료

#### Request

Body 없음. Authorization 헤더의 accessToken으로 userId 추출.

#### Response — 200 OK

```json
{
  "id": 1,
  "email": "user@example.com",
  "nickname": "codebiter",
  "profileImageUrl": null,
  "currentStreak": 3,
  "longestStreak": 10,
  "cookie": 120,
  "protector": 2,
  "equippedBanner": null,
  "studiedConceptCount": 34,
  "followingCount": 15,
  "followerCount": 8
}
```

> 팔로우 정보는 목록이 아닌 count만 반환. 목록은 `14-social-ranking-roadmap.md`의 팔로우 API 참고.

---

### 3.2 내 정보 수정

**PUT** `/api/users/me`

- **설명**: 닉네임 수정
- **인증**: accessToken 필수
- **구현 상태**: ✅ 구현 완료

#### Request

```json
{
  "nickname": "new-nickname"
}
```

#### 유효성 검증

| 필드       | 규칙                         |
| ---------- | ---------------------------- |
| `nickname` | 2~20자, 공백만으로 구성 불가 |

#### Response — 200 OK

```json
{
  "id": 1,
  "nickname": "new-nickname",
  "currentStreak": 3,
  "longestStreak": 10,
  "cookie": 120,
  "protector": 2,
  "equippedBanner": null,
  "studiedConceptCount": 34,
  "followingCount": 15,
  "followerCount": 8
}
```

---

## 4. 공통 에러 포맷

모든 인증 관련 에러는 아래 형식으로 반환한다.

```json
{
  "timestamp": "2026-04-02T10:15:30Z",
  "status": 401,
  "code": "AUTH_INVALID_TOKEN",
  "message": "유효하지 않은 토큰입니다.",
  "path": "/api/auth/refresh"
}
```

### 에러 코드 목록

| 코드                          | HTTP 상태 | 설명                         |
| ----------------------------- | --------- | ---------------------------- |
| `AUTH_INVALID_CREDENTIALS`    | 401       | 이메일/비밀번호 불일치       |
| `AUTH_EMAIL_ALREADY_EXISTS`   | 409       | 이미 가입된 이메일           |
| `AUTH_INVALID_TOKEN`          | 401       | 토큰 없음/만료/위조          |
| `AUTH_REFRESH_REUSE_DETECTED` | 403       | refreshToken 재사용 감지     |
| `AUTH_PROVIDER_NOT_SUPPORTED` | 400       | 지원하지 않는 OAuth provider |
| `AUTH_OAUTH_EXCHANGE_FAILED`  | 401       | OAuth code 교환 실패         |
| `AUTH_ACCOUNT_LOCKED`         | 423       | 계정 임시 잠금 (선택)        |
| `VALIDATION_ERROR`            | 400       | 입력값 검증 실패             |

---

## 5. 보안/운영 체크리스트

- [ ] HTTPS 강제 (`Secure` 쿠키 전제)
- [ ] CORS에서 쿠키 포함 요청 허용 (`withCredentials`) 구성
- [x] JWT 검증 필터 (`JwtAuthenticationFilter`) 구현 → `anyRequest().permitAll()` 제거
- [ ] 비밀번호 해시 강도 주기 점검 (BCrypt rounds 10~12)
- [ ] 로그인 실패 횟수 제한/지연 처리 (브루트포스 완화)
- [ ] refreshToken 만료 정리 배치 작업
- [ ] accessToken에 민감 정보 포함 금지 (userId, email, role만)

---

## 6. 테스트 시나리오

| #   | 시나리오                         | 기대 결과                             |
| --- | -------------------------------- | ------------------------------------- |
| 1   | 정상 회원가입                    | 201 + accessToken + refreshToken 쿠키 |
| 2   | 중복 이메일 회원가입             | 409 `AUTH_EMAIL_ALREADY_EXISTS`       |
| 3   | 정상 로그인                      | 200 + accessToken + refreshToken 쿠키 |
| 4   | 잘못된 비밀번호 로그인           | 401 `AUTH_INVALID_CREDENTIALS`        |
| 5   | accessToken 만료 후 refresh 성공 | 200 + 새 accessToken + 새 쿠키        |
| 6   | 로그아웃 후 refresh 재사용       | 실패 (401 또는 403)                   |
| 7   | 폐기된 refreshToken 재사용       | 403 + 해당 user 전체 세션 만료        |
| 8   | 소셜 로그인 신규 사용자          | 자동 가입 + 200                       |
| 9   | 소셜 로그인 기존 사용자          | 로그인 + 200                          |
| 10  | 지원하지 않는 provider           | 400 `AUTH_PROVIDER_NOT_SUPPORTED`     |
| 11  | 내 정보 조회 (유효 토큰)         | 200 + 프로필 JSON                     |
| 12  | 내 정보 조회 (만료 토큰)         | 401                                   |
| 13  | 닉네임 수정                      | 200 + 수정된 프로필                   |
