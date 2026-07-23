import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChipCategorie } from "../components/ChipCategorie";
import { EtatVide } from "../components/EtatVide";
import { Pagination } from "../components/Pagination";
import { Skeleton } from "../components/Skeleton";
import { IconePlus, IconeTransactions } from "../components/layout/icones";
import {
  useComptesStore,
  useCategoriesStore,
  useTransactionsStore,
} from "../stores";
import { formaterDate, formaterMontantSigne } from "../lib/format";

/**
 * Historique paginé et filtré (GET /transactions).
 *
 * Les filtres vivent en état local, pas dans l'URL : le store porte déjà une
 * garde anti-course, et l'écran n'a pas vocation à être partagé par lien.
 * Toute modification de filtre remet la page à 1 — sinon on demanderait la
 * page 7 d'un résultat qui n'en compte que 2.
 */

const LIMITE = 20;

export function Historique() {
  const navigate = useNavigate();

  const comptes = useComptesStore((e) => e.comptes);
  const categories = useCategoriesStore((e) => e.categories);
  const chargerCategories = useCategoriesStore((e) => e.chargerSiNecessaire);

  const transactions = useTransactionsStore((e) => e.items);
  const page = useTransactionsStore((e) => e.page);
  const total = useTransactionsStore((e) => e.total);
  const chargement = useTransactionsStore((e) => e.chargement);
  const erreur = useTransactionsStore((e) => e.erreur);
  const definirFiltres = useTransactionsStore((e) => e.definirFiltres);
  const allerPage = useTransactionsStore((e) => e.allerPage);

  const [compteId, setCompteId] = useState("");
  const [categorieId, setCategorieId] = useState("");
  const [du, setDu] = useState("");
  const [au, setAu] = useState("");

  // Sans état dérivé mis à jour dans un effet : une liste vide pendant le
  // chargement initial affiche le squelette, tandis que les rechargements
  // d'une liste déjà chargée conservent son contenu et l'estompent.
  const premierChargement = chargement && transactions.length === 0;

  useEffect(() => {
    void chargerCategories();
  }, [chargerCategories]);

  useEffect(() => {
    // `definirFiltres` remet elle-même la page à 1.
    void definirFiltres({
      // Filtres vides omis : l'API les traiterait comme des valeurs invalides.
      ...(compteId ? { compteId } : {}),
      ...(categorieId ? { categorieId } : {}),
      ...(du ? { du } : {}),
      ...(au ? { au } : {}),
    });
  }, [definirFiltres, compteId, categorieId, du, au]);

  function filtrer(appliquer: () => void) {
    appliquer();
  }

  const filtresActifs = compteId !== "" || categorieId !== "" || du !== "" || au !== "";

  function reinitialiser() {
    setCompteId("");
    setCategorieId("");
    setDu("");
    setAu("");
  }

  const nomsCategories = useMemo(() => {
    const table = new Map<string, string>();
    for (const c of categories ?? []) table.set(c.id, c.nom);
    return table;
  }, [categories]);

  const nomsComptes = useMemo(() => {
    const table = new Map<string, string>();
    for (const c of comptes ?? []) table.set(c.id, c.nom);
    return table;
  }, [comptes]);

  const deviseDe = (id: string) => comptes?.find((c) => c.id === id)?.devise ?? "XOF";

  return (
    <>
      <div className="afi-page-tete">
        <h2 className="afi-h2">Transactions</h2>
        <button
          type="button"
          className="afi-btn"
          onClick={() => navigate("/transactions/nouvelle")}
        >
          <IconePlus />
          Nouvelle
        </button>
      </div>

      <div className="afi-filtres">
        <div className="afi-filtre">
          <span className="afi-filtre__label">Compte</span>
          <select
            aria-label="Filtrer par compte"
            value={compteId}
            onChange={(e) => filtrer(() => setCompteId(e.target.value))}
          >
            <option value="">Tous</option>
            {(comptes ?? []).map((c) => (
              <option key={c.id} value={c.id}>
                {c.nom}
              </option>
            ))}
          </select>
        </div>

        <div className="afi-filtre">
          <span className="afi-filtre__label">Catégorie</span>
          <select
            aria-label="Filtrer par catégorie"
            value={categorieId}
            onChange={(e) => filtrer(() => setCategorieId(e.target.value))}
          >
            <option value="">Toutes</option>
            {(categories ?? []).map((c) => (
              <option key={c.id} value={c.id}>
                {c.nom}
              </option>
            ))}
          </select>
        </div>

        <div className="afi-filtre">
          <span className="afi-filtre__label">Du</span>
          <input
            type="date"
            aria-label="Date de début"
            value={du}
            max={au || undefined}
            onChange={(e) => filtrer(() => setDu(e.target.value))}
          />
        </div>

        <div className="afi-filtre">
          <span className="afi-filtre__label">Au</span>
          <input
            type="date"
            aria-label="Date de fin"
            value={au}
            min={du || undefined}
            onChange={(e) => filtrer(() => setAu(e.target.value))}
          />
        </div>

        {filtresActifs && (
          <button type="button" className="afi-filtre afi-filtre--reinit" onClick={reinitialiser}>
            Réinitialiser
          </button>
        )}
      </div>

      <div className="afi-carte">
        {erreur ? (
          <div className="afi-bandeau-erreur">{erreur}</div>
        ) : chargement && premierChargement ? (
          <SqueletteTable />
        ) : transactions.length === 0 ? (
          <EtatVide
            titre={filtresActifs ? "Aucun résultat" : "Aucune transaction"}
            description={
              filtresActifs
                ? "Aucune transaction ne correspond à ces filtres. Essayez d'élargir la période ou de retirer un filtre."
                : "Enregistrez votre premier mouvement pour voir votre historique se remplir."
            }
            action={
              filtresActifs ? (
                <button type="button" className="afi-btn-ghost" onClick={reinitialiser}>
                  Réinitialiser les filtres
                </button>
              ) : (
                <button
                  type="button"
                  className="afi-btn"
                  onClick={() => navigate("/transactions/nouvelle")}
                >
                  <IconePlus />
                  Nouvelle transaction
                </button>
              )
            }
          />
        ) : (
          <>
            {/* Opacité pendant un rechargement : la liste reste lisible,
                sans le clignotement d'un squelette à chaque changement de page. */}
            <div style={{ opacity: chargement ? 0.55 : 1, transition: "opacity .15s" }}>
              <table className="afi-tbl">
                <thead>
                  <tr>
                    <th>Libellé</th>
                    <th>Catégorie</th>
                    <th>Compte</th>
                    <th>Date</th>
                    <th className="afi-tbl__droite">Montant</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((t) => (
                    <tr
                      key={t.id}
                      className="afi-tr"
                      tabIndex={0}
                      role="link"
                      onClick={() => navigate(`/transactions/${t.id}`)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") navigate(`/transactions/${t.id}`);
                      }}
                    >
                      <td>
                        <div className="afi-txnom">
                          <span className="afi-txic">
                            <IconeTransactions taille={18} />
                          </span>
                          <span className="afi-txlibelle">
                            {t.libelle}
                            {t.pointee && <span className="afi-pointee" title="Pointée" />}
                            {t.note && <div className="afi-tbl__note">{t.note}</div>}
                          </span>
                        </div>
                      </td>
                      <td>
                        {t.categorieId ? (
                          <ChipCategorie
                            nom={nomsCategories.get(t.categorieId) ?? "Catégorie"}
                          />
                        ) : (
                          <span style={{ color: "var(--texte-faible)" }}>—</span>
                        )}
                      </td>
                      <td style={{ color: "var(--texte-doux)" }}>
                        {nomsComptes.get(t.compteId) ?? "—"}
                      </td>
                      <td style={{ color: "var(--texte-doux)" }}>
                        {formaterDate(t.dateOperation)}
                      </td>
                      <td
                        className={
                          "afi-montant" + (t.type === "REVENU" ? " afi-montant--positif" : "")
                        }
                      >
                        {formaterMontantSigne(t.montant, t.type, deviseDe(t.compteId))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Pagination page={page} limite={LIMITE} total={total} onChange={(p) => void allerPage(p)} />
          </>
        )}
      </div>
    </>
  );
}

/** Squelette au premier chargement uniquement. */
function SqueletteTable() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18, padding: "8px 0" }}>
      {Array.from({ length: 6 }, (_, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 13 }}>
          <Skeleton largeur={40} hauteur={40} rayon={12} />
          <Skeleton largeur="30%" />
          <Skeleton largeur={110} hauteur={26} rayon={999} />
          <div style={{ flex: 1 }} />
          <Skeleton largeur={90} />
        </div>
      ))}
    </div>
  );
}