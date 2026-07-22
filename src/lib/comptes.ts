import { api } from "./api";
import type { Compte, CreationCompte } from "./types";

export function listerComptes() {
  return api.get<{ comptes: Compte[] }>("/comptes");
}

export function creerCompte(donnees: CreationCompte) {
  return api.post<{ compte: Compte }>("/comptes", donnees);
}
