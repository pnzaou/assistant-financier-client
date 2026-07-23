import { useNavigate } from "react-router-dom";
import { CreerCompte } from "./CreerCompte";

/**
 * Ajout d'un compte depuis l'application (route /comptes/nouveau).
 * Réutilise CreerCompte en mode « pas le premier » ; le gabarit vient
 * d'AppShell, d'où l'absence de mise en page ici.
 */

export function NouveauCompte() {
  const navigate = useNavigate();

  return <CreerCompte onCree={() => navigate("/comptes", { replace: true })} />;
}