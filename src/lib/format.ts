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
export const LIBELLES_TYPE_COMPTE: Record<string, string> = {
  COURANT: "Compte courant",
  EPARGNE: "Épargne",
  CARTE_CREDIT: "Carte de crédit",
  ESPECES: "Espèces",
  INVESTISSEMENT: "Investissement",
  AUTRE: "Autre",
};