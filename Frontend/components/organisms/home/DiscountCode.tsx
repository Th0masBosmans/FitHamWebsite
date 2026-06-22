"use client";

import { useState } from "react";

const DISCOUNT_CODE = "R4QYA39R";

export function DiscountCode() {
  const [isCodeHovered, setIsCodeHovered] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const copyDiscountCode = () => {
    // Fallback method for copying to clipboard
    const textArea = document.createElement("textarea");
    textArea.value = DISCOUNT_CODE;
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    textArea.style.top = "-999999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      document.execCommand("copy");
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy text: ", error);
    }

    document.body.removeChild(textArea);
  };

  return (
    <div
      className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-4 lg:px-6 py-2 lg:py-3 cursor-pointer hover:bg-white/20 transition-colors relative"
      onClick={copyDiscountCode}
      onMouseEnter={() => setIsCodeHovered(true)}
      onMouseLeave={() => setIsCodeHovered(false)}
    >
      <p className="text-white/90 body-regular mb-1 font-medium whitespace-nowrap">
        15% korting met code:
      </p>
      <span className="font-black text-[var(--color-accent)] tracking-widest code-emphasis">
        {DISCOUNT_CODE}
      </span>
      {isCodeHovered && !isCopied && (
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white text-[var(--color-primary-brand)] px-3 py-1 rounded-lg label-small font-bold whitespace-nowrap shadow-lg">
          Klik om te kopiëren
        </div>
      )}
      {isCopied && (
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-[var(--color-accent)] text-[var(--color-primary-brand)] px-3 py-1 rounded-lg label-small font-bold whitespace-nowrap shadow-lg">
          Gekopieerd! ✓
        </div>
      )}
    </div>
  );
}
