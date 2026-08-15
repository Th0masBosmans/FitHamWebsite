import { useEffect, useRef, useState } from "react";

/** Vluchtig "X is toegevoegd" bericht voor de "meerdere toevoegen"-modals; verdwijnt na 1s. */
export function useAddedToast() {
  const [addedMessage, setAddedMessage] = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showAddedMessage = (message: string) => {
    setAddedMessage(message);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setAddedMessage(null), 1000);
  };

  const clearAddedMessage = () => setAddedMessage(null);

  useEffect(() => () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); }, []);

  return { addedMessage, showAddedMessage, clearAddedMessage };
}
