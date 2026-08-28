export function TypingDots({ className }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1 ${className ?? ""}`} aria-label="Typing">
      <span className="size-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.3s] dark:bg-slate-500" />
      <span className="size-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.15s] dark:bg-slate-500" />
      <span className="size-1.5 animate-bounce rounded-full bg-slate-400 dark:bg-slate-500" />
    </span>
  );
}
