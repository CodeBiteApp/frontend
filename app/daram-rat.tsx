import { useRouter } from 'expo-router';
import LottieView from 'lottie-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function DaramRatScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Pressable style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backText}>← 뒤로</Text>
      </Pressable>

      <LottieView
        source={require('@/animation/DaramRat.json')}
        autoPlay
        loop
        style={styles.animation}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  backButton: {
    position: 'absolute',
    top: 56,
    left: 20,
    padding: 8,
  },
  backText: {
    fontSize: 16,
    color: '#333',
  },
  animation: {
    width: 200,
    height: 200,
  },
});
