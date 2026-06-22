import { Check } from "lucide-react";

/** The "X is toegevoegd" confirmation shown inside the multi-add roster modals. */
export function AddedToast({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div className="flex items-center gap-2 rounded-xl bg-[var(--color-accent)]/15 border border-[var(--color-accent)]/40 px-4 py-3 text-sm font-black uppercase tracking-wider text-[var(--color-primary-brand)] animate-in fade-in slide-in-from-top-1 duration-200">
      <Check className="w-4 h-4 shrink-0" />
      <span>{message}</span>
    </div>
  );
}
