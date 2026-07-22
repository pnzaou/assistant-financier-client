import { useEffect, type ReactNode } from "react";
import { useAuthStore } from "../stores/authStore";
import type { DonneesInscription, IdentifiantsConnexion } from "../lib/types";

// ⚠️ Compatibilité. L'état d'auth vit désormais dans `stores/authStore.ts` :
// il est accessible partout, sans Provider ni prop drilling.
//
//   const utilisateur = useUtilisateur();          // n'importe quel composant
//   const { deconnecter } = useAuthStore.getState();  // hors composant
//
// Ce fichier ne reste que pour les écrans déjà écrits avec `useAuth()`.
// Pour tout nouveau code : importer depuis `../stores`.

/**
 * Ne fournit plus de contexte : amorce simplement la session au démarrage
 * (GET /auth/moi) pour savoir si le cookie httpOnly est encore valide.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    // StrictMode monte les effets deux fois en dev : le store se charge de ne
    // pas empiler deux appels (`chargement` est déjà à true au départ).
    void useAuthStore.getState().chargerSession();
  }, []);

  return <>{children}</>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const utilisateur = useAuthStore((s) => s.utilisateur);
  const chargement = useAuthStore((s) => s.chargement);
  const connecter = useAuthStore((s) => s.connecter);
  const inscrire = useAuthStore((s) => s.inscrire);
  const deconnecter = useAuthStore((s) => s.deconnecter);

  return {
    utilisateur,
    chargement,
    login: (identifiants: IdentifiantsConnexion) => connecter(identifiants),
    register: (donnees: DonneesInscription) => inscrire(donnees),
    logout: () => deconnecter(),
  };
}
