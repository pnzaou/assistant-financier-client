import { useState, type FormEvent } from "react";
import { Card } from "../components/Card";
import { Field } from "../components/Field";
import { Button } from "../components/Button";
import { creerCompte } from "../lib/comptes";
import { LIBELLES_TYPE_COMPTE } from "../lib/format";
import { ApiError } from "../lib/api";
import type { TypeCompte } from "../lib/types";

const TYPES: TypeCompte[] = [
  "COURANT",
  "EPARGNE",
  "CARTE_CREDIT",
  "ESPECES",
  "INVESTISSEMENT",
  "AUTRE",
];

export function CreerCompte({
  premierCompte = false,
  onCree,
}: {
  premierCompte?: boolean;
  onCree: () => void;
}) {
  const [nom, setNom] = useState("");
  const [type, setType] = useState<TypeCompte>("COURANT");
  const [soldeInitial, setSoldeInitial] = useState("");
  const [erreurs, setErreurs] = useState<Record<string, string>>({});
  const [erreurGlobale, setErreurGlobale] = useState<string | null>(null);
  const [envoi, setEnvoi] = useState(false);

  async function soumettre(e: FormEvent) {
    e.preventDefault();
    setErreurs({});
    setErreurGlobale(null);
    setEnvoi(true);
    try {
      await creerCompte({
        nom,
        type,
        soldeInitial: soldeInitial === "" ? 0 : Number(soldeInitial),
        devise: "XOF",
      });
      onCree();
    } catch (err) {
      if (err instanceof ApiError && err.erreurs) {
        const parChamp: Record<string, string> = {};
        for (const e of err.erreurs) parChamp[e.champ] = e.message;
        setErreurs(parChamp);
      } else {
        setErreurGlobale(err instanceof ApiError ? err.message : "Une erreur est survenue.");
      }
    } finally {
      setEnvoi(false);
    }
  }

  return (
    <div style={{ display: "flex", justifyContent: "center" }}>
      <Card>
        <h1 style={{ fontSize: 22, fontWeight: 600, margin: "0 0 8px" }}>
          {premierCompte ? "Créez votre premier compte" : "Nouveau compte"}
        </h1>
        <p style={{ color: "var(--texte)", fontSize: 15, margin: "0 0 var(--esp-3)" }}>
          {premierCompte
            ? "Pour commencer à suivre vos finances, ajoutez un compte."
            : "Ajoutez un compte à suivre."}
        </p>

        <form onSubmit={soumettre} noValidate>
          {erreurGlobale && (
            <div
              style={{
                background: "var(--erreur-fond)",
                color: "var(--erreur)",
                fontSize: 14,
                padding: "12px 16px",
                borderRadius: "var(--rayon-champ)",
                marginBottom: "var(--esp-2)",
              }}
            >
              {erreurGlobale}
            </div>
          )}

          <Field
            id="nom"
            label="Nom du compte"
            placeholder="Ex. Compte courant"
            value={nom}
            erreur={erreurs.nom}
            onChange={(e) => setNom(e.target.value)}
          />

          <div style={{ marginBottom: "var(--esp-2)" }}>
            <label
              htmlFor="type"
              style={{
                display: "block",
                fontSize: 13,
                fontWeight: 600,
                color: "var(--texte)",
                marginBottom: 7,
              }}
            >
              Type de compte
            </label>
            <select
              id="type"
              value={type}
              onChange={(e) => setType(e.target.value as TypeCompte)}
              style={{
                width: "100%",
                height: "var(--hauteur-champ)",
                padding: "0 16px",
                fontFamily: "var(--police)",
                fontSize: 15,
                color: "var(--encre)",
                background: "var(--blanc)",
                border: "1px solid var(--hairline)",
                borderRadius: "var(--rayon-champ)",
                outline: "none",
                cursor: "pointer",
              }}
            >
              {TYPES.map((t) => (
                <option key={t} value={t}>
                  {LIBELLES_TYPE_COMPTE[t]}
                </option>
              ))}
            </select>
          </div>

          <Field
            id="soldeInitial"
            label="Solde initial (FCFA)"
            type="number"
            inputMode="numeric"
            placeholder="0"
            value={soldeInitial}
            erreur={erreurs.soldeInitial}
            onChange={(e) => setSoldeInitial(e.target.value)}
          />

          <Button type="submit" disabled={envoi}>
            {envoi ? "Création…" : "Créer le compte"}
          </Button>
        </form>
      </Card>
    </div>
  );
}