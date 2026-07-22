import type { ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variante?: "principal" | "ghost";
};

export function Button({ variante = "principal", style, ...props }: Props) {
  const base = {
    height: 52,
    padding: "0 24px",
    borderRadius: "var(--rayon-pill)",
    fontFamily: "var(--police)",
    fontSize: 15,
    fontWeight: 600,
    cursor: props.disabled ? "not-allowed" : "pointer",
    opacity: props.disabled ? 0.5 : 1,
    width: "100%",
    transition: "opacity .15s",
  } as const;

  const variantes = {
    principal: { background: "var(--encre)", color: "var(--fond)", border: "none" },
    ghost: {
      background: "transparent",
      color: "var(--encre)",
      border: "1px solid var(--hairline)",
    },
  } as const;

  return <button {...props} style={{ ...base, ...variantes[variante], ...style }} />;
}