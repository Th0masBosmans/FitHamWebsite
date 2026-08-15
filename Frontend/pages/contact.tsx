import { Suspense } from "react";
import { ContactContent } from "@/components/pages/public/ContactContent";

export default function ContactPage() {
  return (
    <Suspense fallback={null}>
      <ContactContent />
    </Suspense>
  );
}
