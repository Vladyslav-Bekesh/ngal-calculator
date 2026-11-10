"use client";

import { useRef } from "react";
import {
  DATE_MASK_EMPTY,
  applyDateMask,
  buildMaskedDate,
  extractDateDigits,
} from "@/lib/dateMask";

type DateMaskedInputProps = {
  value: string;
  onChange: (masked: string) => void;
  className?: string;
};

export function DateMaskedInput({
  value,
  onChange,
  className,
}: DateMaskedInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const display =
    value && value !== DATE_MASK_EMPTY ? value : DATE_MASK_EMPTY;
  const digits = extractDateDigits(display);

  const commitDigits = (nextDigits: string) => {
    onChange(buildMaskedDate(nextDigits));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key >= "0" && e.key <= "9") {
      e.preventDefault();
      if (digits.length >= 16) return;
      commitDigits(digits + e.key);
      return;
    }

    if (e.key === "Backspace" || e.key === "Delete") {
      e.preventDefault();
      commitDigits(digits.slice(0, -1));
      return;
    }

    if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      e.preventDefault();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text");
    commitDigits(digits + extractDateDigits(pasted));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    commitDigits(extractDateDigits(e.target.value));
  };

  const handleFocus = () => {
    if (!digits.length) {
      onChange(DATE_MASK_EMPTY);
    }
    requestAnimationFrame(() => {
      const el = inputRef.current;
      if (!el) return;
      const pos = cursorAfterDigits(display);
      el.setSelectionRange(pos, pos);
    });
  };

  return (
    <input
      ref={inputRef}
      type="text"
      inputMode="numeric"
      autoComplete="off"
      spellCheck={false}
      className={className}
      value={display}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      onPaste={handlePaste}
      onFocus={handleFocus}
      aria-label="Дати народження та смерті"
    />
  );
}

/** Позиція курсора після останньої введеної цифри (пропускаємо х, крапки, тире). */
function cursorAfterDigits(masked: string): number {
  let lastDigit = -1;
  for (let i = 0; i < masked.length; i++) {
    if (/\d/.test(masked[i])) lastDigit = i;
  }
  if (lastDigit === -1) return 0;
  return lastDigit + 1;
}
