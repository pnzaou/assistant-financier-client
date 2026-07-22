import { api } from "./api";
import type { DepenseParCategorie, PeriodeDashboard, Soldes } from "./types";

export function obtenirSoldes() {
  return api.get<{ soldes: Soldes }>("/dashboard/soldes");
}

/** Sans période : le mois calendaire en cours. Ne renvoie que les DEPENSE. */
export function obtenirDepensesParCategorie(periode: PeriodeDashboard = {}) {
  return api.get<{ depenses: DepenseParCategorie[] }>("/dashboard/depenses-par-categorie", {
    ...periode,
  });
}
