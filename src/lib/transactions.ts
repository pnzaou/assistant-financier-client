import { api } from "./api";
import type {
  CreationTransaction,
  FiltresTransactions,
  ModificationTransaction,
  Page,
  Transaction,
} from "./types";

/**
 * Saisie manuelle. Laisser `categorieId` vide fait deviner la catégorie par le
 * serveur à partir du libellé ("yango" → Transport, "loyer" → Logement…) ;
 * la catégorie devinée revient dans la réponse et reste corrigeable via PATCH.
 */
export function creerTransaction(donnees: CreationTransaction) {
  return api.post<{ transaction: Transaction }>("/transactions", donnees);
}

export function listerTransactions(filtres: FiltresTransactions = {}) {
  return api.get<{ transactions: Page<Transaction> }>("/transactions", { ...filtres });
}

export function obtenirTransaction(id: string) {
  return api.get<{ transaction: Transaction }>(`/transactions/${id}`);
}

export function modifierTransaction(id: string, donnees: ModificationTransaction) {
  return api.patch<{ transaction: Transaction }>(`/transactions/${id}`, donnees);
}

export function supprimerTransaction(id: string) {
  return api.delete<void>(`/transactions/${id}`);
}
