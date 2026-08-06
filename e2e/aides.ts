import type { Page } from "@playwright/test";

/**
 * Chaque exécution crée ses propres utilisateurs : les specs tournent contre
 * une base partagée et ne doivent pas dépendre de l'ordre d'exécution ni de
 * l'état laissé par un run précédent.
 */
export function emailUnique(prefixe = "e2e"): string {
  const jeton = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
  return `${prefixe}-${jeton}@exemple.test`;
}

export const MOT_DE_PASSE_VALIDE = "MotDePasse123!";

export interface Utilisateur {
  prenom: string;
  nom: string;
  email: string;
  motDePasse: string;
}

export function utilisateurDeTest(prefixe?: string): Utilisateur {
  return {
    prenom: "Awa",
    nom: "Diallo",
    email: emailUnique(prefixe),
    motDePasse: MOT_DE_PASSE_VALIDE,
  };
}

/** Remplit et soumet le formulaire d'inscription. */
export async function sInscrire(page: Page, utilisateur: Utilisateur): Promise<void> {
  await page.goto("/inscription");
  await page.getByLabel("Prénom").fill(utilisateur.prenom);
  await page.getByLabel("Nom", { exact: true }).fill(utilisateur.nom);
  await page.getByLabel("Adresse e-mail").fill(utilisateur.email);
  await page.getByLabel("Mot de passe", { exact: true }).fill(utilisateur.motDePasse);
  await page.getByLabel("Confirmer le mot de passe").fill(utilisateur.motDePasse);
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Créer mon compte" }).click();
}

/** Remplit et soumet le formulaire de connexion. */
export async function seConnecter(page: Page, email: string, motDePasse: string): Promise<void> {
  await page.goto("/connexion");
  await page.getByLabel("Adresse e-mail").fill(email);
  await page.getByLabel("Mot de passe", { exact: true }).fill(motDePasse);
  await page.getByRole("button", { name: "Se connecter" }).click();
}
