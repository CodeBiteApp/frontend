import { addBookmark, fetchBookmarks, removeBookmark } from "@/api/bookmark";
import { Button } from "@/components/common/Button";
import { QuizResultCharacter } from "@/components/quiz/QuizResultCharacter";
import { QuizColors } from "@/constants/colors";
import { BookmarkListResponse } from "@/types/bookmark";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import React, { useMemo, useRef } from "react";
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type Props = {
  conceptId: number;
  correct: number;
  total: number;
  accentColor: string;
  score?: number;
  dotoriEarned?: number;
  onNext: () => void;
};

export function ResultScreen({
  conceptId,
  correct,
  total,
  accentColor,
  score,
  dotoriEarned,
  onNext,
}: Props) {
  const queryClient = useQueryClient();
  const displayDotori = dotoriEarned ?? correct * 10;
  const isPerfect = correct === total;

  // 북마크 목록 캐시 조회
  const { data: bookmarks = [] } = useQuery<BookmarkListResponse[]>({
    queryKey: ["bookmarks"],
    queryFn: () => fetchBookmarks(),
  });

  // 북마크 등록 Mutation
  const addMutation = useMutation({
    mutationFn: (id: number) => addBookmark(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["bookmarks"] });
      const previous = queryClient.getQueryData<BookmarkListResponse[]>([
        "bookmarks",
      ]);

      queryClient.setQueryData<BookmarkListResponse[]>(["bookmarks"], (old) => {
        if (!old) return [];
        return [
          ...old,
          {
            conceptId: id,
            title: "학습 완료 개념",
            subjectName: "Java",
            hasChild: false,
          },
        ];
      });

      return { previous };
    },
    onError: (err, id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["bookmarks"], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
    },
  });

  // 북마크 해제 Mutation
  const removeMutation = useMutation({
    mutationFn: (id: number) => removeBookmark(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["bookmarks"] });
      const previous = queryClient.getQueryData<BookmarkListResponse[]>([
        "bookmarks",
      ]);

      queryClient.setQueryData<BookmarkListResponse[]>(["bookmarks"], (old) =>
        old ? old.filter((b) => b.conceptId !== id) : [],
      );

      return { previous };
    },
    onError: (err, id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["bookmarks"], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
    },
  });

  const isBookmarkPending = addMutation.isPending || removeMutation.isPending;

  const isMarked = useMemo(() => {
    if (addMutation.isPending) return true;
    if (removeMutation.isPending) return false;
    return bookmarks.some((b) => b.conceptId === conceptId);
  }, [bookmarks, conceptId, addMutation.isPending, removeMutation.isPending]);

  const toastOpacity = useRef(new Animated.Value(0)).current;
  const toastMessage = useRef("북마크에 저장되었습니다");
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = (message: string) => {
    toastMessage.current = message;
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastOpacity.setValue(0);
    Animated.sequence([
      Animated.timing(toastOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.delay(1600),
      Animated.timing(toastOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
    toastTimer.current = setTimeout(() => {
      toastOpacity.setValue(0);
    }, 2100);
  };

  const handleToggleBookmark = async () => {
    if (isBookmarkPending) return;
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}
    if (isMarked) {
      removeMutation.mutate(conceptId);
      showToast("북마크가 해제되었습니다");
    } else {
      addMutation.mutate(conceptId);
      showToast("북마크에 저장되었습니다");
    }
  };

  return (
    <View style={styles.container}>
      <Animated.View
        style={[styles.toast, { opacity: toastOpacity }]}
        pointerEvents="none"
      >
        <Ionicons name="bookmark" size={15} color={QuizColors.correct} />
        <Text style={styles.toastText}>{toastMessage.current}</Text>
      </Animated.View>
      {/* 상단 액션 바 */}
      <View style={styles.actionBar}>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={handleToggleBookmark}
          activeOpacity={0.7}
          disabled={isBookmarkPending}
        >
          <Ionicons
            name={isMarked ? "bookmark" : "bookmark-outline"}
            size={22}
            color={isMarked ? QuizColors.correct : QuizColors.white}
          />
        </TouchableOpacity>
      </View>

      <QuizResultCharacter />
      <Text style={styles.title}>
        {isPerfect
          ? "완벽해요!"
          : correct >= total / 2
            ? "잘했어요!"
            : "다시 도전해봐요!"}
      </Text>
      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.label}>정답</Text>
          <Text style={[styles.value, { color: accentColor }]}>
            {correct} / {total}
          </Text>
        </View>
        {score !== undefined && (
          <>
            <View style={styles.divider} />
            <View style={styles.row}>
              <Text style={styles.label}>점수</Text>
              <Text style={[styles.value, { color: accentColor }]}>
                {score}점
              </Text>
            </View>
          </>
        )}
        <View style={styles.divider} />
        <View style={styles.row}>
          <Text style={styles.label}>획득 도토리</Text>
          <Text style={[styles.value, { color: QuizColors.dotori }]}>
            +{displayDotori}
          </Text>
        </View>
      </View>
      <Button
        label="다음"
        onPress={onNext}
        color={accentColor}
        style={{ width: "100%", paddingVertical: 16, marginTop: 8 }}
        textStyle={{ fontWeight: "800" }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: QuizColors.pageBg,
    alignItems: "center",
    paddingTop: 56,
    paddingHorizontal: 28,
    gap: 16,
  },
  actionBar: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingVertical: 10,
    marginBottom: 8,
  },
  actionBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: QuizColors.itemBg,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: QuizColors.surfaceAlt,
  },
  title: { fontSize: 26, fontWeight: "800", color: QuizColors.white },
  card: {
    width: "100%",
    backgroundColor: QuizColors.itemBg,
    borderRadius: 20,
    padding: 24,
    gap: 16,
    marginTop: 8,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  divider: { height: 1, backgroundColor: QuizColors.surface },
  label: { color: QuizColors.textLabel, fontSize: 15 },
  value: { fontSize: 20, fontWeight: "800" },
  toast: {
    position: "absolute",
    top: 20,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: QuizColors.surfaceAlt,
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: QuizColors.correct,
    zIndex: 100,
  },
  toastText: { color: QuizColors.white, fontSize: 13, fontWeight: "600" },
});
