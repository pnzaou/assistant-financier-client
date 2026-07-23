import { NavLink, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../stores";
import {
  GlypheAfi,
  IconeAssistant,
  IconeComptes,
  IconeDeconnexion,
  IconePlus,
  IconeTableauDeBord,
  IconeTransactions,
} from "./icones";

/**
 * Sidebar sombre fixe (264px), reprise de la maquette « App AFI ».
 *
 * L'entrée Assistant relève de la roadmap et n'a aucune API. Elle est affichée
 * désactivée avec la mention « Bientôt » plutôt que masquée : la maquette reste
 * lisible, sans promettre un écran vide.
 */

type EntreeNav = {
  chemin: string;
  libelle: string;
  icone: React.ReactNode;
  /** true = fonctionnalité de la roadmap, non cliquable */
  bientot?: boolean;
};

const ENTREES: EntreeNav[] = [
  { chemin: "/", libelle: "Tableau de bord", icone: <IconeTableauDeBord /> },
  { chemin: "/transactions", libelle: "Transactions", icone: <IconeTransactions /> },
  { chemin: "/comptes", libelle: "Comptes", icone: <IconeComptes /> },
  { chemin: "/assistant", libelle: "Assistant", icone: <IconeAssistant />, bientot: true },
];

/** Initiales de l'avatar : « Perrin Nzaou » → « PN ». */
function initiales(prenom?: string, nom?: string): string {
  const p = prenom?.trim()?.[0] ?? "";
  const n = nom?.trim()?.[0] ?? "";
  return (p + n).toUpperCase() || "?";
}

export function Sidebar() {
  const utilisateur = useAuthStore((e) => e.utilisateur);
  const deconnecter = useAuthStore((e) => e.deconnecter);
  const navigate = useNavigate();

  async function gererDeconnexion() {
    await deconnecter();
    navigate("/connexion", { replace: true });
  }

  return (
    <aside className="afi-side">
      <NavLink to="/" className="afi-side__brand">
        <div className="afi-side__mark">
          <GlypheAfi />
        </div>
        <div className="afi-side__wm">
          AFI
          <span>Assistant financier</span>
        </div>
      </NavLink>

      <div className="afi-side__label">Menu</div>

      <nav>
        {ENTREES.map((entree) =>
          entree.bientot ? (
            <div
              key={entree.chemin}
              className="afi-navi afi-navi--inactif"
              aria-disabled="true"
              title="Bientôt disponible"
            >
              {entree.icone}
              <span className="afi-navi__libelle">{entree.libelle}</span>
              <span className="afi-navi__bientot">Bientôt</span>
            </div>
          ) : (
            <NavLink
              key={entree.chemin}
              to={entree.chemin}
              end={entree.chemin === "/"}
              className={({ isActive }) => "afi-navi" + (isActive ? " afi-navi--actif" : "")}
            >
              {entree.icone}
              <span className="afi-navi__libelle">{entree.libelle}</span>
            </NavLink>
          ),
        )}
      </nav>

      <NavLink to="/transactions/nouvelle" className="afi-side__cta">
        <IconePlus />
        <span className="afi-side__cta-libelle">Nouvelle transaction</span>
      </NavLink>

      <div className="afi-side__spacer" />

      <div className="afi-side__user">
        <div className="afi-side__ava">{initiales(utilisateur?.prenom, utilisateur?.nom)}</div>
        <div className="afi-side__ident">
          <div className="afi-side__nom">
            {utilisateur ? `${utilisateur.prenom} ${utilisateur.nom}` : "—"}
          </div>
          <div className="afi-side__email">{utilisateur?.email ?? ""}</div>
        </div>
        <button
          type="button"
          className="afi-side__deconnexion"
          onClick={gererDeconnexion}
          title="Se déconnecter"
          aria-label="Se déconnecter"
        >
          <IconeDeconnexion />
        </button>
      </div>
    </aside>
  );
}