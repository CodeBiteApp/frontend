import React from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export type AppAlertButton = {
  text: string;
  style?: "default" | "cancel" | "destructive";
  onPress?: () => void;
};

type Props = {
  visible: boolean;
  title: string;
  message?: string;
  buttons?: AppAlertButton[];
  onDismiss: () => void;
};

export function ConfirmModal({
  visible,
  title,
  message,
  buttons = [{ text: "확인" }],
  onDismiss,
}: Props) {
  const handlePress = (btn: AppAlertButton) => {
    onDismiss();
    btn.onPress?.();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onDismiss}
    >
      <Pressable style={styles.backdrop} onPress={onDismiss} />
      <View style={styles.center} pointerEvents="box-none">
        <View style={styles.card}>
          <View style={styles.body}>
            <Text style={styles.title}>{title}</Text>
            {message ? <Text style={styles.message}>{message}</Text> : null}
          </View>
          <View style={styles.divider} />
          <View style={styles.btnRow}>
            {buttons.map((btn, i) => (
              <React.Fragment key={i}>
                {i > 0 && <View style={styles.btnDivider} />}
                <TouchableOpacity
                  style={styles.btn}
                  onPress={() => handlePress(btn)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.btnText, btnColor(btn.style)]}>
                    {btn.text}
                  </Text>
                </TouchableOpacity>
              </React.Fragment>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
}

function btnColor(style?: AppAlertButton["style"]) {
  if (style === "destructive") return { color: "#FF4B4B", fontWeight: "700" as const };
  if (style === "cancel") return { color: "#888", fontWeight: "500" as const };
  return { color: "#58CC02", fontWeight: "700" as const };
}

const styles = StyleSheet.create({
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.65)",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    width: 300,
    backgroundColor: "#242628",
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#333537",
  },
  body: {
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 22,
    alignItems: "center",
    gap: 8,
  },
  title: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "800",
    textAlign: "center",
  },
  message: {
    color: "#aaa",
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    marginTop: 2,
  },
  divider: { height: 1, backgroundColor: "#333537" },
  btnRow: { flexDirection: "row" },
  btn: {
    flex: 1,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  btnDivider: { width: 1, backgroundColor: "#333537" },
  btnText: { fontSize: 16 },
});
