import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import {Topbar } from "./Topbar";

/**
 * Gabarit de l'application connectée : sidebar fixe + topbar + zone de contenu.
 *
 * Utilisé comme route parente (`<Route element={<AppShell />}>`) : chaque page
 * rend son contenu dans l'`<Outlet>` sans redéclarer le gabarit.
 *
 * Ne s'applique PAS aux écrans d'auth ni à l'onboarding « premier compte »,
 * qui restent en carte centrée plein écran (AuthLayout).
 *
 * Le titre de la topbar est dérivé du chemin. Une page ayant besoin d'un titre
 * dynamique peut poser son propre <Topbar> ; il suffit alors de retirer son
 * entrée de TITRES.
 */

type Titre = { titre: string; sousTitre?: string };

const TITRES: Record<string, Titre> = {
  "/": { titre: "Tableau de bord", sousTitre: "Vue d'ensemble de vos finances" },
  "/transactions": { titre: "Transactions", sousTitre: "Historique complet de vos mouvements" },
  "/transactions/nouvelle": { titre: "Nouvelle transaction", sousTitre: "Ajouter un mouvement" },
  "/comptes": { titre: "Comptes", sousTitre: "Vos comptes et leurs soldes" },
  "/comptes/nouveau": { titre: "Nouveau compte", sousTitre: "Ajouter un compte à suivre" },
};

/** Correspondance par préfixe pour les routes à paramètre (/transactions/:id). */
function titrePour(chemin: string): Titre {
  const exact = TITRES[chemin];
  if (exact) return exact;

  if (chemin.startsWith("/transactions/")) {
    return { titre: "Transaction", sousTitre: "Détail et édition" };
  }
  return { titre: "AFI", sousTitre: "Assistant financier" };
}

export function AppShell() {
  const { pathname } = useLocation();
  const { titre, sousTitre } = titrePour(pathname);

  return (
    <div className="afi-app">
      <Sidebar />
      <main className="afi-main">
        <Topbar titre={titre} sousTitre={sousTitre} />
        <div className="afi-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}