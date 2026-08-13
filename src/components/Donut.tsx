import { couleurCategorie, PALETTE_CATEGORIES } from "./ChipCategorie";

/**
 * Camembert évidé en SVG pur — pas de librairie de graphiques.
 *
 * Un donut se dessine avec un seul cercle par part : `stroke-dasharray` fixe la
 * longueur de l'arc, `stroke-dashoffset` sa position sur la circonférence. Le
 * trou du milieu est simplement l'intérieur du trait, pas un second cercle.
 *
 * Rotation de -90° pour démarrer à midi plutôt qu'à 3 heures.
 */

export type PartDonut = {
  cle: string;
  libelle: string;
  valeur: number;
};

type Props = {
  parts: PartDonut[];
  /** Contenu du trou central (montant total, en général). */
  centre?: string;
  legendeCentre?: string;
  taille?: number;
};

const EPAISSEUR = 30;

export function Donut({ parts, centre, legendeCentre, taille = 186 }: Props) {
  const total = parts.reduce((somme, p) => somme + p.valeur, 0);
  const rayon = (taille - EPAISSEUR) / 2;
  const circonference = 2 * Math.PI * rayon;

  // Un seul segment ne peut pas être dessiné en dasharray (il ferait le tour
  // sans début visible) : on rend un anneau plein.
  const partUnique = parts.length === 1;

  let offset = 0;

  return (
    <div className="afi-donut" style={{ width: taille, height: taille }}>
      <svg width={taille} height={taille} viewBox={`0 0 ${taille} ${taille}`} role="presentation">
        <g transform={`rotate(-90 ${taille / 2} ${taille / 2})`}>
          {total === 0 ? (
            <circle
              cx={taille / 2}
              cy={taille / 2}
              r={rayon}
              fill="none"
              stroke="var(--surface-douce)"
              strokeWidth={EPAISSEUR}
            />
          ) : (
            parts.map((part, index) => {
              const longueur = (part.valeur / total) * circonference;
              const debut = offset;
              offset += longueur;

              return (
                <circle
                  key={part.cle}
                  className="afi-donut__part"
                  cx={taille / 2}
                  cy={taille / 2}
                  r={rayon}
                  fill="none"
                  stroke={couleurPart(part.libelle, index)}
                  strokeWidth={EPAISSEUR}
                  strokeDasharray={
                    partUnique ? undefined : `${Math.max(longueur - 1.5, 0)} ${circonference}`
                  }
                  strokeDashoffset={partUnique ? undefined : -debut}
                >
                  <title>{part.libelle}</title>
                </circle>
              );
            })
          )}
        </g>
      </svg>

      {(centre || legendeCentre) && (
        <div className="afi-donut__centre">
          {centre && <div className="afi-donut__valeur">{centre}</div>}
          {legendeCentre && <div className="afi-donut__legende-centre">{legendeCentre}</div>}
        </div>
      )}
    </div>
  );
}

/**
 * Couleur d'une part. On garde la teinte dérivée du nom (cohérente avec les
 * chips de l'historique), sauf collision entre deux parts voisines : on prend
 * alors la couleur suivante de la palette, pour rester lisible.
 */
function couleurPart(libelle: string, index: number): string {
  const derivee = couleurCategorie(libelle);
  const positionDerivee = PALETTE_CATEGORIES.indexOf(derivee as never);
  // Décalage déterministe si l'index de la part tombe sur la même teinte.
  return positionDerivee === -1
    ? PALETTE_CATEGORIES[index % PALETTE_CATEGORIES.length]
    : derivee;
}