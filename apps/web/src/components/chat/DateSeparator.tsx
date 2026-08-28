import { isToday, isYesterday, format } from "date-fns";

export function DateSeparator({ date }: { date: Date }) {
  const label = isToday(date)
    ? "Today"
    : isYesterday(date)
      ? "Yesterday"
      : format(date, "MMMM d, yyyy");

  return (
    <div className="flex items-center justify-center py-2">
      <span className="rounded-full border border-slate-200/70 bg-slate-100 px-3 py-1 text-[11px] font-medium text-slate-500 shadow-sm dark:border-slate-700/50 dark:bg-slate-800 dark:text-slate-400">
        {label}
      </span>
    </div>
  );
}
