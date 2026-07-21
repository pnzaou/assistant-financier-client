import { useState, type InputHTMLAttributes } from "react";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  erreur?: string;
};

export function PasswordField({ label, erreur, id, ...props }: Props) {
  const [visible, setVisible] = useState(false);
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
      <div style={{ position: "relative" }}>
        <input
          id={id}
          type={visible ? "text" : "password"}
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
          style={{
            width: "100%",
            height: "var(--hauteur-champ)",
            padding: "0 56px 0 16px",
            fontFamily: "var(--police)",
            fontSize: 15,
            color: "var(--encre)",
            background: "var(--blanc)",
            border: `1px solid ${
              erreur ? "var(--erreur)" : focus ? "var(--encre)" : "var(--hairline)"
            }`,
            borderRadius: "var(--rayon-champ)",
            outline: "none",
          }}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          style={{
            position: "absolute",
            right: 8,
            top: "50%",
            transform: "translateY(-50%)",
            height: 40,
            padding: "0 12px",
            border: "none",
            background: "transparent",
            fontSize: 13,
            fontWeight: 600,
            color: "var(--texte-doux)",
            cursor: "pointer",
          }}
        >
          {visible ? "Masquer" : "Afficher"}
        </button>
      </div>
      {erreur && (
        <p style={{ margin: "6px 0 0", fontSize: 13, color: "var(--erreur)" }}>{erreur}</p>
      )}
    </div>
  );
}