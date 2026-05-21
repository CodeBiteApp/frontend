import { addBookmark, removeBookmark, fetchBookmarks } from "@/api/bookmark";
import { BookmarkListResponse } from "@/types/bookmark";
import { Button } from "@/components/common/Button";
import { QuizResultCharacter } from "@/components/quiz/QuizResultCharacter";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Props = {
  conceptId: number;
  correct: number;
  total: number;
  accentColor: string;
  score?: number;
  dotoriEarned?: number;
  onBack: () => void;
  onNext: () => void;
};

export function ResultScreen({
  conceptId,
  correct,
  total,
  accentColor,
  score,
  dotoriEarned,
  onBack,
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

  const isMarked = bookmarks.some((b) => b.conceptId === conceptId);

  // 북마크 등록 Mutation
  const addMutation = useMutation({
    mutationFn: (id: number) => addBookmark(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["bookmarks"] });
      const previous = queryClient.getQueryData<BookmarkListResponse[]>(["bookmarks"]);
      
      queryClient.setQueryData<BookmarkListResponse[]>(["bookmarks"], (old) => {
        if (!old) return [];
        return [
          ...old,
          { conceptId: id, title: "학습 완료 개념", subjectName: "Java", hasChild: false },
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
      const previous = queryClient.getQueryData<BookmarkListResponse[]>(["bookmarks"]);

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

  const handleToggleBookmark = async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    if (isMarked) {
      removeMutation.mutate(conceptId);
    } else {
      addMutation.mutate(conceptId);
    }
  };

  const handlePressBack = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onBack();
  };

  return (
    <View style={styles.container}>
      {/* 상단 액션 바 */}
      <View style={styles.actionBar}>
        <TouchableOpacity style={styles.actionBtn} onPress={handlePressBack} activeOpacity={0.7}>
          <Ionicons name="close" size={24} color="#ffffff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={handleToggleBookmark} activeOpacity={0.7}>
          <Ionicons
            name={isMarked ? "bookmark" : "bookmark-outline"}
            size={22}
            color={isMarked ? "#58CC02" : "#ffffff"}
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
          <Text style={[styles.value, { color: "#FFC800" }]}>
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
    backgroundColor: "#191A1C",
    alignItems: "center",
    paddingTop: 56,
    paddingHorizontal: 28,
    gap: 16,
  },
  actionBar: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    marginBottom: 8,
  },
  actionBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#242628",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#2E3033",
  },
  title: { fontSize: 26, fontWeight: "800", color: "#fff" },
  card: {
    width: "100%",
    backgroundColor: "#242628",
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
  divider: { height: 1, backgroundColor: "#333537" },
  label: { color: "#888", fontSize: 15 },
  value: { fontSize: 20, fontWeight: "800" },
});
