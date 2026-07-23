import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "../stores";

/**
 * Garde des routes privées, version « route parente » (Outlet).
 *
 * ⚠️ Changement de signature : plus de `children`. L'usage
 * `<ProtectedRoute><Accueil /></ProtectedRoute>` est remplacé par
 * `<Route element={<ProtectedRoute />}>` (voir App.tsx).
 *
 * On attend la fin du chargement avant de décider : sinon un rafraîchissement
 * renverrait vers /connexion pendant que `GET /auth/moi` est en vol.
 */

export function ProtectedRoute() {
  const utilisateur = useAuthStore((e) => e.utilisateur);
  const chargement = useAuthStore((e) => e.chargement);
  const location = useLocation();

  if (chargement) {
    return <div className="afi-chargement-plein" aria-busy="true" />;
  }

  if (!utilisateur) {
    // `state` permet de revenir sur la page demandée après connexion.
    return <Navigate to="/connexion" replace state={{ depuis: location.pathname }} />;
  }

  return <Outlet />;
}