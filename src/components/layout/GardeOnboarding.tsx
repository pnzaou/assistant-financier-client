import { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useComptesStore } from "../../stores";

/**
 * Aucun compte n'est créé automatiquement à l'inscription (décision backend).
 * Tant que `GET /comptes` renvoie une liste vide, l'application n'a rien à
 * afficher : on renvoie vers l'onboarding plutôt que de montrer une coquille
 * et un dashboard vides.
 *
 * Placée AU-DESSUS d'AppShell dans l'arbre de routes, pour que l'onboarding
 * s'affiche en carte centrée plein écran, sans sidebar.
 *
 * `comptes === null` signifie « jamais chargé » et se distingue de `[]`
 * (« l'utilisateur n'a aucun compte ») : c'est ce qui évite de rediriger vers
 * l'onboarding pendant que la requête est en vol.
 */

export function GardeOnboarding() {
  const comptes = useComptesStore((e) => e.comptes);
  const erreur = useComptesStore((e) => e.erreur);
  const chargerSiNecessaire = useComptesStore((e) => e.chargerSiNecessaire);
  const charger = useComptesStore((e) => e.charger);
  const { pathname } = useLocation();

  useEffect(() => {
    void chargerSiNecessaire();
  }, [chargerSiNecessaire]);

  if (comptes === null) {
    // Le chargement a échoué : sans la liste des comptes, impossible de savoir
    // s'il faut onboarder. On propose de réessayer plutôt que d'afficher un
    // écran vide indéfiniment.
    if (erreur) {
      return (
        <div
          style={{
            minHeight: "100vh",
            background: "var(--fond-app)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "var(--esp-2)",
            padding: "var(--esp-2)",
            textAlign: "center",
          }}
        >
          <p style={{ color: "var(--erreur)", margin: 0, fontSize: 15 }}>{erreur}</p>
          <button
            type="button"
            onClick={() => void charger()}
            style={{
              height: 44,
              padding: "0 22px",
              border: "1.5px solid var(--encre)",
              borderRadius: "var(--rayon-pill)",
              background: "var(--blanc)",
              color: "var(--encre)",
              font: "600 14px var(--police)",
              cursor: "pointer",
            }}
          >
            Réessayer
          </button>
        </div>
      );
    }
    return <div className="afi-chargement-plein" aria-busy="true" />;
  }

  const aucunCompte = comptes.length === 0;
  const surOnboarding = pathname === "/bienvenue";

  if (aucunCompte && !surOnboarding) {
    return <Navigate to="/bienvenue" replace />;
  }

  // Compte créé : on ne laisse pas revenir sur l'onboarding par l'URL.
  if (!aucunCompte && surOnboarding) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}