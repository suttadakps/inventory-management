"use client";

import { useEffect, useState } from "react";

/**
 * A numeric text input that lets you type "10.", "0.5", etc. without losing
 * your place. A plain `type="number"` input re-derives its displayed value
 * from a number on every keystroke, which silently drops an in-progress
 * decimal point — and on iOS, `type="number"` shows a keyboard with no "."
 * key at all regardless of `inputMode`. This keeps the raw text you're
 * typing as local state and only commits (parses + calls onCommit) on blur.
 */
export function DecimalInput({
  value,
  onCommit,
  className,
  disabled,
}: {
  value: number;
  onCommit: (next: number) => void;
  className?: string;
  disabled?: boolean;
}) {
  const [text, setText] = useState(String(value));

  useEffect(() => {
    setText(String(value));
  }, [value]);

  return (
    <input
      type="text"
      inputMode="decimal"
      disabled={disabled}
      value={text}
      onChange={(e) => {
        const raw = e.target.value;
        if (/^-?\d*\.?\d*$/.test(raw)) setText(raw);
      }}
      onBlur={() => {
        const n = parseFloat(text);
        const next = Number.isFinite(n) ? n : 0;
        setText(String(next));
        onCommit(next);
      }}
      className={className}
    />
  );
}
