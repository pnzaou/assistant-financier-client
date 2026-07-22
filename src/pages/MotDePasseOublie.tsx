import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { AuthLayout } from "../components/AuthLayout";
import { Field } from "../components/Field";
import { Button } from "../components/Button";
import { api, ApiError } from "../lib/api";

export function MotDePasseOublie() {
  const [email, setEmail] = useState("");
  const [envoye, setEnvoye] = useState(false);
  const [erreurGlobale, setErreurGlobale] = useState<string | null>(null);
  const [envoi, setEnvoi] = useState(false);

  async function soumettre(e: FormEvent) {
    e.preventDefault();
    setErreurGlobale(null);
    setEnvoi(true);
    try {
      await api.post("/auth/mot-de-passe-oublie", { email });
      setEnvoye(true);
    } catch (err) {
      setErreurGlobale(err instanceof ApiError ? err.message : "Une erreur est survenue.");
    } finally {
      setEnvoi(false);
    }
  }

  if (envoye) {
    return (
      <AuthLayout
        titre="Vérifiez vos e-mails"
        sousTitre={`Si un compte existe pour ${email}, un lien de réinitialisation vient d'être envoyé. Il expire dans 60 minutes.`}
        bas={<Link to="/connexion" style={{ fontWeight: 600 }}>Retour à la connexion</Link>}
      >
        <Button variante="ghost" onClick={() => setEnvoye(false)}>
          Renvoyer le lien
        </Button>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      titre="Mot de passe oublié ?"
      sousTitre="Entrez votre adresse : nous vous envoyons un lien pour en choisir un nouveau."
      bas={<Link to="/connexion" style={{ fontWeight: 600 }}>Retour à la connexion</Link>}
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
          onChange={(e) => setEmail(e.target.value)}
        />
        <Button type="submit" disabled={envoi}>
          {envoi ? "Envoi…" : "Envoyer le lien"}
        </Button>
      </form>
    </AuthLayout>
  );
}