import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { EtatVide } from "../components/EtatVide";
import { Skeleton } from "../components/Skeleton";
import { IconeComptes, IconePlus } from "../components/layout/icones";
import { useComptesStore } from "../stores";
import { formaterMontant, LIBELLES_TYPE_COMPTE } from "../lib/format";

/**
 * Liste des comptes et de leurs soldes.
 *
 * Le solde affiché est TOUJOURS `solde` (recalculé par l'API à chaque appel),
 * jamais `soldeInitial` — ce dernier ne reflète plus la réalité dès la
 * première transaction.
 *
 * Pas d'édition ni de suppression : l'API n'expose ni PATCH ni DELETE sur les
 * comptes dans cette version.
 */

export function Comptes() {
  const navigate = useNavigate();

  const comptes = useComptesStore((e) => e.comptes);
  const erreur = useComptesStore((e) => e.erreur);
  const chargerSiNecessaire = useComptesStore((e) => e.chargerSiNecessaire);

  useEffect(() => {
    void chargerSiNecessaire();
  }, [chargerSiNecessaire]);

  return (
    <>
      <div className="afi-page-tete">
        <h2 className="afi-h2">Comptes</h2>
        <button type="button" className="afi-btn" onClick={() => navigate("/comptes/nouveau")}>
          <IconePlus />
          Nouveau compte
        </button>
      </div>

      {erreur && <div className="afi-bandeau-erreur">{erreur}</div>}

      {comptes === null ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {Array.from({ length: 3 }, (_, i) => (
            <Skeleton key={i} hauteur={104} rayon={20} />
          ))}
        </div>
      ) : comptes.length === 0 ? (
        <div className="afi-carte">
          <EtatVide
            titre="Aucun compte"
            description="Ajoutez un compte pour commencer à suivre vos finances."
            action={
              <button
                type="button"
                className="afi-btn"
                onClick={() => navigate("/comptes/nouveau")}
              >
                <IconePlus />
                Nouveau compte
              </button>
            }
          />
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {comptes.map((compte) => (
            <div key={compte.id} className="afi-compte-ligne">
              <span className="afi-ic-sq">
                <IconeComptes taille={20} />
              </span>

              <div className="afi-compte-ligne__ident">
                <div className="afi-compte-ligne__nom">{compte.nom}</div>
                <div className="afi-compte-ligne__meta">
                  {LIBELLES_TYPE_COMPTE[compte.type]} · {compte.devise}
                  {compte.institution ? ` · ${compte.institution}` : ""}
                </div>
              </div>

              <div className="afi-compte-ligne__solde">
                <div className="afi-compte-ligne__montant">
                  {formaterMontant(compte.solde, compte.devise)}
                </div>
                <div className="afi-compte-ligne__mention">solde recalculé</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}