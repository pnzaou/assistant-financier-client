type Props = {
  variante?: "icone" | "complet";
  taille?: number; // hauteur en px
};

export function Logo({ variante = "icone", taille = 40 }: Props) {
  if (variante === "complet") {
    return (
      <svg
        height={taille}
        viewBox="0 0 300 80"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="AFI — Assistant financier"
      >
        <rect x="8" y="23" width="34" height="34" rx="12" fill="var(--encre)" />
        <polyline
          points="16.5,49 24,40 30,44 37,31"
          fill="none"
          stroke="var(--accent)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <text
          x="56"
          y="42"
          fontFamily="Manrope, Inter, system-ui, sans-serif"
          fontSize="20"
          fontWeight="600"
          letterSpacing="-0.01em"
          fill="var(--encre)"
        >
          AFI
        </text>
        <text
          x="56"
          y="58"
          fontFamily="Inter, system-ui, sans-serif"
          fontSize="10.5"
          fontWeight="500"
          letterSpacing="0.02em"
          fill="var(--texte-doux)"
        >
          Assistant financier
        </text>
      </svg>
    );
  }

  return (
    <svg
      height={taille}
      width={taille}
      viewBox="0 0 512 512"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="AFI"
    >
      <rect width="512" height="512" rx="180" fill="var(--encre)" />
      <polyline
        points="128,352 234,224 314,280 400,96"
        fill="none"
        stroke="var(--accent)"
        strokeWidth="42"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}