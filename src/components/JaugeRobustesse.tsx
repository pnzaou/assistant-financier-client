type Props = { motDePasse: string };

function evaluer(mdp: string): { score: number; label: string; couleur: string } {
  let score = 0;
  if (mdp.length >= 8) score++;
  if (mdp.length >= 12) score++;
  if (/[a-z]/.test(mdp) && /[A-Z]/.test(mdp)) score++;
  if (/\d/.test(mdp)) score++;
  if (/[^A-Za-z0-9]/.test(mdp)) score++;

  if (mdp.length === 0) return { score: 0, label: "", couleur: "var(--hairline)" };
  if (score <= 2) return { score, label: "Faible", couleur: "var(--erreur)" };
  if (score === 3) return { score, label: "Moyen", couleur: "var(--alerte)" };
  return { score, label: "Robuste", couleur: "var(--succes)" };
}

export function JaugeRobustesse({ motDePasse }: Props) {
  const { score, label, couleur } = evaluer(motDePasse);
  const remplissage = Math.min(score, 5) / 5;

  if (!motDePasse) return null;

  return (
    <div style={{ marginTop: -8, marginBottom: "var(--esp-2)" }}>
      <div
        style={{
          height: 5,
          borderRadius: "var(--rayon-pill)",
          background: "var(--hairline)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${remplissage * 100}%`,
            background: couleur,
            borderRadius: "var(--rayon-pill)",
            transition: "width .2s, background .2s",
          }}
        />
      </div>
      <p style={{ margin: "6px 0 0", fontSize: 12, color: couleur, fontWeight: 600 }}>{label}</p>
    </div>
  );
}