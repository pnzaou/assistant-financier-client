/**
 * Bloc de chargement scintillant. Préférer un squelette à un spinner : il
 * réserve la place du contenu et évite le saut de mise en page à l'arrivée
 * des données.
 *
 * L'animation est neutralisée sous `prefers-reduced-motion` (voir CSS).
 */

type Props = {
  largeur?: number | string;
  hauteur?: number | string;
  rayon?: number | string;
};

export function Skeleton({ largeur = "100%", hauteur = 16, rayon = 10 }: Props) {
  return (
    <div
      className="afi-skel"
      aria-hidden="true"
      style={{ width: largeur, height: hauteur, borderRadius: rayon }}
    />
  );
}

/** Plusieurs lignes de texte simulées, largeur dégressive. */
export function SkeletonLignes({ nombre = 3 }: { nombre?: number }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--esp-1)" }}>
      {Array.from({ length: nombre }, (_, i) => (
        <Skeleton key={i} largeur={i === nombre - 1 ? "60%" : "100%"} />
      ))}
    </div>
  );
}