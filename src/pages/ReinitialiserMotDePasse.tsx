import { useState, type FormEvent } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { AuthLayout } from "../components/AuthLayout";
import { PasswordField } from "../components/PasswordField";
import { JaugeRobustesse } from "../components/JaugeRobustesse";
import { Button } from "../components/Button";
import { api, ApiError } from "../lib/api";

export function ReinitialiserMotDePasse() {
  const [params] = useSearchParams();
  const jeton = params.get("jeton");
  const naviguer = useNavigate();

  const [motDePasse, setMotDePasse] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [erreurs, setErreurs] = useState<Record<string, string>>({});
  const [erreurGlobale, setErreurGlobale] = useState<string | null>(null);
  const [envoi, setEnvoi] = useState(false);
  const [reussi, setReussi] = useState(false);

  // Lien invalide : pas de jeton dans l'URL
  if (!jeton) {
    return (
      <AuthLayout
        titre="Ce lien a expiré"
        sousTitre="Le lien de réinitialisation est invalide ou a expiré. Demandez-en un nouveau."
        bas={<Link to="/connexion" style={{ fontWeight: 600 }}>Retour à la connexion</Link>}
      >
        <Link to="/mot-de-passe-oublie">
          <Button variante="ghost">Demander un nouveau lien</Button>
        </Link>
      </AuthLayout>
    );
  }

  if (reussi) {
    return (
      <AuthLayout
        titre="Mot de passe modifié"
        sousTitre="Vous pouvez maintenant vous connecter avec votre nouveau mot de passe."
      >
        <Button onClick={() => naviguer("/connexion")}>Se connecter</Button>
      </AuthLayout>
    );
  }

  async function soumettre(e: FormEvent) {
    e.preventDefault();
    setErreurs({});
    setErreurGlobale(null);

    if (motDePasse !== confirmation) {
      setErreurs({ confirmation: "Les mots de passe ne correspondent pas." });
      return;
    }

    setEnvoi(true);
    try {
     await api.post("/auth/reinitialiser-mot-de-passe", { jeton, nouveauMotDePasse: motDePasse });
      setReussi(true);
    } catch (err) {
      setErreurGlobale(err instanceof ApiError ? err.message : "Une erreur est survenue.");
    } finally {
      setEnvoi(false);
    }
  }

  return (
    <AuthLayout
      titre="Choisir un nouveau mot de passe"
      sousTitre="Choisissez un mot de passe robuste que vous n'utilisez pas ailleurs."
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
        <PasswordField
          id="motDePasse"
          label="Nouveau mot de passe"
          autoComplete="new-password"
          value={motDePasse}
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
        <Button type="submit" disabled={envoi}>
          {envoi ? "Enregistrement…" : "Réinitialiser le mot de passe"}
        </Button>
      </form>
    </AuthLayout>
  );
}