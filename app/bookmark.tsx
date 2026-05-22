import { fetchBookmarks, removeBookmark } from "@/api/bookmark";
import { BookmarkListResponse } from "@/types/bookmark";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function BookmarkScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [selectedSubject, setSelectedSubject] = useState<string>("전체");

  // TanStack Query로 북마크 목록 데이터 관리
  const { data: bookmarks = [], isLoading } = useQuery<BookmarkListResponse[]>({
    queryKey: ["bookmarks"],
    queryFn: () => fetchBookmarks(),
  });

  // 북마크 삭제를 위한 Mutation 및 낙관적 업데이트(Optimistic Update) 적용
  const removeMutation = useMutation({
    mutationFn: (conceptId: number) => removeBookmark(conceptId),
    onMutate: async (conceptId) => {
      await queryClient.cancelQueries({ queryKey: ["bookmarks"] });
      const previousBookmarks = queryClient.getQueryData<BookmarkListResponse[]>(["bookmarks"]);
      
      // 낙관적으로 캐시 데이터 수정
      queryClient.setQueryData<BookmarkListResponse[]>(["bookmarks"], (old) =>
        old ? old.filter((item) => item.conceptId !== conceptId) : [],
      );

      return { previousBookmarks };
    },
    onError: (err, conceptId, context) => {
      if (context?.previousBookmarks) {
        queryClient.setQueryData(["bookmarks"], context.previousBookmarks);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
    },
  });

  // 고유한 과목 목록 추출 (필터 칩용)
  const subjects = useMemo(() => {
    const list = new Set<string>();
    bookmarks.forEach((b) => {
      if (b.subjectName) list.add(b.subjectName);
    });
    return ["전체", ...Array.from(list)];
  }, [bookmarks]);

  // 선택된 과목에 따라 필터링된 북마크 목록
  const filteredBookmarks = useMemo(() => {
    if (selectedSubject === "전체") return bookmarks;
    return bookmarks.filter((b) => b.subjectName === selectedSubject);
  }, [bookmarks, selectedSubject]);

  const handleGoBack = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleToggleBookmark = async (conceptId: number) => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    removeMutation.mutate(conceptId);
  };

  const handleStartReview = async (conceptId: number) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // 학습 개념 상세/퀴즈 화면으로 즉시 이동하여 복습 시작
    router.push(`/quiz/${conceptId}` as never);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeContainer}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#58CC02" />
          <Text style={styles.loadingText}>북마크 목록 불러오는 중...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeContainer}>
      {/* 프리미엄 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={handleGoBack} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>북마크한 개념</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* 과목 필터 칩 영역 */}
      {bookmarks.length > 0 && (
        <View style={styles.filterWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterScroll}
          >
            {subjects.map((sub) => {
              const active = selectedSubject === sub;
              return (
                <TouchableOpacity
                  key={sub}
                  style={[styles.filterChip, active && styles.filterChipActive]}
                  onPress={async () => {
                    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setSelectedSubject(sub);
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.filterText, active && styles.filterTextActive]}>
                    {sub}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* 북마크 리스트 / Empty State */}
      {filteredBookmarks.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconCircle}>
            <Ionicons name="bookmark-outline" size={48} color="#888888" />
          </View>
          <Text style={styles.emptyTitle}>북마크가 비어 있습니다</Text>
          <Text style={styles.emptySub}>
            학습 완료한 개념 중 유익했거나 다시 보고 싶은 개념을 북마크하여 보관해 보세요!
          </Text>
          <TouchableOpacity
            style={styles.goHomeBtn}
            onPress={handleGoBack}
            activeOpacity={0.85}
          >
            <Text style={styles.goHomeText}>복습하러 가기</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredBookmarks}
          keyExtractor={(item) => String(item.conceptId)}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => handleStartReview(item.conceptId)}
              activeOpacity={0.9}
            >
              <View style={styles.cardInfo}>
                <View style={styles.subjectBadge}>
                  <Text style={styles.subjectText}>{item.subjectName}</Text>
                </View>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardActionHint}>👉 터치하여 즉시 복습 퀴즈 시작</Text>
              </View>
              <TouchableOpacity
                style={styles.bookmarkToggleBtn}
                onPress={() => handleToggleBookmark(item.conceptId)}
                activeOpacity={0.7}
              >
                <Ionicons name="bookmark" size={24} color="#58CC02" />
              </TouchableOpacity>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: "#191A1C",
  },
  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#191A1C",
    gap: 16,
  },
  loadingText: {
    color: "#aaaaaa",
    fontSize: 14,
    fontWeight: "500",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#2A2C2F",
    backgroundColor: "#191A1C",
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
    backgroundColor: "#242628",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#ffffff",
    letterSpacing: -0.3,
  },
  filterWrapper: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#2A2C2F",
    backgroundColor: "#191A1C",
  },
  filterScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#242628",
    borderWidth: 1,
    borderColor: "#333537",
  },
  filterChipActive: {
    backgroundColor: "#58CC02",
    borderColor: "#58CC02",
  },
  filterText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#aaaaaa",
  },
  filterTextActive: {
    color: "#ffffff",
    fontWeight: "800",
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 18,
    borderRadius: 16,
    backgroundColor: "#242628",
    borderWidth: 1.5,
    borderColor: "#2E3033",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  cardInfo: {
    flex: 1,
    marginRight: 12,
    alignItems: "flex-start",
    gap: 6,
  },
  subjectBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: "rgba(88, 204, 2, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(88, 204, 2, 0.3)",
  },
  subjectText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#58CC02",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#ffffff",
    lineHeight: 22,
  },
  cardActionHint: {
    fontSize: 11,
    color: "#888888",
    fontWeight: "500",
    marginTop: 2,
  },
  bookmarkToggleBtn: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: "rgba(88, 204, 2, 0.08)",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 36,
    gap: 16,
  },
  emptyIconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#242628",
    borderWidth: 2,
    borderColor: "#2E3033",
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#ffffff",
  },
  emptySub: {
    fontSize: 13,
    color: "#888888",
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 12,
  },
  goHomeBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: "#58CC02",
    shadowColor: "#58CC02",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  goHomeText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#ffffff",
  },
});
