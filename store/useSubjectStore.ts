import { fetchConceptsBySubject, fetchSubjects } from "@/api/quiz";
import { ConceptStage, Subject } from "@/types/quiz";
import { create } from "zustand";

type SubjectState = {
  subjects: Subject[];
  conceptsMap: Record<number, ConceptStage[]>;
  isLoading: boolean;
  loadSubjects: () => Promise<void>;
  loadAllConcepts: (subjects: Subject[]) => Promise<void>;
  getConceptById: (conceptId: number) => ConceptStage | undefined;
  getSubjectIndexByConceptId: (conceptId: number) => number;
  getSubjectByConceptId: (conceptId: number) => Subject | undefined;
};

export const useSubjectStore = create<SubjectState>((set, get) => ({
  subjects: [],
  conceptsMap: {},
  isLoading: false,

  loadSubjects: async () => {
    set({ isLoading: true });
    try {
      const subjects = await fetchSubjects();
      set({ subjects });
    } finally {
      set({ isLoading: false });
    }
  },

  loadAllConcepts: async (subjects: Subject[]) => {
    const entries = await Promise.all(
      subjects.map(async (s) => {
        const concepts = await fetchConceptsBySubject(s.subjectId);
        return [s.subjectId, concepts] as [number, ConceptStage[]];
      }),
    );
    set({ conceptsMap: Object.fromEntries(entries) });
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
