// Checkbox in "toevoegen"-modals: form blijft open + leeg na opslaan zodat je meerdere items na elkaar invoert.
export function MultiAddToggle() {
  return (
    <label className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-xl bg-gray-50 cursor-pointer">
      <input type="checkbox" name="addAnother" className="w-5 h-5 accent-[var(--color-primary-brand)]" />
      <span className="font-black text-gray-700 uppercase tracking-wider text-xs">Meerdere toevoegen (formulier blijft open)</span>
    </label>
  );
}
