import { Download } from "lucide-react";
import { ClubTopicContent } from "@/components/pages/public/onze-club/ClubTopicContent";

export default function VerzekeringenPage() {
  return (
    <ClubTopicContent slug="verzekeringen">
      {/* Staat er al zodat de plek vastligt; wordt een echte link zodra het
          document (aangifteformulier) is aangeleverd. */}
      <button
        type="button"
        disabled
        className="mt-6 inline-flex cursor-not-allowed items-center justify-center gap-2 rounded-full border border-white/20 bg-white/10 px-6 py-3 text-white/60 label-regular font-extrabold"
      >
        <Download className="h-5 w-5 shrink-0" />
        Document downloaden
      </button>
    </ClubTopicContent>
  );
}
