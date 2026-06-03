export const AUTH_MESSAGES = {
  login: {
    emptyFields: "이메일과 비밀번호를 입력해주세요.",
    failed: "이메일 또는 비밀번호를 확인해주세요.",
  },
  signup: {
    emptyFields: "모든 항목을 입력해주세요.",
    nicknameLength: "닉네임은 2~20자여야 합니다.",
    passwordMismatch: "비밀번호가 일치하지 않습니다.",
    passwordPattern:
      "비밀번호는 8자 이상이며 영문, 숫자, 특수문자를 모두 포함해야 합니다.",
    duplicateEmail: "이미 사용 중인 이메일입니다.",
    invalidInput: "입력 값을 확인해주세요.",
    serverError: "서버에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.",
    networkError: "서버에 연결할 수 없습니다. 네트워크를 확인해주세요.",
    fallback: "잠시 후 다시 시도해주세요.",
  },
} as const;

export const ALERT_TITLES = {
  notice: "알림",
  loginFailed: "로그인 실패",
  signupFailed: "회원가입 실패",
  networkError: "연결 오류",
  serverError: "서버 오류",
} as const;
