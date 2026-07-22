import { useState, type InputHTMLAttributes } from "react";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  erreur?: string;
};

export function Field({ label, erreur, id, ...props }: Props) {
  const [focus, setFocus] = useState(false);
  return (
    <div style={{ marginBottom: "var(--esp-2)" }}>
      <label
        htmlFor={id}
        style={{
          display: "block",
          fontSize: 13,
          fontWeight: 600,
          color: "var(--texte)",
          marginBottom: 7,
        }}
      >
        {label}
      </label>
      <input
        id={id}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        style={{
          width: "100%",
          height: "var(--hauteur-champ)",
          padding: "0 16px",
          fontFamily: "var(--police)",
          fontSize: 15,
          color: "var(--encre)",
          background: "var(--blanc)",
          border: `1px solid ${
            erreur ? "var(--erreur)" : focus ? "var(--encre)" : "var(--hairline)"
          }`,
          borderRadius: "var(--rayon-champ)",
          outline: "none",
          transition: "border-color .15s",
        }}
        {...props}
      />
      {erreur && (
        <p style={{ margin: "6px 0 0", fontSize: 13, color: "var(--erreur)" }}>{erreur}</p>
      )}
    </div>
  );
}