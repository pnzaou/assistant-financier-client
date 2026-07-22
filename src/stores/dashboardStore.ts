import { create } from "zustand";
import * as dashboardApi from "../lib/dashboard";
import { messageErreur } from "../lib/api";
import { enregistrerReinitialisation } from "./authStore";
import type { DepenseParCategorie, PeriodeDashboard, Soldes } from "../lib/types";

interface EtatDashboard {
  soldes: Soldes | null;
  /** Dépenses agrégées sur `periode` (par défaut : le mois en cours, décidé par le serveur). */
  depenses: DepenseParCategorie[] | null;
  periode: PeriodeDashboard;
  chargement: boolean;
  erreur: string | null;

  /** Charge soldes + dépenses en parallèle (écran d'accueil). */
  charger: () => Promise<void>;
  chargerSiNecessaire: () => Promise<void>;
  /** Change la période analysée et recharge les dépenses. */
  definirPeriode: (periode: PeriodeDashboard) => Promise<void>;
  reinitialiser: () => void;
}

const etatInitial = {
  soldes: null,
  depenses: null,
  periode: {} as PeriodeDashboard,
  chargement: false,
  erreur: null,
};

export const useDashboardStore = create<EtatDashboard>()((set, get) => ({
  ...etatInitial,

  charger: async () => {
    set({ chargement: true, erreur: null });
    try {
      const [reponseSoldes, reponseDepenses] = await Promise.all([
        dashboardApi.obtenirSoldes(),
        dashboardApi.obtenirDepensesParCategorie(get().periode),
      ]);
      set({
        soldes: reponseSoldes.soldes,
        depenses: reponseDepenses.depenses,
        chargement: false,
      });
    } catch (err) {
      set({
        chargement: false,
        erreur: messageErreur(err, "Impossible de charger le tableau de bord."),
      });
    }
  },

  chargerSiNecessaire: async () => {
    const { soldes, chargement } = get();
    if (soldes !== null || chargement) return;
    await get().charger();
  },

  definirPeriode: async (periode) => {
    set({ periode });
    await get().charger();
  },

  reinitialiser: () => set(etatInitial),
}));

enregistrerReinitialisation(() => useDashboardStore.getState().reinitialiser());

/**
 * Une transaction a été créée/modifiée/supprimée : soldes et répartition des
 * dépenses sont périmés. On ne recharge que si le dashboard a déjà été affiché
 * — inutile de tirer deux requêtes pour un écran que personne ne regarde.
 */
export async function invaliderDashboard(): Promise<void> {
  const { soldes, charger } = useDashboardStore.getState();
  if (soldes === null) return;
  await charger();
}

// ── Sélecteurs ───────────────────────────────────────────────────
export const useSoldes = () => useDashboardStore((s) => s.soldes);
export const useDepensesParCategorie = () => useDashboardStore((s) => s.depenses);
export const useTotalGlobal = () => useDashboardStore((s) => s.soldes?.totalGlobal ?? 0);
