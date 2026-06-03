import { ALERT_TITLES, AUTH_MESSAGES } from "@/constants/messages";
import axios from "axios";

type ShowFn = (title: string, message?: string) => void;

export function useAuthError() {
  const handleSignupError = (error: unknown, show: ShowFn) => {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const serverMessage: string | undefined = error.response?.data?.message;
      console.log("[signup] Axios 에러 status:", status, "data:", JSON.stringify(error.response?.data));

      if (!error.response) {
        show(ALERT_TITLES.networkError, AUTH_MESSAGES.signup.networkError);
      } else if (status === 409) {
        show(ALERT_TITLES.signupFailed, AUTH_MESSAGES.signup.duplicateEmail);
      } else if (status === 400) {
        show(ALERT_TITLES.signupFailed, serverMessage ?? AUTH_MESSAGES.signup.invalidInput);
      } else if (status === 500) {
        show(ALERT_TITLES.serverError, AUTH_MESSAGES.signup.serverError);
      } else {
        show(ALERT_TITLES.signupFailed, `[${status}] ${serverMessage ?? AUTH_MESSAGES.signup.fallback}`);
      }
    } else {
      const msg = error instanceof Error ? error.message : String(error);
      console.log("[signup] 비Axios 에러:", msg);
      show(ALERT_TITLES.signupFailed, msg);
    }
  };

  return { handleSignupError };
}
