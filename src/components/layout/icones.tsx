/**
 * Icônes fines monochromes — reprises telles quelles des maquettes hi-fi.
 *
 * Règles :
 *  - `stroke="currentColor"` partout : la couleur vient du parent (nav active,
 *    survol, sidebar vs contenu). Jamais de couleur en dur ici.
 *  - Épaisseur 1.6 pour les icônes 19-20px, 2 pour les glyphes compacts.
 *  - Aucun emoji dans l'UI (règle des maquettes).
 */

type PropsIcone = {
  taille?: number;
};

export function IconeTableauDeBord({ taille = 19 }: PropsIcone) {
  return (
    <svg width={taille} height={taille} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <rect x="2.5" y="2.5" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
      <rect x="11.5" y="2.5" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
      <rect x="2.5" y="11.5" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
      <rect x="11.5" y="11.5" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

export function IconeTransactions({ taille = 19 }: PropsIcone) {
  return (
    <svg width={taille} height={taille} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M4 6h9m0 0-3-3m3 3-3 3M16 14H7m0 0 3-3m-3 3 3 3"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconeComptes({ taille = 19 }: PropsIcone) {
  return (
    <svg width={taille} height={taille} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <rect x="2.5" y="4.5" width="15" height="11" rx="2.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M2.5 8.5h15" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

export function IconeAssistant({ taille = 19 }: PropsIcone) {
  return (
    <svg width={taille} height={taille} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M4 4.5h12a1.5 1.5 0 0 1 1.5 1.5v6A1.5 1.5 0 0 1 16 13.5H8l-4 3V6A1.5 1.5 0 0 1 4 4.5Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconePlus({ taille = 17 }: PropsIcone) {
  return (
    <svg width={taille} height={taille} viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M9 3.5v11M3.5 9h11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function IconeRecherche({ taille = 17 }: PropsIcone) {
  return (
    <svg width={taille} height={taille} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.6" />
      <path d="m14 14 3.5 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function IconeDeconnexion({ taille = 17 }: PropsIcone) {
  return (
    <svg width={taille} height={taille} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M12.5 6V4.5A1.5 1.5 0 0 0 11 3H5a1.5 1.5 0 0 0-1.5 1.5v11A1.5 1.5 0 0 0 5 17h6a1.5 1.5 0 0 0 1.5-1.5V14"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M8 10h9m0 0-2.5-2.5M17 10l-2.5 2.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Marque AFI — courbe ascendante, utilisée dans le carré de la sidebar. */
export function GlypheAfi({ taille = 20 }: PropsIcone) {
  return (
    <svg width={taille} height={taille} viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <polyline
        points="2,14 6,8 10,10 16,3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconeFleicheGauche({ taille = 16 }: PropsIcone) {
  return (
    <svg width={taille} height={taille} viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path
        d="M14.5 9h-11m0 0 4.5-4.5M3.5 9 8 13.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconeCorbeille({ taille = 17 }: PropsIcone) {
  return (
    <svg width={taille} height={taille} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M3.5 5.5h13M8 5.5V4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v1.5M5.5 5.5l.7 10a1.5 1.5 0 0 0 1.5 1.4h4.6a1.5 1.5 0 0 0 1.5-1.4l.7-10"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}