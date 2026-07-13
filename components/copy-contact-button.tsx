"use client";

import { useState } from "react";

export function CopyContactButton({
  label,
  value
}: {
  label: string;
  value: string;
}) {
  const [status, setStatus] = useState<"idle" | "copied" | "failed">("idle");

  async function copyValue() {
    try {
      await navigator.clipboard.writeText(value);
      setStatus("copied");
      window.setTimeout(() => setStatus("idle"), 1800);
    } catch {
      setStatus("failed");
      window.setTimeout(() => setStatus("idle"), 1800);
    }
  }

  return (
    <button
      className="focus-ring rounded-full border border-[var(--line)] bg-[var(--surface)] px-2.5 py-1 text-xs font-semibold text-[var(--muted)] transition hover:border-[var(--secondary)] hover:text-[var(--secondary-strong)]"
      onClick={copyValue}
      type="button"
    >
      {status === "copied"
        ? "Copied"
        : status === "failed"
          ? "Copy failed"
          : `Copy ${label}`}
    </button>
  );
}
