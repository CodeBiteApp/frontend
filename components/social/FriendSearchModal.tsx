import FriendSearchScreen from "@/app/(social)/friend-search";
import { Modal, StyleSheet, TouchableOpacity, View } from "react-native";

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function FriendSearchModal({ visible, onClose }: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={onClose}
      />
      <View style={styles.sheet}>
        <FriendSearchScreen onClose={onClose} />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    position: "absolute",
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  sheet: {
    position: "absolute",
    top: 120,
    bottom: 120,
    left: 30,
    right: 30,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#191A1C",
  },
});
