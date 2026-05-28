import { fetchConceptsBySubject, fetchSubjects } from "@/api/quiz";
import { ConceptStage, Subject } from "@/types/quiz";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

const CACHE_KEY = "subject_cache_v1";
const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6시간

type SubjectCache = {
  subjects: Subject[];
  conceptsMap: Record<number, ConceptStage[]>;
  cachedAt: number;
};

type SubjectState = {
  subjects: Subject[];
  conceptsMap: Record<number, ConceptStage[]>;
  isLoading: boolean;
  isHydrated: boolean;
  subjectPage: number;
  hasMoreSubjects: boolean;
  loadSubjects: (reset?: boolean) => Promise<void>;
  refreshConcepts: () => Promise<void>;
  loadMoreSubjects: () => Promise<void>;
  loadConceptsForSubjects: (subjects: Subject[]) => Promise<void>;
  getConceptById: (conceptId: number) => ConceptStage | undefined;
  getSubjectIndexByConceptId: (conceptId: number) => number;
  getSubjectByConceptId: (conceptId: number) => Subject | undefined;
};

export const useSubjectStore = create<SubjectState>((set, get) => ({
  subjects: [],
  conceptsMap: {},
  isLoading: false,
  isHydrated: false,
  subjectPage: 0,
  hasMoreSubjects: true,

  loadSubjects: async (reset = true) => {
    const { isLoading } = get();
    if (isLoading) return;

    // 데이터가 없을 때만 캐시에서 즉시 복원 (첫 진입 시 스피너 제거)
    if (get().subjects.length === 0) {
      try {
        const raw = await AsyncStorage.getItem(CACHE_KEY);
        if (raw) {
          const cache: SubjectCache = JSON.parse(raw);
          set({
            subjects: cache.subjects,
            conceptsMap: cache.conceptsMap,
            isHydrated: true,
          });

          // 캐시가 신선하면 서버 재요청 없이 종료
          if (Date.now() - cache.cachedAt < CACHE_TTL_MS) {
            return;
          }
          // 캐시가 낡았으면 화면은 유지한 채 서버에서 조용히 갱신
        }
      } catch {}
    }

    // 기존 데이터가 없을 때만 로딩 스피너 표시
    const hasExistingData = get().subjects.length > 0;
    if (!hasExistingData) {
      set({ isLoading: true });
    }

    try {
      if (reset && !hasExistingData) {
        set({ subjectPage: 0, hasMoreSubjects: true });
      }
      const page = await fetchSubjects(0, 20);
      //console.log(`[useSubjectStore] subjects 로드 완료: ${page.content.length}개`, page.content.map((s) => s.name));
      set({
        subjects: page.content,
        subjectPage: 1,
        hasMoreSubjects: page.hasNext,
      });
      await get().loadConceptsForSubjects(page.content);

      // 캐시 저장
      try {
        const cacheData: SubjectCache = {
          subjects: page.content,
          conceptsMap: get().conceptsMap,
          cachedAt: Date.now(),
        };
        await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
      } catch {}
    } finally {
      set({ isLoading: false, isHydrated: true });
    }
  },

  // subjects 구조는 유지하고 isStudied 상태만 서버에서 갱신 (퀴즈 복귀 시 사용)
  refreshConcepts: async () => {
    const { subjects, isLoading } = get();
    if (subjects.length === 0) {
      return get().loadSubjects(false);
    }
    if (isLoading) return;
    try {
      await get().loadConceptsForSubjects(subjects);
      const cacheData: SubjectCache = {
        subjects: get().subjects,
        conceptsMap: get().conceptsMap,
        cachedAt: Date.now(),
      };
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    } catch {}
  },

  loadMoreSubjects: async () => {
    const { isLoading, hasMoreSubjects, subjectPage, subjects } = get();
    if (isLoading || !hasMoreSubjects) return;
    set({ isLoading: true });
    try {
      const page = await fetchSubjects(subjectPage, 20);
      const newSubjects = page.content;
      console.log(
        `[useSubjectStore] 추가 subjects 로드: ${newSubjects.length}개 (page ${subjectPage})`,
      );
      set({
        subjects: [...subjects, ...newSubjects],
        subjectPage: subjectPage + 1,
        hasMoreSubjects: page.hasNext,
      });
      await get().loadConceptsForSubjects(newSubjects);

      // 추가 로드 후 캐시 갱신
      try {
        const cacheData: SubjectCache = {
          subjects: get().subjects,
          conceptsMap: get().conceptsMap,
          cachedAt: Date.now(),
        };
        await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
      } catch {}
    } finally {
      set({ isLoading: false });
    }
  },

  loadConceptsForSubjects: async (subjects: Subject[]) => {
    const entries = await Promise.all(
      subjects.map(async (s) => {
        const concepts = await fetchConceptsBySubject(s.subjectId);
        return [s.subjectId, concepts] as [number, ConceptStage[]];
      }),
    );
    const newMap = Object.fromEntries(entries);
    const { conceptsMap } = get();
    const merged = { ...conceptsMap, ...newMap };
    const total = Object.values(merged).reduce(
      (acc: number, c) => acc + (c as ConceptStage[]).length,
      0,
    );
    console.log(`[useSubjectStore] 전체 concepts 로드 완료: ${total}개`);
    set({ conceptsMap: merged });
  },

  getConceptById: (conceptId: number) => {
    const { conceptsMap } = get();
    for (const concepts of Object.values(conceptsMap)) {
      const found = concepts.find((c) => c.conceptId === conceptId);
      if (found) return found;
    }
    return undefined;
  },

  getSubjectIndexByConceptId: (conceptId: number) => {
    const { subjects, conceptsMap } = get();
    for (let i = 0; i < subjects.length; i++) {
      const concepts = conceptsMap[subjects[i].subjectId] ?? [];
      if (concepts.some((c) => c.conceptId === conceptId)) return i;
    }
    return 0;
  },

  getSubjectByConceptId: (conceptId: number) => {
    const { subjects, conceptsMap } = get();
    for (const subject of subjects) {
      const concepts = conceptsMap[subject.subjectId] ?? [];
      if (concepts.some((c) => c.conceptId === conceptId)) return subject;
    }
    return undefined;
  },
}));
