/* eslint-disable react-refresh/only-export-components */

/**
 * Pastille de catégorie : point coloré + nom.
 *
 * L'API ne renvoie pas de couleur pour les catégories. On en dérive une de
 * façon déterministe à partir du nom : la même catégorie garde la même teinte
 * dans le tableau, le camembert et les écrans de détail, sans rien stocker.
 *
 * La palette reste dans la famille olive/accent de la charte, du plus foncé au
 * plus clair — c'est aussi celle du camembert (étape 5), d'où l'export.
 */

export const PALETTE_CATEGORIES = [
  "#1a1a00",
  "#3d3d0a",
  "#5c5c14",
  "#7a7a1f",
  "#99992e",
  "#b3b34d",
  "#c9c973",
  "#dcdc9e",
] as const;

/** Hash stable (djb2 simplifié) : même nom → même index de couleur. */
export function couleurCategorie(nom: string): string {
  let hash = 0;
  for (let i = 0; i < nom.length; i++) {
    hash = (hash * 33 + nom.charCodeAt(i)) >>> 0;
  }
  return PALETTE_CATEGORIES[hash % PALETTE_CATEGORIES.length];
}

type Props = {
  nom: string;
  /** Force la couleur du point (utile pour aligner sur une légende de camembert). */
  couleur?: string;
};

export function ChipCategorie({ nom, couleur }: Props) {
  return (
    <span className="afi-cat">
      <span className="afi-cat__dot" style={{ background: couleur ?? couleurCategorie(nom) }} />
      {nom}
    </span>
  );
}