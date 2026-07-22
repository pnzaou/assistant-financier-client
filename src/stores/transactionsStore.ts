import { create } from "zustand";
import * as transactionsApi from "../lib/transactions";
import { messageErreur } from "../lib/api";
import { enregistrerReinitialisation } from "./authStore";
import { invaliderDashboard } from "./dashboardStore";
import { rafraichirComptes } from "./comptesStore";
import type {
  CreationTransaction,
  FiltresTransactions,
  ModificationTransaction,
  Transaction,
} from "../lib/types";

type FiltresActifs = Omit<FiltresTransactions, "page" | "limite">;

interface EtatTransactions {
  items: Transaction[];
  page: number;
  limite: number;
  total: number;
  filtres: FiltresActifs;
  chargement: boolean;
  /** Vrai pendant une création/modification/suppression (≠ chargement de la liste). */
  envoi: boolean;
  erreur: string | null;

  charger: () => Promise<void>;
  /** Remplace les filtres et repart à la page 1. */
  definirFiltres: (filtres: FiltresActifs) => Promise<void>;
  allerPage: (page: number) => Promise<void>;

  creer: (donnees: CreationTransaction) => Promise<Transaction>;
  modifier: (id: string, donnees: ModificationTransaction) => Promise<Transaction>;
  supprimer: (id: string) => Promise<void>;

  reinitialiser: () => void;
}

const etatInitial = {
  items: [],
  page: 1,
  limite: 20,
  total: 0,
  filtres: {} as FiltresActifs,
  chargement: false,
  envoi: false,
  erreur: null,
};

// Garde anti-course : si l'utilisateur change de filtre pendant qu'une requête
// est en vol, la réponse de l'ancienne requête ne doit pas écraser la nouvelle.
let requeteCourante = 0;

// Un compte a changé de solde → les écrans qui l'affichent sont périmés.
async function invaliderSoldesEtComptes(): Promise<void> {
  await Promise.all([invaliderDashboard(), rafraichirComptes()]);
}

export const useTransactionsStore = create<EtatTransactions>()((set, get) => ({
  ...etatInitial,

  charger: async () => {
    const idRequete = ++requeteCourante;
    const { page, limite, filtres } = get();
    set({ chargement: true, erreur: null });
    try {
      const { transactions } = await transactionsApi.listerTransactions({
        ...filtres,
        page,
        limite,
      });
      if (idRequete !== requeteCourante) return; // réponse périmée
      set({
        items: transactions.items,
        page: transactions.page,
        limite: transactions.limite,
        total: transactions.total,
        chargement: false,
      });
    } catch (err) {
      if (idRequete !== requeteCourante) return;
      set({
        chargement: false,
        erreur: messageErreur(err, "Impossible de charger vos transactions."),
      });
    }
  },

  definirFiltres: async (filtres) => {
    set({ filtres, page: 1 });
    await get().charger();
  },

  allerPage: async (page) => {
    set({ page });
    await get().charger();
  },

  creer: async (donnees) => {
    set({ envoi: true });
    try {
      // Erreurs volontairement non capturées : le formulaire a besoin du 422.
      const { transaction } = await transactionsApi.creerTransaction(donnees);
      // On recharge plutôt que d'insérer en tête : la nouvelle transaction n'a
      // sa place dans la liste que si elle satisfait les filtres et le tri.
      await get().charger();
      await invaliderSoldesEtComptes();
      return transaction;
    } finally {
      set({ envoi: false });
    }
  },

  modifier: async (id, donnees) => {
    set({ envoi: true });
    try {
      const { transaction } = await transactionsApi.modifierTransaction(id, donnees);
      set((etat) => ({
        items: etat.items.map((t) => (t.id === id ? transaction : t)),
      }));
      // Le montant change les soldes ; la date et la catégorie déplacent la
      // ligne dans la répartition du dashboard. Cocher "pointée" ou corriger un
      // libellé ne touche à rien → on évite les requêtes inutiles.
      const impacteLesTotaux =
        donnees.montant !== undefined ||
        donnees.dateOperation !== undefined ||
        donnees.categorieId !== undefined;
      if (impacteLesTotaux) await invaliderSoldesEtComptes();
      return transaction;
    } finally {
      set({ envoi: false });
    }
  },

  supprimer: async (id) => {
    set({ envoi: true });
    try {
      await transactionsApi.supprimerTransaction(id);
      set((etat) => ({
        items: etat.items.filter((t) => t.id !== id),
        total: Math.max(0, etat.total - 1),
      }));
      await invaliderSoldesEtComptes();
    } finally {
      set({ envoi: false });
    }
  },

  reinitialiser: () => {
    requeteCourante++; // annule les réponses en vol
    set(etatInitial);
  },
}));

enregistrerReinitialisation(() => useTransactionsStore.getState().reinitialiser());

// ── Sélecteurs ───────────────────────────────────────────────────
export const useTransactions = () => useTransactionsStore((s) => s.items);
export const useNombrePages = () =>
  useTransactionsStore((s) => Math.max(1, Math.ceil(s.total / s.limite)));
