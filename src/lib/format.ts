import type { TypeCompte, TypeTransaction } from "./types";

export function formaterMontant(montant: number, devise = "XOF"): string {
  // Le XOF (Franc CFA) s'écrit sans décimales ; l'EUR avec deux.
  const sansDecimales = devise === "XOF";
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: devise,
    minimumFractionDigits: sansDecimales ? 0 : 2,
    maximumFractionDigits: sansDecimales ? 0 : 2,
  }).format(montant);
}

// Libellés lisibles pour les types de compte
export const LIBELLES_TYPE_COMPTE: Record<TypeCompte, string> = {
  COURANT: "Compte courant",
  EPARGNE: "Épargne",
  CARTE_CREDIT: "Carte de crédit",
  ESPECES: "Espèces",
  INVESTISSEMENT: "Investissement",
  AUTRE: "Autre",
};

export const LIBELLES_TYPE_TRANSACTION: Record<TypeTransaction, string> = {
  DEPENSE: "Dépense",
  REVENU: "Revenu",
  TRANSFERT: "Transfert",
};

/** `2026-07-23` → « 23 juil. 2026 » (listes et tableaux). */
export function formaterDate(iso: string): string {
  const [annee, mois, jour] = iso.split("-").map(Number);
  // Construction locale explicite : `new Date("2026-07-23")` serait interprété
  // en UTC et reculerait d'un jour dans les fuseaux négatifs.
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(annee, mois - 1, jour));
}

/** `2026-07-23` → « 23 juillet 2026 » (écrans de détail). */
export function formaterDateLongue(iso: string): string {
  const [annee, mois, jour] = iso.split("-").map(Number);
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(annee, mois - 1, jour));
}

/** Montant signé selon le type : « −64 300 F CFA » / « +2 450 000 F CFA ». */
export function formaterMontantSigne(
  montant: number,
  type: TypeTransaction,
  devise = "XOF",
): string {
  const signe = type === "REVENU" ? "+" : type === "DEPENSE" ? "\u2212" : "";
  return signe + formaterMontant(montant, devise);
}