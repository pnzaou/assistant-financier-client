import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Select } from "../components/Select";
import { MontantInput } from "../components/MontantInput";
import { ChampDate } from "../components/ChampDate";
import { SwitchLigne } from "../components/Switch";
import { EtatVide } from "../components/EtatVide";
import { SkeletonLignes } from "../components/Skeleton";
import { useComptesStore, useCategoriesStore, useTransactionsStore } from "../stores";
import { ApiError } from "../lib/api";
import { LIBELLES_TYPE_COMPTE, LIBELLES_TYPE_TRANSACTION } from "../lib/format";
import type { Transaction } from "../lib/types";

function IconeCorbeille() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v5M14 11v5" />
    </svg>
  );
}

/**
 * Détail et édition d'une transaction.
 *
 * Trois contraintes de l'API structurent cet écran :
 *
 *  1. `compteId` et `type` ne sont PAS modifiables après création. Ils sont
 *     affichés grisés, avec la mention « non modifiable ».
 *  2. Une transaction inexistante et une transaction appartenant à autrui
 *     renvoient la MÊME 404 (anti-IDOR). On affiche donc un message neutre,
 *     sans laisser deviner laquelle des deux situations s'applique.
 *  3. Le statut « pointée » se change indépendamment du formulaire : c'est un
 *     PATCH immédiat, qui ne touche pas aux totaux (pas d'invalidation).
 */

export function DetailTransaction() {
  const { id = "" } = useParams();
  const navigate = useNavigate();

  const comptes = useComptesStore((e) => e.comptes);
  const categories = useCategoriesStore((e) => e.categories);
  const chargerCategories = useCategoriesStore((e) => e.chargerSiNecessaire);

  const obtenir = useTransactionsStore((e) => e.charger);
  const modifier = useTransactionsStore((e) => e.modifier);
  const supprimer = useTransactionsStore((e) => e.supprimer);

  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [introuvable, setIntrouvable] = useState(false);
  const [chargement, setChargement] = useState(true);

  // Champs du formulaire
  const [montant, setMontant] = useState("");
  const [libelle, setLibelle] = useState("");
  const [categorieId, setCategorieId] = useState("");
  const [note, setNote] = useState("");
  const [dateOperation, setDateOperation] = useState("");
  const [pointee, setPointee] = useState(false);

  const [erreurs, setErreurs] = useState<Record<string, string>>({});
  const [erreurGlobale, setErreurGlobale] = useState<string | null>(null);
  const [envoi, setEnvoi] = useState(false);
  const [confirmation, setConfirmation] = useState(false);
  const [suppression, setSuppression] = useState(false);

  useEffect(() => {
    void chargerCategories();
  }, [chargerCategories]);

  useEffect(() => {
    let annule = false;

    async function charger() {
      setChargement(true);
      setIntrouvable(false);
      try {
        const t = await (obtenir as unknown as (transactionId: string) => Promise<Transaction>)(id);
        if (annule) return;
        setTransaction(t);
        remplir(t);
      } catch (err) {
        if (annule) return;
        if (err instanceof ApiError && err.statut === 404) {
          setIntrouvable(true);
        } else {
          setErreurGlobale(
            err instanceof ApiError ? err.message : "Impossible de charger la transaction.",
          );
        }
      } finally {
        if (!annule) setChargement(false);
      }
    }

    function remplir(t: Transaction) {
      setMontant(String(t.montant));
      setLibelle(t.libelle);
      setCategorieId(t.categorieId ?? "");
      setNote(t.note ?? "");
      setDateOperation(t.dateOperation);
      setPointee(t.pointee);
    }

    void charger();
    return () => {
      annule = true;
    };
  }, [id, obtenir]);

  const compte = comptes?.find((c) => c.id === transaction?.compteId);
  const devise = compte?.devise ?? "XOF";

  // Seules les catégories du type de la transaction sont proposées : le type
  // n'étant pas modifiable, la liste ne change jamais après chargement.
  const categoriesDuType = useMemo(
    () => (categories ?? []).filter((c) => c.type === transaction?.type),
    [categories, transaction?.type],
  );

  function valider(): boolean {
    const trouvees: Record<string, string> = {};
    const valeur = Number(montant);
    if (montant === "" || Number.isNaN(valeur) || valeur <= 0) {
      trouvees.montant = "Saisissez un montant supérieur à zéro.";
    }
    if (libelle.trim() === "") trouvees.libelle = "Le libellé est obligatoire.";
    if (!dateOperation) trouvees.dateOperation = "Choisissez une date.";
    setErreurs(trouvees);
    return Object.keys(trouvees).length === 0;
  }

  async function enregistrer(e: FormEvent) {
    e.preventDefault();
    setErreurGlobale(null);
    if (!valider()) return;

    setEnvoi(true);
    try {
      const misAJour = await modifier(id, {
        montant: Number(montant),
        libelle: libelle.trim(),
        dateOperation,
        categorieId: categorieId || undefined,
        note: note.trim() || undefined,
      });
      setTransaction(misAJour);
      navigate("/transactions");
    } catch (err) {
      if (err instanceof ApiError && err.erreurs) {
        const parChamp: Record<string, string> = {};
        for (const e of err.erreurs) parChamp[e.champ] = e.message;
        setErreurs(parChamp);
      } else {
        setErreurGlobale(
          err instanceof ApiError ? err.message : "Impossible d'enregistrer les modifications.",
        );
      }
    } finally {
      setEnvoi(false);
    }
  }

  /**
   * Le pointage part immédiatement, hors du formulaire : c'est un geste de
   * rapprochement bancaire, pas une modification de la transaction. On applique
   * l'état localement d'abord, et on le restaure si l'appel échoue.
   */
  async function basculerPointee(nouvelEtat: boolean) {
    const precedent = pointee;
    setPointee(nouvelEtat);
    try {
      await modifier(id, { pointee: nouvelEtat });
    } catch {
      setPointee(precedent);
      setErreurGlobale("Impossible de mettre à jour le statut « pointée ».");
    }
  }

  async function confirmerSuppression() {
    setSuppression(true);
    setErreurGlobale(null);
    try {
      await supprimer(id);
      navigate("/transactions", { replace: true });
    } catch (err) {
      setErreurGlobale(
        err instanceof ApiError ? err.message : "Impossible de supprimer la transaction.",
      );
      setSuppression(false);
      setConfirmation(false);
    }
  }

  // ── États non nominaux ────────────────────────────────────────────

  if (chargement) {
    return (
      <div className="afi-form">
        <SkeletonLignes nombre={7} />
      </div>
    );
  }

  if (introuvable) {
    return (
      <EtatVide
        titre="Transaction introuvable"
        description="Cette transaction n'existe pas ou n'est plus disponible."
        action={
          <button
            type="button"
            className="afi-btn"
            onClick={() => navigate("/transactions", { replace: true })}
          >
            Retour à l'historique
          </button>
        }
      />
    );
  }

  if (!transaction) {
    return (
      <>
        {erreurGlobale && <div className="afi-bandeau-erreur">{erreurGlobale}</div>}
        <button type="button" className="afi-btn-ghost" onClick={() => navigate("/transactions")}>
          Retour à l'historique
        </button>
      </>
    );
  }

  // ── Écran nominal ─────────────────────────────────────────────────

  return (
    <>
      <button type="button" className="afi-retour" onClick={() => navigate("/transactions")}>
        <IconeFlecheGauche />
        Retour
      </button>

      <div className="afi-carte afi-form">
        <form onSubmit={enregistrer} noValidate>
          {erreurGlobale && <div className="afi-bandeau-erreur">{erreurGlobale}</div>}

          <div className="afi-grille2">
            <div>
              <label className="afi-lbl" htmlFor="compte">
                Compte <span className="afi-lbl__mention">— non modifiable</span>
              </label>
              <input
                id="compte"
                className="afi-fld"
                disabled
                value={
                  compte
                    ? `${compte.nom} — ${LIBELLES_TYPE_COMPTE[compte.type]}`
                    : "Compte inconnu"
                }
              />
            </div>

            <div>
              <label className="afi-lbl" htmlFor="type">
                Type <span className="afi-lbl__mention">— non modifiable</span>
              </label>
              <input
                id="type"
                className="afi-fld"
                disabled
                value={LIBELLES_TYPE_TRANSACTION[transaction.type]}
              />
            </div>
          </div>

          <MontantInput
            id="montant"
            label="Montant"
            requis
            valeur={montant}
            onChange={setMontant}
            devise={devise}
            erreur={erreurs.montant}
            desactive={envoi}
          />

          <div>
            <label className="afi-lbl" htmlFor="libelle">
              Libellé <span className="afi-req">*</span>
            </label>
            <input
              id="libelle"
              type="text"
              autoComplete="off"
              className={"afi-fld" + (erreurs.libelle ? " afi-fld--erreur" : "")}
              value={libelle}
              disabled={envoi}
              onChange={(e) => setLibelle(e.target.value)}
              aria-invalid={erreurs.libelle ? true : undefined}
            />
            {erreurs.libelle && <div className="afi-msg-erreur">{erreurs.libelle}</div>}
          </div>

          <Select
            id="categorieId"
            label="Catégorie"
            value={categorieId}
            disabled={envoi}
            onChange={(e) => setCategorieId(e.target.value)}
            optionVide="Sans catégorie"
            erreur={erreurs.categorieId}
            aide="Devinée automatiquement à la création — corrigez si besoin."
            options={categoriesDuType.map((c) => ({ valeur: c.id, libelle: c.nom }))}
          />

          <div>
            <label className="afi-lbl" htmlFor="note">
              Note
            </label>
            <textarea
              id="note"
              className="afi-fld"
              placeholder="Ajouter un détail…"
              value={note}
              disabled={envoi}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          <ChampDate
            id="dateOperation"
            label="Date"
            requis
            valeur={dateOperation}
            onChange={setDateOperation}
            erreur={erreurs.dateOperation}
            desactive={envoi}
          />

          <SwitchLigne
            titre="Transaction pointée"
            description="Rapprochée de votre relevé bancaire."
            label="Marquer la transaction comme pointée"
            actif={pointee}
            onChange={basculerPointee}
            desactive={envoi || suppression}
          />

          <div className="afi-btnrow afi-btnrow--espacee">
            <div style={{ display: "flex", gap: "var(--esp-2)" }}>
              <button type="submit" className="afi-btn" disabled={envoi || suppression}>
                {envoi ? "Enregistrement…" : "Enregistrer"}
              </button>
              <button
                type="button"
                className="afi-btn-ghost"
                onClick={() => navigate("/transactions")}
                disabled={envoi || suppression}
              >
                Annuler
              </button>
            </div>

            {!confirmation && (
              <button
                type="button"
                className="afi-btn-ghost afi-btn-ghost--danger"
                onClick={() => setConfirmation(true)}
                disabled={envoi || suppression}
              >
                <IconeCorbeille />
                Supprimer
              </button>
            )}
          </div>
        </form>

        {confirmation && (
          <div className="afi-confirm" role="alertdialog" aria-labelledby="confirm-titre">
            <p className="afi-confirm__titre" id="confirm-titre">
              Supprimer cette transaction&nbsp;?
            </p>
            <p className="afi-confirm__txt">
              «&nbsp;{transaction.libelle}&nbsp;» sera définitivement supprimée et le solde du
              compte recalculé. Cette action est irréversible.
            </p>
            <div style={{ display: "flex", gap: "var(--esp-2)", flexWrap: "wrap" }}>
              <button
                type="button"
                className="afi-btn-ghost afi-btn-ghost--danger"
                onClick={confirmerSuppression}
                disabled={suppression}
              >
                <IconeCorbeille />
                {suppression ? "Suppression…" : "Oui, supprimer"}
              </button>
              <button
                type="button"
                className="afi-btn-ghost"
                onClick={() => setConfirmation(false)}
                disabled={suppression}
              >
                Annuler
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

function IconeFlecheGauche() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 12H5" />
      <path d="m12 19-7-7 7-7" />
    </svg>
  );
}