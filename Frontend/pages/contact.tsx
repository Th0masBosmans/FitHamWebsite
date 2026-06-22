import { Suspense } from "react";
import { ContactContent } from "@/components/templates/ContactContent";

export default function ContactPage() {
  return (
    <Suspense fallback={null}>
      <ContactContent />
    </Suspense>
  );
}
