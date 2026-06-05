import type { AppAlertButton } from "@/components/common/ConfirmModal";
import { useCallback, useState } from "react";

type AlertConfig = {
  title: string;
  message?: string;
  buttons: AppAlertButton[];
} | null;

export function useAppAlert() {
  const [config, setConfig] = useState<AlertConfig>(null);

  const show = useCallback(
    (title: string, message?: string, buttons?: AppAlertButton[]) => {
      setConfig({ title, message, buttons: buttons ?? [{ text: "확인" }] });
    },
    [],
  );

  const hide = useCallback(() => setConfig(null), []);

  return { show, hide, config, isVisible: config !== null };
}
