import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthLayout } from "../components/AuthLayout";
import { Field } from "../components/Field";
import { PasswordField } from "../components/PasswordField";
import { JaugeRobustesse } from "../components/JaugeRobustesse";
import { Button } from "../components/Button";
import { useAuth } from "../auth/AuthContext";
import { ApiError } from "../lib/api";

export function Inscription() {
  const { register } = useAuth();
  const naviguer = useNavigate();

  const [prenom, setPrenom] = useState("");
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [cguAcceptees, setCguAcceptees] = useState(false);

  const [erreurs, setErreurs] = useState<Record<string, string>>({});
  const [erreurGlobale, setErreurGlobale] = useState<string | null>(null);
  const [envoi, setEnvoi] = useState(false);

  async function soumettre(e: FormEvent) {
    e.preventDefault();
    setErreurs({});
    setErreurGlobale(null);

    // Validations front (le back ne les impose pas)
    const local: Record<string, string> = {};
    if (motDePasse !== confirmation) {
      local.confirmation = "Les mots de passe ne correspondent pas.";
    }
    if (!cguAcceptees) {
      local.cgu = "Vous devez accepter les conditions.";
    }
    if (Object.keys(local).length > 0) {
      setErreurs(local);
      return;
    }

    setEnvoi(true);
    try {
      await register({ email, motDePasse, nom, prenom });
      naviguer("/", { replace: true });
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.erreurs) {
          const parChamp: Record<string, string> = {};
          for (const e of err.erreurs) parChamp[e.champ] = e.message;
          setErreurs(parChamp);
        } else {
          setErreurGlobale(err.message);
        }
      } else {
        setErreurGlobale("Une erreur est survenue.");
      }
    } finally {
      setEnvoi(false);
    }
  }

  return (
    <AuthLayout
      titre="Créer votre compte"
      sousTitre="Gratuit, sans carte bancaire — deux minutes suffisent."
      bas={
        <>
          Déjà un compte ? <Link to="/connexion" style={{ fontWeight: 600 }}>Se connecter</Link>
        </>
      }
    >
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

        <div style={{ display: "flex", gap: "var(--esp-2)" }}>
          <div style={{ flex: 1 }}>
            <Field
              id="prenom"
              label="Prénom"
              autoComplete="given-name"
              value={prenom}
              erreur={erreurs.prenom}
              onChange={(e) => setPrenom(e.target.value)}
            />
          </div>
          <div style={{ flex: 1 }}>
            <Field
              id="nom"
              label="Nom"
              autoComplete="family-name"
              value={nom}
              erreur={erreurs.nom}
              onChange={(e) => setNom(e.target.value)}
            />
          </div>
        </div>

        <Field
          id="email"
          label="Adresse e-mail"
          type="email"
          autoComplete="email"
          value={email}
          erreur={erreurs.email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <PasswordField
          id="motDePasse"
          label="Mot de passe"
          autoComplete="new-password"
          value={motDePasse}
          erreur={erreurs.motDePasse}
          onChange={(e) => setMotDePasse(e.target.value)}
        />
        <JaugeRobustesse motDePasse={motDePasse} />

        <PasswordField
          id="confirmation"
          label="Confirmer le mot de passe"
          autoComplete="new-password"
          value={confirmation}
          erreur={erreurs.confirmation}
          onChange={(e) => setConfirmation(e.target.value)}
        />

        <label
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 10,
            fontSize: 13,
            color: "var(--texte)",
            margin: "var(--esp-1) 0 var(--esp-2)",
            cursor: "pointer",
          }}
        >
          <input
            type="checkbox"
            checked={cguAcceptees}
            onChange={(e) => setCguAcceptees(e.target.checked)}
            style={{ marginTop: 2, accentColor: "var(--encre)", width: 16, height: 16 }}
          />
          <span>
            J'accepte les conditions générales d'utilisation et la politique de confidentialité.
          </span>
        </label>
        {erreurs.cgu && (
          <p style={{ margin: "-8px 0 var(--esp-2)", fontSize: 13, color: "var(--erreur)" }}>
            {erreurs.cgu}
          </p>
        )}

        <Button type="submit" disabled={envoi}>
          {envoi ? "Création…" : "Créer mon compte"}
        </Button>
      </form>
    </AuthLayout>
  );
}