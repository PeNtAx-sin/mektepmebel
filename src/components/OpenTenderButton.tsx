"use client";

import type { ReactNode } from "react";

export default function OpenTenderButton({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      className={className}
      onClick={() => window.dispatchEvent(new CustomEvent("open-tender-modal"))}
    >
      {children}
    </button>
  );
}