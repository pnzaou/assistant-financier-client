import { create } from "zustand";
import * as authApi from "../lib/auth";
import { definirGestionnaireSessionExpiree, messageErreur } from "../lib/api";
import type { DonneesInscription, IdentifiantsConnexion, Utilisateur } from "../lib/types";

interface EtatAuth {
  /** `null` = pas connecté. Source de vérité de l'utilisateur pour toute l'app. */
  utilisateur: Utilisateur | null;
  /** `true` tant que la session initiale n'a pas été vérifiée — évite un flash vers /connexion. */
  chargement: boolean;
  erreur: string | null;

  /** À appeler une fois au démarrage de l'app (GET /auth/moi). */
  chargerSession: () => Promise<void>;
  connecter: (identifiants: IdentifiantsConnexion) => Promise<void>;
  inscrire: (donnees: DonneesInscription) => Promise<void>;
  deconnecter: () => Promise<void>;
  /** Après vérification d'email : recharge le profil pour rafraîchir `emailVerifie`. */
  rafraichirProfil: () => Promise<void>;
  /** Vide la session côté client sans appeler le serveur (token définitivement mort). */
  vider: () => void;
}

export const useAuthStore = create<EtatAuth>()((set) => ({
  utilisateur: null,
  chargement: true,
  erreur: null,

  chargerSession: async () => {
    try {
      const { utilisateur } = await authApi.moi();
      set({ utilisateur, chargement: false, erreur: null });
    } catch {
      // 401 attendu quand personne n'est connecté : ce n'est pas une erreur à afficher.
      set({ utilisateur: null, chargement: false, erreur: null });
    }
  },

  connecter: async (identifiants) => {
    // On laisse l'ApiError remonter : les pages ont besoin de `erreurs` pour
    // afficher les messages champ par champ.
    const { utilisateur } = await authApi.connecter(identifiants);
    set({ utilisateur, chargement: false, erreur: null });
  },

  inscrire: async (donnees) => {
    const { utilisateur } = await authApi.inscrire(donnees);
    set({ utilisateur, chargement: false, erreur: null });
  },

  deconnecter: async () => {
    try {
      await authApi.deconnecter();
    } finally {
      // Quoi qu'il arrive côté serveur, on déconnecte localement.
      set({ utilisateur: null, erreur: null });
      viderStoresDonnees();
    }
  },

  rafraichirProfil: async () => {
    try {
      const { utilisateur } = await authApi.moi();
      set({ utilisateur, erreur: null });
    } catch (err) {
      set({ erreur: messageErreur(err, "Impossible de recharger votre profil.") });
    }
  },

  vider: () => {
    set({ utilisateur: null, chargement: false, erreur: null });
    viderStoresDonnees();
  },
}));

// Les stores de données s'enregistrent ici (voir stores/index.ts) pour être
// remis à zéro à la déconnexion : sans ça, les comptes de l'utilisateur A
// resteraient affichés une fraction de seconde à l'utilisateur B.
type Reinitialisation = () => void;
const storesAReinitialiser = new Set<Reinitialisation>();

export function enregistrerReinitialisation(reset: Reinitialisation): void {
  storesAReinitialiser.add(reset);
}

function viderStoresDonnees(): void {
  for (const reset of storesAReinitialiser) reset();
}

// Quand le refresh token expire au milieu d'une requête, api.ts prévient ici :
// l'utilisateur repasse à `null` et <ProtectedRoute> redirige vers /connexion.
definirGestionnaireSessionExpiree(() => {
  useAuthStore.getState().vider();
});

// ── Sélecteurs prêts à l'emploi ──────────────────────────────────
// À utiliser plutôt que `useAuthStore()` nu : le composant ne se re-rend que
// si CE morceau change.
export const useUtilisateur = () => useAuthStore((s) => s.utilisateur);
export const useEstConnecte = () => useAuthStore((s) => s.utilisateur !== null);
export const useChargementAuth = () => useAuthStore((s) => s.chargement);
