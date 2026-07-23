import type { ReactNode } from "react";

/**
 * État vide : icône, titre, explication, action facultative.
 * Utilisé par l'historique (aucune transaction) et le dashboard
 * (aucune dépense sur la période).
 */

type Props = {
  icone?: ReactNode;
  titre: string;
  description?: string;
  action?: ReactNode;
};

/** Icône par défaut : document vide, trait fin monochrome. */
function IconeDefaut() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <path
        d="M11 8.5h13l5 5V31.5a1.5 1.5 0 0 1-1.5 1.5h-16.5a1.5 1.5 0 0 1-1.5-1.5V10a1.5 1.5 0 0 1 1.5-1.5Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M24 8.5v5.5h5M15 22h10M15 27h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function EtatVide({ icone, titre, description, action }: Props) {
  return (
    <div className="afi-empty">
      <div className="afi-empty__ic">{icone ?? <IconeDefaut />}</div>
      <h3>{titre}</h3>
      {description && <p>{description}</p>}
      {action}
    </div>
  );
}