import { Trash2 } from "lucide-react";

/** Generic "weet je het zeker?" confirmation shown before any destructive admin action. */
export function DeleteConfirmModal({ onCancel, onConfirm }: { onCancel: () => void; onConfirm: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 lg:p-8 text-center animate-in fade-in zoom-in-95 duration-200">
        <div className="w-16 lg:w-20 h-16 lg:h-20 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 lg:mb-6">
          <Trash2 className="w-8 lg:w-10 h-8 lg:h-10" />
        </div>
        <h3 className="font-black text-xl lg:text-2xl text-gray-800 uppercase tracking-tight mb-2 lg:mb-3">Weet je het zeker?</h3>
        <p className="text-gray-500 font-bold mb-6 lg:mb-8 text-sm lg:text-base">Deze actie kan niet ongedaan worden gemaakt.</p>
        <div className="flex flex-col sm:flex-row gap-3 lg:gap-4">
          <button onClick={onCancel} className="flex-1 px-4 py-3 lg:py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-black uppercase tracking-wider rounded-xl transition-colors text-sm lg:text-base">Annuleren</button>
          <button onClick={onConfirm} className="flex-1 px-4 py-3 lg:py-3.5 bg-red-500 hover:bg-red-600 text-white font-black uppercase tracking-wider rounded-xl transition-colors shadow text-sm lg:text-base">Verwijderen</button>
        </div>
      </div>
    </div>
  );
}
