import { ArrowDown } from "lucide-react";

export function NewMessagesChip({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-brand-600 px-3.5 py-1.5 text-xs font-medium text-white shadow-lg shadow-brand-500/20 transition-colors hover:bg-brand-700"
    >
      New messages
      <ArrowDown className="size-3.5" aria-hidden="true" />
    </button>
  );
}
