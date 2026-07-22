import { create } from "zustand";
import * as categoriesApi from "../lib/categories";
import { messageErreur } from "../lib/api";
import { enregistrerReinitialisation } from "./authStore";
import type { Categorie } from "../lib/types";

// Les catégories sont des données système qui ne bougent pas pendant une
// session : on les charge une fois et on garde. Les listes dérivées (dépenses,
// revenus, index par id) sont calculées AU CHARGEMENT et stockées telles
// quelles — un sélecteur qui ferait `.filter()` renverrait un nouveau tableau
// à chaque rendu, ce que Zustand v5 interprète comme un changement d'état
// (boucle de re-rendus).

interface EtatCategories {
  categories: Categorie[] | null;
  depenses: Categorie[];
  revenus: Categorie[];
  parId: Record<string, Categorie>;
  chargement: boolean;
  erreur: string | null;

  charger: () => Promise<void>;
  chargerSiNecessaire: () => Promise<void>;
  reinitialiser: () => void;
}

const etatInitial = {
  categories: null,
  depenses: [],
  revenus: [],
  parId: {},
  chargement: false,
  erreur: null,
} satisfies Omit<EtatCategories, "charger" | "chargerSiNecessaire" | "reinitialiser">;

export const useCategoriesStore = create<EtatCategories>()((set, get) => ({
  ...etatInitial,

  charger: async () => {
    set({ chargement: true, erreur: null });
    try {
      const { categories } = await categoriesApi.listerCategories();
      set({
        categories,
        depenses: categories.filter((c) => c.type === "DEPENSE"),
        revenus: categories.filter((c) => c.type === "REVENU"),
        parId: Object.fromEntries(categories.map((c) => [c.id, c])),
        chargement: false,
      });
    } catch (err) {
      set({
        chargement: false,
        erreur: messageErreur(err, "Impossible de charger les catégories."),
      });
    }
  },

  chargerSiNecessaire: async () => {
    const { categories, chargement } = get();
    if (categories !== null || chargement) return;
    await get().charger();
  },

  reinitialiser: () => set(etatInitial),
}));

enregistrerReinitialisation(() => useCategoriesStore.getState().reinitialiser());

// ── Sélecteurs ───────────────────────────────────────────────────
export const useCategories = () => useCategoriesStore((s) => s.categories);
export const useCategoriesDepense = () => useCategoriesStore((s) => s.depenses);
export const useCategoriesRevenu = () => useCategoriesStore((s) => s.revenus);

/** Nom + icône d'une catégorie à partir de son id (pour afficher une transaction). */
export const useCategorie = (id: string | null) =>
  useCategoriesStore((s) => (id ? (s.parId[id] ?? null) : null));
