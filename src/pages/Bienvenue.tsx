import { useNavigate } from "react-router-dom";
import { CreerCompte } from "./CreerCompte";

/**
 * Onboarding : premier compte de l'utilisateur.
 *
 * Rendu HORS d'AppShell (carte centrée plein écran) : tant qu'aucun compte
 * n'existe, la sidebar n'aurait rien à montrer.
 *
 * `comptesStore.creer` ajoute le compte à la liste en mémoire ; GardeOnboarding
 * bascule alors toute seule, sans requête supplémentaire.
 */

export function Bienvenue() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--fond)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "var(--esp-4) var(--esp-2)",
      }}
    >
      <CreerCompte premierCompte onCree={() => navigate("/", { replace: true })} />
    </div>
  );
}