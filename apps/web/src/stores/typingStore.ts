import { useMemo } from "react";
import { create } from "zustand";

const TYPING_EXPIRY_MS = 4000;

interface TypingState {
  /** conversationId -> Set of userIds currently typing */
  typingByConversation: Record<string, Set<string>>;
  timers: Record<string, ReturnType<typeof setTimeout>>;
  setTyping: (conversationId: string, userId: string) => void;
  clearTyping: (conversationId: string, userId: string) => void;
}

export const useTypingStore = create<TypingState>((set, get) => ({
  typingByConversation: {},
  timers: {},
  setTyping: (conversationId, userId) => {
    const key = `${conversationId}:${userId}`;
    const existingTimer = get().timers[key];
    if (existingTimer) clearTimeout(existingTimer);

    const timer = setTimeout(() => {
      get().clearTyping(conversationId, userId);
    }, TYPING_EXPIRY_MS);

    set((state) => {
      const current = state.typingByConversation[conversationId] ?? new Set<string>();
      const next = new Set(current);
      next.add(userId);
      return {
        typingByConversation: { ...state.typingByConversation, [conversationId]: next },
        timers: { ...state.timers, [key]: timer },
      };
    });
  },
  clearTyping: (conversationId, userId) => {
    const key = `${conversationId}:${userId}`;
    const existingTimer = get().timers[key];
    if (existingTimer) clearTimeout(existingTimer);

    set((state) => {
      const current = state.typingByConversation[conversationId];
      if (!current || !current.has(userId)) return state;
      const next = new Set(current);
      next.delete(userId);
      const timers = { ...state.timers };
      delete timers[key];
      return {
        typingByConversation: { ...state.typingByConversation, [conversationId]: next },
        timers,
      };
    });
  },
}));

const EMPTY_TYPING = new Set<string>();

export function useTypingUserIds(conversationId: string | null): string[] {
  // Select the stable Set reference; deriving an array INSIDE the selector
  // would return a new reference every getSnapshot and loop useSyncExternalStore.
  const typingSet = useTypingStore((state) =>
    conversationId ? (state.typingByConversation[conversationId] ?? EMPTY_TYPING) : EMPTY_TYPING,
  );
  return useMemo(() => Array.from(typingSet), [typingSet]);
}
