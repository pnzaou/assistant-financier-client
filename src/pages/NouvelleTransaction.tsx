import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Select } from "../components/Select";
import { Segmented } from "../components/Segmented";
import { MontantInput } from "../components/MontantInput";
import { ChampDate, aujourdhui } from "../components/ChampDate";
import { BandeauSuggestion } from "../components/BandeauSuggestion";
import { SkeletonLignes } from "../components/Skeleton";
import { useComptesStore, useCategoriesStore, useTransactionsStore } from "../stores";
import { ApiError } from "../lib/api";
import { formaterMontant } from "../lib/format";
import type { TypeTransaction, Transaction } from "../lib/types";

/**
 * Saisie d'une transaction (US2 + US3).
 *
 * Parti pris central : le champ Catégorie est laissé VIDE par défaut. Quand
 * `categorieId` est omis, le serveur devine la catégorie à partir du libellé
 * (service de catégorisation). On affiche ensuite la catégorie retenue dans un
 * bandeau, avec un bouton pour la corriger via PATCH.
 *
 * Le type (DEPENSE / REVENU) filtre les catégories : en changer réinitialise
 * la sélection, sinon on enverrait une catégorie du mauvais type (erreur 422).
 */

const TYPES: { valeur: TypeTransaction; libelle: string }[] = [
  { valeur: "DEPENSE", libelle: "Dépense" },
  { valeur: "REVENU", libelle: "Revenu" },
];

export function NouvelleTransaction() {
  const navigate = useNavigate();

  const comptes = useComptesStore((e) => e.comptes);
  const categories = useCategoriesStore((e) => e.categories);
  const chargerCategories = useCategoriesStore((e) => e.chargerSiNecessaire);
  const creer = useTransactionsStore((e) => e.creer);

  const [compteIdSelectionne, setCompteIdSelectionne] = useState("");
  const [type, setType] = useState<TypeTransaction>("DEPENSE");
  const [montant, setMontant] = useState("");
  const [libelle, setLibelle] = useState("");
  const [categorieId, setCategorieId] = useState("");
  const [note, setNote] = useState("");
  const [dateOperation, setDateOperation] = useState(aujourdhui());

  const [erreurs, setErreurs] = useState<Record<string, string>>({});
  const [erreurGlobale, setErreurGlobale] = useState<string | null>(null);
  const [envoi, setEnvoi] = useState(false);
  /** Transaction créée sans catégorie explicite → bandeau de suggestion. */
  const [suggestion, setSuggestion] = useState<Transaction | null>(null);

  useEffect(() => {
    void chargerCategories();
  }, [chargerCategories]);

  // Un seul compte : on le présélectionne sans synchroniser l'état dans un effet.
  const compteId =
    compteIdSelectionne || (comptes && comptes.length === 1 ? comptes[0].id : "");

  const compte = comptes?.find((c) => c.id === compteId);
  const devise = compte?.devise ?? "XOF";

  const categoriesDuType = useMemo(
    () => (categories ?? []).filter((c) => c.type === type),
    [categories, type],
  );

  /** Changer de type invalide la catégorie choisie (elle est typée côté API). */
  function changerType(nouveau: TypeTransaction) {
    setType(nouveau);
    setCategorieId("");
  }

  function valider(): boolean {
    const trouvees: Record<string, string> = {};
    if (!compteId) trouvees.compteId = "Choisissez un compte.";
    const valeurMontant = Number(montant);
    if (montant === "" || Number.isNaN(valeurMontant) || valeurMontant <= 0) {
      trouvees.montant = "Saisissez un montant supérieur à zéro.";
    }
    if (libelle.trim() === "") trouvees.libelle = "Le libellé est obligatoire.";
    if (!dateOperation) trouvees.dateOperation = "Choisissez une date.";
    setErreurs(trouvees);
    return Object.keys(trouvees).length === 0;
  }

  async function soumettre(e: FormEvent) {
    e.preventDefault();
    setErreurGlobale(null);
    setSuggestion(null);
    if (!valider()) return;

    setEnvoi(true);
    try {
      const transaction = await creer({
        compteId,
        type,
        montant: Number(montant),
        libelle: libelle.trim(),
        dateOperation,
        // Champs optionnels omis plutôt qu'envoyés vides : `categorieId: ""`
        // échouerait à la validation, et c'est l'absence de la clé qui
        // déclenche la catégorisation automatique.
        ...(categorieId ? { categorieId } : {}),
        ...(note.trim() ? { note: note.trim() } : {}),
      });

      if (categorieId) {
        // Catégorie choisie par l'utilisateur : rien à suggérer.
        navigate("/transactions", { replace: true });
        return;
      }
      setSuggestion(transaction);
    } catch (err) {
      if (err instanceof ApiError && err.erreurs) {
        const parChamp: Record<string, string> = {};
        for (const e of err.erreurs) parChamp[e.champ] = e.message;
        setErreurs(parChamp);
      } else {
        setErreurGlobale(
          err instanceof ApiError ? err.message : "Impossible d'enregistrer la transaction.",
        );
      }
    } finally {
      setEnvoi(false);
    }
  }

  /** Après suggestion : repartir sur un formulaire vierge, même compte et type. */
  function saisirUneAutre() {
    setSuggestion(null);
    setMontant("");
    setLibelle("");
    setNote("");
    setCategorieId("");
    setDateOperation(aujourdhui());
    setErreurs({});
  }

  if (!comptes || !categories) {
    return (
      <div className="afi-form">
        <SkeletonLignes nombre={6} />
      </div>
    );
  }

  // ── Écran de confirmation avec catégorie devinée ──────────────────
  if (suggestion) {
    const nomCategorie =
      categories.find((c) => c.id === suggestion.categorieId)?.nom ?? "Non catégorisée";

    return (
      <div className="afi-form">
        <BandeauSuggestion
          nomCategorie={nomCategorie}
          onModifier={() => navigate(`/transactions/${suggestion.id}`)}
        />
        <div className="afi-btnrow">
          <button type="button" className="afi-btn" onClick={saisirUneAutre}>
            Saisir une autre transaction
          </button>
          <button
            type="button"
            className="afi-btn-ghost"
            onClick={() => navigate("/transactions")}
          >
            Voir l'historique
          </button>
        </div>
      </div>
    );
  }

  // ── Formulaire ────────────────────────────────────────────────────
  return (
    <form className="afi-form" onSubmit={soumettre} noValidate>
      {erreurGlobale && <div className="afi-bandeau-erreur">{erreurGlobale}</div>}

      <Select
        id="compteId"
        label="Compte"
        requis
        value={compteId}
        onChange={(e) => setCompteIdSelectionne(e.target.value)}
        optionVide={comptes.length === 1 ? undefined : "Choisir un compte"}
        erreur={erreurs.compteId}
        options={comptes.map((c) => ({
          valeur: c.id,
          libelle: `${c.nom} — ${formaterMontant(c.solde, c.devise)}`,
        }))}
      />

      <label className="afi-lbl">
        Type <span className="afi-req">*</span>
      </label>
      <Segmented
        label="Type de transaction"
        options={TYPES}
        valeur={type}
        onChange={changerType}
        desactive={envoi}
      />

      <MontantInput
        id="montant"
        label="Montant"
        requis
        valeur={montant}
        onChange={setMontant}
        devise={devise}
        erreur={erreurs.montant}
        aide="Toujours positif — le type (dépense / revenu) détermine le signe."
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
          placeholder="Ex. Yango course centre-ville"
          value={libelle}
          onChange={(e) => setLibelle(e.target.value)}
          aria-invalid={erreurs.libelle ? true : undefined}
        />
        {erreurs.libelle && <div className="afi-msg-erreur">{erreurs.libelle}</div>}
      </div>

      <Select
        id="categorieId"
        label="Catégorie — optionnel"
        value={categorieId}
        onChange={(e) => setCategorieId(e.target.value)}
        optionVide="Laisser l'assistant deviner"
        erreur={erreurs.categorieId}
        aide="Laissez vide : la catégorie sera devinée à partir du libellé, puis modifiable."
        options={categoriesDuType.map((c) => ({ valeur: c.id, libelle: c.nom }))}
      />

      <div>
        <label className="afi-lbl" htmlFor="note">
          Note — optionnel
        </label>
        <textarea
          id="note"
          className="afi-fld"
          placeholder="Ajouter un détail…"
          value={note}
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
      />

      <div className="afi-btnrow">
        <button type="submit" className="afi-btn" disabled={envoi}>
          {envoi ? "Enregistrement…" : "Enregistrer la transaction"}
        </button>
        <button
          type="button"
          className="afi-btn-ghost"
          onClick={() => navigate(-1)}
          disabled={envoi}
        >
          Annuler
        </button>
      </div>
    </form>
  );
}