import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Donut, type PartDonut } from "../components/Donut";
import { couleurCategorie, PALETTE_CATEGORIES } from "../components/ChipCategorie";
import { EtatVide } from "../components/EtatVide";
import { Skeleton } from "../components/Skeleton";
import { IconeComptes, IconePlus, IconeTransactions } from "../components/layout/icones";
import {
  useAuthStore,
  useCategoriesStore,
  useComptesStore,
  useDashboardStore,
  useTransactionsStore,
} from "../stores";
import {
  formaterDate,
  formaterMontant,
  formaterMontantSigne,
  LIBELLES_TYPE_COMPTE,
} from "../lib/format";

/**
 * Tableau de bord (US4) : soldes par compte + répartition des dépenses.
 *
 * ⚠️ Contrainte API assumée : `totalGlobal` additionne des montants SANS
 * conversion de devise. On ne l'affiche donc que si tous les comptes partagent
 * la même devise ; sinon on affiche le nombre de comptes et un avertissement.
 */

export function Dashboard() {
  const navigate = useNavigate();

  const utilisateur = useAuthStore((e) => e.utilisateur);
  const comptes = useComptesStore((e) => e.comptes);
  const chargerCategories = useCategoriesStore((e) => e.chargerSiNecessaire);

  const soldes = useDashboardStore((e) => e.soldes);
  const depenses = useDashboardStore((e) => e.depenses);
  const chargement = useDashboardStore((e) => e.chargement);
  const erreur = useDashboardStore((e) => e.erreur);
  const chargerDashboard = useDashboardStore((e) => e.charger);
  const definirPeriode = useDashboardStore((e) => e.definirPeriode);

  const dernieres = useTransactionsStore((e) => e.items);
  const chargerTransactions = useTransactionsStore((e) => e.charger);

  const [du, setDu] = useState("");
  const [au, setAu] = useState("");

  useEffect(() => {
    void chargerCategories();
    void chargerDashboard();
    void chargerTransactions();
  }, [chargerCategories, chargerDashboard, chargerTransactions]);

  useEffect(() => {
    // Période vide = mois en cours (défaut appliqué par l'API).
    void definirPeriode(du || au ? { ...(du ? { du } : {}), ...(au ? { au } : {}) } : {});
  }, [definirPeriode, du, au]);

  const memeDevise = useMemo(() => {
    if (!comptes || comptes.length === 0) return null;
    const premiere = comptes[0].devise;
    return comptes.every((c) => c.devise === premiere) ? premiere : null;
  }, [comptes]);

  const parts: PartDonut[] = useMemo(
    () =>
      (depenses ?? []).map((d) => ({
        cle: d.categorieId ?? d.nomCategorie,
        libelle: d.nomCategorie,
        valeur: d.montantTotal,
      })),
    [depenses],
  );

  const totalDepense = parts.reduce((somme, p) => somme + p.valeur, 0);
  const deviseDe = (id: string) => comptes?.find((c) => c.id === id)?.devise ?? "XOF";
  const prenom = utilisateur?.prenom ?? "";

  const couleurPartLegende = (libelle: string, index: number): string => {
    const derivee = couleurCategorie(libelle) as typeof PALETTE_CATEGORIES[number];
    const positionDerivee = PALETTE_CATEGORIES.findIndex((couleur) => couleur === derivee);
    return positionDerivee === -1
      ? PALETTE_CATEGORIES[index % PALETTE_CATEGORIES.length]
      : derivee;
  };

  return (
    <>
      <div className="afi-salut">
        <h2 className="afi-h2">Bonjour{prenom ? `, ${prenom}` : ""}</h2>
        <p>Voici l'état de vos finances.</p>
      </div>

      {erreur && <div className="afi-bandeau-erreur">{erreur}</div>}

      {/* ── Soldes ─────────────────────────────────────────────── */}
      {!soldes || !comptes ? (
        <div className="afi-row">
          <Skeleton largeur={300} hauteur={172} rayon={22} />
          <Skeleton largeur={240} hauteur={172} rayon={20} />
          <Skeleton largeur={240} hauteur={172} rayon={20} />
        </div>
      ) : (
        <div className="afi-row">
          <div className="afi-totcard">
            <div>
              <p className="afi-kick" style={{ color: "rgba(255,255,204,.6)" }}>
                Solde total
              </p>
              <div className="afi-tot-amt">
                {memeDevise ? formaterMontant(soldes.totalGlobal, memeDevise) : "—"}
              </div>
              <div className="afi-badge-cur">
                {memeDevise
                  ? `${comptes.length} compte${comptes.length > 1 ? "s" : ""} · tous en ${memeDevise}`
                  : "Devises différentes — total non calculable"}
              </div>
            </div>
          </div>

          {soldes.comptes.map((s) => {
            const compte = comptes.find((c) => c.id === s.compteId);
            return (
              <div key={s.compteId} className="afi-carte afi-acct">
                <div className="afi-acct__tete">
                  <div>
                    <div className="afi-acct__nm">{compte?.nom ?? "Compte"}</div>
                    <div className="afi-acct__ty">
                      {compte ? LIBELLES_TYPE_COMPTE[compte.type] : "—"}
                    </div>
                  </div>
                  <span className="afi-ic-sq">
                    <IconeComptes taille={18} />
                  </span>
                </div>
                <div className="afi-acct__bal">
                  {formaterMontant(s.solde, compte?.devise ?? "XOF")}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Répartition + dernières transactions ───────────────── */}
      <div className="afi-grille-bas">
        <div className="afi-carte">
          <div className="afi-carte__tete">
            <h3 className="afi-carte__titre">Dépenses par catégorie</h3>
            <div style={{ display: "flex", gap: "var(--esp-2)", alignItems: "center" }}>
              <input
                type="date"
                aria-label="Début de période"
                className="afi-periode"
                value={du}
                max={au || undefined}
                onChange={(e) => setDu(e.target.value)}
              />
              <input
                type="date"
                aria-label="Fin de période"
                className="afi-periode"
                value={au}
                min={du || undefined}
                onChange={(e) => setAu(e.target.value)}
              />
            </div>
          </div>

          {!depenses ? (
            <div style={{ display: "flex", gap: 32, alignItems: "center" }}>
              <Skeleton largeur={186} hauteur={186} rayon={999} />
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 14 }}>
                {Array.from({ length: 4 }, (_, i) => (
                  <Skeleton key={i} />
                ))}
              </div>
            </div>
          ) : parts.length === 0 ? (
            <EtatVide
              titre="Aucune dépense"
              description="Aucune dépense enregistrée sur cette période."
              action={
                <button
                  type="button"
                  className="afi-btn"
                  onClick={() => navigate("/transactions/nouvelle")}
                >
                  <IconePlus />
                  Nouvelle transaction
                </button>
              }
            />
          ) : (
            <div
              className="afi-donut-bloc"
              style={{ opacity: chargement ? 0.55 : 1, transition: "opacity .15s" }}
            >
              <Donut
                parts={parts}
                centre={formaterMontant(totalDepense, memeDevise ?? "XOF")}
                legendeCentre="total dépensé"
              />
              <div className="afi-leg">
                {parts.map((part, index) => (
                  <div key={part.cle} className="afi-leg__li">
                    <span
                      className="afi-leg__sw"
                      style={{ background: couleurPartLegende(part.libelle, index) }}
                    />
                    <span className="afi-leg__nom">{part.libelle}</span>
                    <span className="afi-leg__amt">
                      {formaterMontant(part.valeur, memeDevise ?? "XOF")}
                    </span>
                    <span className="afi-leg__pct">
                      {Math.round((part.valeur / totalDepense) * 100)}&nbsp;%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="afi-carte">
          <div className="afi-carte__tete">
            <h3 className="afi-carte__titre">Dernières transactions</h3>
            <button
              type="button"
              className="afi-lien"
              onClick={() => navigate("/transactions")}
            >
              Tout voir →
            </button>
          </div>

          {dernieres.length === 0 ? (
            <p style={{ color: "var(--texte-doux)", fontSize: 14, margin: 0 }}>
              Aucune transaction pour le moment.
            </p>
          ) : (
            dernieres.slice(0, 5).map((t) => (
              <button
                key={t.id}
                type="button"
                className="afi-derniere"
                onClick={() => navigate(`/transactions/${t.id}`)}
              >
                <span className="afi-ic-sq">
                  <IconeTransactions taille={18} />
                </span>
                <span className="afi-derniere__corps">
                  <span className="afi-derniere__lib">{t.libelle}</span>
                  <span className="afi-derniere__date">{formaterDate(t.dateOperation)}</span>
                </span>
                <span
                  className="afi-derniere__amt"
                  style={{ color: t.type === "REVENU" ? "var(--succes)" : undefined }}
                >
                  {formaterMontantSigne(t.montant, t.type, deviseDe(t.compteId))}
                </span>
              </button>
            ))
          )}
        </div>
      </div>
    </>
  );
}