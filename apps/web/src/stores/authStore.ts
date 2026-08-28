import { create } from "zustand";
import type { Me } from "@dialogue-room/shared";

interface AuthState {
  user: Me | null;
  setUser: (user: Me | null) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  clear: () => set({ user: null }),
}));
