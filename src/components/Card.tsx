import type { ReactNode } from "react";

export function Card({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        background: "var(--blanc)",
        border: "1px solid var(--hairline)",
        borderRadius: "var(--rayon-carte)",
        padding: "var(--esp-4)",
        width: "100%",
        maxWidth: 420,
      }}
    >
      {children}
    </div>
  );
}