"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { SendHorizontal } from "lucide-react";
import { cn } from "@/lib/cn";

const MAX_ROWS = 6;
const TYPING_IDLE_MS = 2000;

interface ComposerProps {
  onSend: (content: string) => void;
  onTypingStart?: () => void;
  onTypingStop?: () => void;
  disabled?: boolean;
}

export function Composer({ onSend, onTypingStart, onTypingStop, disabled }: ComposerProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTypingRef = useRef(false);

  const stopTyping = useCallback(() => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    if (isTypingRef.current) {
      isTypingRef.current = false;
      onTypingStop?.();
    }
  }, [onTypingStop]);

  const notifyTyping = useCallback(() => {
    if (!isTypingRef.current) {
      isTypingRef.current = true;
      onTypingStart?.();
    }
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(stopTyping, TYPING_IDLE_MS);
  }, [onTypingStart, stopTyping]);

  useEffect(() => {
    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, []);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    const lineHeight = 20;
    const maxHeight = lineHeight * MAX_ROWS + 16;
    el.style.height = `${Math.min(el.scrollHeight, maxHeight)}px`;
  }, [value]);

  function handleSend() {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
    stopTyping();
    requestAnimationFrame(() => textareaRef.current?.focus());
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  const isEmpty = value.trim().length === 0;

  return (
    <div className="border-t border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-end gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-2 transition-colors duration-150 focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/60 dark:border-slate-700 dark:bg-slate-800/60">
        <textarea
          ref={textareaRef}
          value={value}
          rows={1}
          placeholder="Write a message…"
          onChange={(e) => {
            setValue(e.target.value);
            if (e.target.value.trim()) notifyTyping();
            else stopTyping();
          }}
          onKeyDown={handleKeyDown}
          onBlur={stopTyping}
          className="max-h-[136px] min-h-[24px] flex-1 resize-none bg-transparent px-2 py-1 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none dark:text-slate-100 dark:placeholder:text-slate-500"
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={isEmpty || disabled}
          aria-label="Send message"
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-xl transition-colors",
            isEmpty || disabled
              ? "bg-slate-200 text-slate-400 dark:bg-slate-700 dark:text-slate-500"
              : "bg-brand-600 text-white hover:bg-brand-700",
          )}
        >
          <SendHorizontal className="size-[18px]" strokeWidth={1.75} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
