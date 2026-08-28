import { create } from "zustand";

interface PresenceState {
  onlineIds: Set<string>;
  setSnapshot: (ids: string[]) => void;
  setOnline: (id: string, online: boolean) => void;
}

export const usePresenceStore = create<PresenceState>((set) => ({
  onlineIds: new Set<string>(),
  setSnapshot: (ids) => set({ onlineIds: new Set(ids) }),
  setOnline: (id, online) =>
    set((state) => {
      const next = new Set(state.onlineIds);
      if (online) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return { onlineIds: next };
    }),
}));
