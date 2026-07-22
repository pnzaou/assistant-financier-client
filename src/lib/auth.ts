import { api } from "./api";
import type {
  DonneesInscription,
  IdentifiantsConnexion,
  ReponseAuth,
  Utilisateur,
} from "./types";

// ── Routes publiques ─────────────────────────────────────────────

export function inscrire(donnees: DonneesInscription) {
  return api.post<ReponseAuth>("/auth/register", donnees);
}

export function connecter(identifiants: IdentifiantsConnexion) {
  return api.post<ReponseAuth>("/auth/login", identifiants);
}

export function deconnecter() {
  return api.post<void>("/auth/logout");
}

export function verifierEmail(jeton: string) {
  return api.post<{ message: string }>("/auth/verifier-email", { jeton });
}

export function motDePasseOublie(email: string) {
  return api.post<{ message: string }>("/auth/mot-de-passe-oublie", { email });
}

export function reinitialiserMotDePasse(jeton: string, nouveauMotDePasse: string) {
  return api.post<{ message: string }>("/auth/reinitialiser-mot-de-passe", {
    jeton,
    nouveauMotDePasse,
  });
}

// ── Routes authentifiées ─────────────────────────────────────────

/** Profil de l'utilisateur connecté — sert aussi à valider la session au démarrage. */
export function moi() {
  return api.get<{ utilisateur: Utilisateur }>("/auth/moi");
}

export function renvoyerVerification() {
  return api.post<{ message: string }>("/auth/renvoyer-verification");
}
