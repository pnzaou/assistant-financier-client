import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthLayout } from "../components/AuthLayout";
import { Field } from "../components/Field";
import { PasswordField } from "../components/PasswordField";
import { Button } from "../components/Button";
import { useAuth } from "../auth/AuthContext";
import { ApiError } from "../lib/api";

export function Connexion() {
  const { login } = useAuth();
  const naviguer = useNavigate();

  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [erreurs, setErreurs] = useState<Record<string, string>>({});
  const [erreurGlobale, setErreurGlobale] = useState<string | null>(null);
  const [envoi, setEnvoi] = useState(false);

  async function soumettre(e: FormEvent) {
    e.preventDefault();
    setErreurs({});
    setErreurGlobale(null);
    setEnvoi(true);
    try {
      await login({ email, motDePasse });
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
      titre="Content de vous revoir"
      sousTitre="Connectez-vous pour accéder à vos finances."
      bas={
        <>
          Pas encore de compte ? <Link to="/inscription" style={{ fontWeight: 600 }}>Créer un compte</Link>
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
          autoComplete="current-password"
          value={motDePasse}
          erreur={erreurs.motDePasse}
          onChange={(e) => setMotDePasse(e.target.value)}
        />

        <div style={{ textAlign: "right", marginBottom: "var(--esp-2)" }}>
          <Link
            to="/mot-de-passe-oublie"
            style={{ fontSize: 13, color: "var(--texte-doux)", fontWeight: 600 }}
          >
            Mot de passe oublié ?
          </Link>
        </div>

        <Button type="submit" disabled={envoi}>
          {envoi ? "Connexion…" : "Se connecter"}
        </Button>
      </form>
    </AuthLayout>
  );
}