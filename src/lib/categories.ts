import { api } from "./api";
import type { Categorie, TypeCategorie } from "./types";

/**
 * Catégories système (17, pré-remplies côté serveur) — lecture seule.
 * `type` optionnel : sans lui, on récupère DEPENSE + REVENU.
 */
export function listerCategories(type?: TypeCategorie) {
  return api.get<{ categories: Categorie[] }>("/categories", { type });
}
