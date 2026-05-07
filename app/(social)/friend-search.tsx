import { searchUsers } from "../../api/social";
import { UserSearchCard } from "../../components/social/UserSearchCard";
import type { UserSearchResult } from "../../types/social";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const DEBOUNCE_MS = 450;

// ── 빈 상태 ───────────────────────────────────────────────
function EmptyState({ message }: { message: string }) {
  const opacity = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration: 350,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [message, opacity]);
  return (
    <Animated.View style={[styles.emptyBox, { opacity }]}>
      <Text style={styles.emptyEmoji}>🔍</Text>
      <Text style={styles.emptyText}>{message}</Text>
    </Animated.View>
  );
}

// ── 결과 헤더 ────────────────────────────────────────────
function ResultHeader({ count, mode }: { count: number; mode: "list" | "single" }) {
  return (
    <View style={styles.resultHeader}>
      <Text style={styles.resultTitle}>
        {mode === "single" ? "정확히 일치하는 유저" : "같은 닉네임 유저"}
      </Text>
      <Text style={styles.resultCount}>{count}명</Text>
    </View>
  );
}

// ── 메인 스크린 ───────────────────────────────────────────
export default function FriendSearchScreen() {
  const router = useRouter();
  const [nickname, setNickname] = useState("");
  const [userCode, setUserCode] = useState("");
  const [results, setResults] = useState<UserSearchResult[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const nicknameValid = nickname.trim().length > 0;
  const searchMode: "list" | "single" = userCode.trim() ? "single" : "list";

  const runSearch = useCallback(async (nick: string, code: string) => {
    const trimNick = nick.trim();
    if (!trimNick) { setResults([]); setSearched(false); return; }
    setLoading(true);
    setError(null);
    try {
      const data = await searchUsers({ nickname: trimNick, userCode: code.trim() || undefined, limit: 30 });
      setResults(data);
      setSearched(true);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "검색 중 오류가 발생했습니다.");
      setResults([]);
      setSearched(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!nickname.trim()) { setResults([]); setSearched(false); setError(null); return; }
    debounceRef.current = setTimeout(() => { void runSearch(nickname, userCode); }, DEBOUNCE_MS);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [nickname, userCode, runSearch]);

  const handleSearch = () => {
    if (!nicknameValid) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    void runSearch(nickname, userCode);
  };

  const handleClear = () => {
    setNickname(""); setUserCode(""); setResults([]); setSearched(false); setError(null);
  };

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      {/* ── 모달 헤더 ── */}
      <View style={styles.modalHeader}>
        <Text style={styles.modalTitle}>친구 찾기</Text>
        <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()} accessibilityLabel="닫기">
          <Text style={styles.closeBtnText}>✕</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.headerSub}>닉네임으로 검색하고, 코드로 정확히 찾아보세요</Text>

        {/* ── 검색 폼 카드 ── */}
        <View style={styles.formCard}>
          {/* 닉네임 (필수) */}
          <View style={styles.fieldBlock}>
            <View style={styles.labelRow}>
              <Text style={styles.fieldLabel}>닉네임</Text>
              <View style={styles.requiredBadge}><Text style={styles.requiredText}>필수</Text></View>
            </View>
            <View style={[styles.inputWrap, nickname.length > 0 && styles.inputWrapActive]}>
              <TextInput
                style={styles.input}
                placeholder="닉네임을 입력하세요"
                placeholderTextColor="#555"
                value={nickname}
                onChangeText={setNickname}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="search"
                onSubmitEditing={handleSearch}
                accessibilityLabel="닉네임 입력"
              />
              {nickname.length > 0 && (
                <TouchableOpacity style={styles.clearBtn} onPress={() => setNickname("")} accessibilityLabel="닉네임 지우기">
                  <Text style={styles.clearText}>✕</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          <View style={styles.fieldDivider} />

          {/* 친구 코드 (선택) */}
          <View style={styles.fieldBlock}>
            <View style={styles.labelRow}>
              <Text style={styles.fieldLabel}>친구 코드</Text>
              <View style={styles.optionalBadge}><Text style={styles.optionalText}>선택</Text></View>
            </View>
            <View style={[styles.inputWrap, userCode.length > 0 && styles.inputWrapActive]}>
              <TextInput
                style={[styles.input, styles.codeInput]}
                placeholder="6자리 코드 (예: A1B2C3)"
                placeholderTextColor="#555"
                value={userCode}
                onChangeText={(t) => setUserCode(t.toUpperCase())}
                autoCapitalize="characters"
                autoCorrect={false}
                maxLength={6}
                returnKeyType="search"
                onSubmitEditing={handleSearch}
                accessibilityLabel="친구 코드 입력"
              />
              {userCode.length > 0 && (
                <TouchableOpacity style={styles.clearBtn} onPress={() => setUserCode("")} accessibilityLabel="코드 지우기">
                  <Text style={styles.clearText}>✕</Text>
                </TouchableOpacity>
              )}
            </View>
            <Text style={styles.fieldHint}>
              {searchMode === "single"
                ? "닉네임 + 코드 → 정확히 1명을 찾습니다"
                : "비워두면 같은 닉네임의 유저 목록을 표시합니다"}
            </Text>
          </View>

          {/* 검색 버튼 */}
          <TouchableOpacity
            style={[styles.searchBtn, !nicknameValid && styles.searchBtnDisabled]}
            onPress={handleSearch}
            activeOpacity={0.8}
            disabled={!nicknameValid}
            accessibilityLabel="검색 실행"
          >
            {loading
              ? <ActivityIndicator size="small" color="#191A1C" />
              : <Text style={[styles.searchBtnText, !nicknameValid && styles.searchBtnTextDisabled]}>검색하기</Text>
            }
          </TouchableOpacity>
        </View>

        {/* ── 결과 영역 ── */}
        {error ? (
          <EmptyState message={error} />
        ) : loading ? null : searched ? (
          results.length > 0 ? (
            <View style={styles.resultSection}>
              <ResultHeader count={results.length} mode={searchMode} />
              {results.map((u) => <UserSearchCard key={u.userId} user={u} initialFollowing={u.isFollowing} />)}
              <TouchableOpacity style={styles.clearAllBtn} onPress={handleClear}>
                <Text style={styles.clearAllText}>검색 초기화</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <EmptyState
              message={searchMode === "single"
                ? "닉네임과 코드가 일치하는 유저가 없습니다"
                : `"${nickname.trim()}" 닉네임의 유저가 없습니다`}
            />
          )
        ) : (
          <View style={styles.tipBox}>
            <Text style={styles.tipTitle}>💡 검색 팁</Text>
            <Text style={styles.tipText}>
              닉네임이 같은 유저가 여럿이면 <Text style={styles.tipHighlight}>친구 코드</Text>를 함께
              입력해 정확히 찾을 수 있어요.{"\n"}
              친구 코드는 설정 화면에서 확인하거나 공유할 수 있습니다.
            </Text>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#191A1C" },

  // 모달 헤더
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 56,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#242628",
    position: "relative",
  },
  modalTitle: { color: "#fff", fontSize: 17, fontWeight: "800" },
  closeBtn: {
    position: "absolute",
    right: 20,
    top: 54,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#2e3032",
    justifyContent: "center",
    alignItems: "center",
  },
  closeBtnText: { color: "#aaa", fontSize: 14, fontWeight: "700" },

  scroll: { flex: 1 },
  content: { paddingTop: 20, paddingBottom: 48, paddingHorizontal: 20 },
  headerSub: { color: "#888", fontSize: 13, marginBottom: 20 },

  // 폼 카드
  formCard: { backgroundColor: "#242628", borderRadius: 20, padding: 20, marginBottom: 20 },
  fieldBlock: { marginBottom: 4 },
  fieldDivider: { height: 1, backgroundColor: "#2e3032", marginVertical: 16 },
  labelRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 },
  fieldLabel: { color: "#ccc", fontSize: 13, fontWeight: "700" },

  requiredBadge: { backgroundColor: "#3A2A00", borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2 },
  requiredText: { color: "#FFC800", fontSize: 10, fontWeight: "700" },
  optionalBadge: { backgroundColor: "#252830", borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2 },
  optionalText: { color: "#6B7280", fontSize: 10, fontWeight: "600" },

  inputWrap: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#1a1c1e", borderRadius: 12,
    borderWidth: 1.5, borderColor: "#2e3032",
    paddingHorizontal: 14, minHeight: 48,
  },
  inputWrapActive: { borderColor: "#FFC800" },
  input: { flex: 1, color: "#fff", fontSize: 15, paddingVertical: 10 },
  codeInput: { letterSpacing: 2, fontWeight: "700" },
  clearBtn: { padding: 4 },
  clearText: { color: "#555", fontSize: 14 },
  fieldHint: { color: "#555", fontSize: 11, marginTop: 6, marginLeft: 2 },

  // 검색 버튼
  searchBtn: { backgroundColor: "#FFC800", borderRadius: 14, paddingVertical: 15, alignItems: "center", marginTop: 20 },
  searchBtnDisabled: { backgroundColor: "#2a2c2e" },
  searchBtnText: { color: "#191A1C", fontSize: 15, fontWeight: "800" },
  searchBtnTextDisabled: { color: "#444" },

  // 결과
  resultSection: { marginTop: 4 },
  resultHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  resultTitle: { color: "#ccc", fontSize: 13, fontWeight: "700" },
  resultCount: { color: "#FFC800", fontSize: 13, fontWeight: "700" },
  clearAllBtn: { alignItems: "center", paddingVertical: 14, marginTop: 6 },
  clearAllText: { color: "#666", fontSize: 13 },

  // 빈 상태
  emptyBox: { alignItems: "center", marginTop: 48, gap: 12 },
  emptyEmoji: { fontSize: 44 },
  emptyText: { color: "#888", fontSize: 14, textAlign: "center" },

  // 팁
  tipBox: { backgroundColor: "#1e2022", borderRadius: 16, padding: 18, marginTop: 8, gap: 10 },
  tipTitle: { color: "#FFC800", fontSize: 14, fontWeight: "700" },
  tipText: { color: "#888", fontSize: 13, lineHeight: 20 },
  tipHighlight: { color: "#FFC800", fontWeight: "700" },
});
