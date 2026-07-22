import { create } from "zustand";
import * as comptesApi from "../lib/comptes";
import { messageErreur } from "../lib/api";
import { enregistrerReinitialisation } from "./authStore";
import type { Compte, CreationCompte } from "../lib/types";

interface EtatComptes {
  /** `null` = jamais chargé (à distinguer de `[]` = l'utilisateur n'a aucun compte). */
  comptes: Compte[] | null;
  chargement: boolean;
  erreur: string | null;

  charger: () => Promise<void>;
  /** Ne recharge que si ce n'est pas déjà fait — pour les écrans qui ont juste besoin de la liste. */
  chargerSiNecessaire: () => Promise<void>;
  creer: (donnees: CreationCompte) => Promise<Compte>;
  reinitialiser: () => void;
}

const etatInitial = {
  comptes: null,
  chargement: false,
  erreur: null,
} satisfies Pick<EtatComptes, "comptes" | "chargement" | "erreur">;

export const useComptesStore = create<EtatComptes>()((set, get) => ({
  ...etatInitial,

  charger: async () => {
    set({ chargement: true, erreur: null });
    try {
      const { comptes } = await comptesApi.listerComptes();
      set({ comptes, chargement: false });
    } catch (err) {
      set({
        chargement: false,
        erreur: messageErreur(err, "Impossible de charger vos comptes."),
      });
    }
  },

  chargerSiNecessaire: async () => {
    const { comptes, chargement } = get();
    if (comptes !== null || chargement) return;
    await get().charger();
  },

  creer: async (donnees) => {
    // Pas de try/catch : les erreurs 422 doivent remonter au formulaire.
    const { compte } = await comptesApi.creerCompte(donnees);
    set((etat) => ({ comptes: [...(etat.comptes ?? []), compte], erreur: null }));
    return compte;
  },

  reinitialiser: () => set(etatInitial),
}));

enregistrerReinitialisation(() => useComptesStore.getState().reinitialiser());

/**
 * Le solde d'un compte est recalculé par le serveur : après une transaction,
 * la liste en mémoire est périmée. On ne recharge que si elle avait déjà été
 * chargée (sinon on tirerait une requête pour un écran jamais ouvert).
 */
export async function rafraichirComptes(): Promise<void> {
  const { comptes, charger } = useComptesStore.getState();
  if (comptes === null) return;
  await charger();
}

// ── Sélecteurs ───────────────────────────────────────────────────
export const useComptes = () => useComptesStore((s) => s.comptes);
/** `true` uniquement une fois le chargement fait et la liste vide → écran d'onboarding. */
export const useAucunCompte = () => useComptesStore((s) => s.comptes?.length === 0);
