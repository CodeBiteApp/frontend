import { create } from "zustand";

type UserState = {
  name: string;
  email: string;
  totalPoints: number;
  level: number;
  streak: number;
  isLoggedIn: boolean;
  hasOnboarded: boolean;

  login: (name: string, email: string) => void;
  logout: () => void;
  setName: (name: string) => void;
  addPoints: (points: number) => void;
  incrementStreak: () => void;
  resetStreak: () => void;
  completeOnboarding: () => void;
};

function calcLevel(points: number): number {
  return Math.floor(points / 200) + 1;
}

export const useUserStore = create<UserState>((set, get) => ({
  name: "",
  email: "",
  totalPoints: 0,
  level: 1,
  streak: 0,
  isLoggedIn: false,
  hasOnboarded: false,

  login: (name, email) => set({ name, email, isLoggedIn: true }),
  logout: () =>
    set({ name: "", email: "", totalPoints: 0, level: 1, streak: 0, isLoggedIn: false }),

  setName: (name) => set({ name }),

  addPoints: (points) => {
    const next = get().totalPoints + points;
    set({ totalPoints: next, level: calcLevel(next) });
  },

  incrementStreak: () => set((s) => ({ streak: s.streak + 1 })),
  resetStreak: () => set({ streak: 0 }),

  completeOnboarding: () => set({ hasOnboarded: true }),
}));
