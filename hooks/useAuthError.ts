import { ALERT_TITLES, AUTH_MESSAGES } from "@/constants/messages";
import axios from "axios";
import { Alert } from "react-native";

export function useAuthError() {
  const handleSignupError = (error: unknown) => {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const serverMessage: string | undefined = error.response?.data?.message;
      console.log("[signup] Axios 에러 status:", status, "data:", JSON.stringify(error.response?.data));

      if (!error.response) {
        Alert.alert(ALERT_TITLES.networkError, AUTH_MESSAGES.signup.networkError);
      } else if (status === 409) {
        Alert.alert(ALERT_TITLES.signupFailed, AUTH_MESSAGES.signup.duplicateEmail);
      } else if (status === 400) {
        Alert.alert(ALERT_TITLES.signupFailed, serverMessage ?? AUTH_MESSAGES.signup.invalidInput);
      } else if (status === 500) {
        Alert.alert(ALERT_TITLES.serverError, AUTH_MESSAGES.signup.serverError);
      } else {
        Alert.alert(ALERT_TITLES.signupFailed, `[${status}] ${serverMessage ?? AUTH_MESSAGES.signup.fallback}`);
      }
    } else {
      const msg = error instanceof Error ? error.message : String(error);
      console.log("[signup] 비Axios 에러:", msg);
      Alert.alert(ALERT_TITLES.signupFailed, msg);
    }
  };

  return { handleSignupError };
}
