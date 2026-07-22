import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { AuthLayout } from "../components/AuthLayout";
import { Button } from "../components/Button";
import { api, ApiError } from "../lib/api";
import { useAuth } from "../auth/AuthContext";

type Etat = "verification" | "succes" | "echec";

export function VerifierEmail() {
  const [params] = useSearchParams();
  const jeton = params.get("jeton");
  const { utilisateur } = useAuth();

  const [etat, setEtat] = useState<Etat>(jeton ? "verification" : "echec");
  const [message, setMessage] = useState(jeton ? "" : "Le lien de vérification est invalide.");
  const [renvoye, setRenvoye] = useState(false);
  const dejaLance = useRef(false); // évite le double appel en mode Strict (dev)

  useEffect(() => {
    if (dejaLance.current) return;
    dejaLance.current = true;

    if (!jeton) return;
    api
      .post("/auth/verifier-email", { jeton })
      .then(() => setEtat("succes"))
      .catch((err) => {
        setEtat("echec");
        setMessage(err instanceof ApiError ? err.message : "Le lien a expiré ou est invalide.");
      });
  }, [jeton]);

  async function renvoyer() {
    try {
      await api.post("/auth/renvoyer-verification");
      setRenvoye(true);
    } catch {
      // silencieux : l'utilisateur peut réessayer
    }
  }

  if (etat === "verification") {
    return (
      <AuthLayout titre="Vérification en cours…" sousTitre="Un instant, on confirme votre adresse.">
        <p style={{ textAlign: "center", margin: 0 }}>Veuillez patienter.</p>
      </AuthLayout>
    );
  }

  if (etat === "succes") {
    return (
      <AuthLayout
        titre="Adresse vérifiée"
        sousTitre="Votre compte est activé. Vous pouvez accéder à toutes vos finances."
        bas={<Link to="/" style={{ fontWeight: 600 }}>Aller au tableau de bord</Link>}
      >
        <Link to="/">
          <Button>Continuer</Button>
        </Link>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      titre="Ce lien a expiré"
      sousTitre={message || "Le lien de vérification est invalide ou a expiré."}
      bas={<Link to="/connexion" style={{ fontWeight: 600 }}>Retour à la connexion</Link>}
    >
      {utilisateur ? (
        renvoye ? (
          <p style={{ textAlign: "center", color: "var(--succes)", fontWeight: 600, margin: 0 }}>
            Un nouvel e-mail vient d'être envoyé.
          </p>
        ) : (
          <Button variante="ghost" onClick={renvoyer}>
            Renvoyer l'e-mail
          </Button>
        )
      ) : (
        <p style={{ textAlign: "center", color: "var(--texte-doux)", fontSize: 13, margin: 0 }}>
          Connectez-vous pour recevoir un nouvel e-mail de vérification.
        </p>
      )}
    </AuthLayout>
  );
}