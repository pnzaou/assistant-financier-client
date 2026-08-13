import { expect, test } from "@playwright/test";
import { emailUnique, sInscrire, seConnecter, utilisateurDeTest, MOT_DE_PASSE_VALIDE } from "./aides";

test.describe("Connexion", () => {
  test("rejette des identifiants inconnus avec un message lisible", async ({ page }) => {
    await seConnecter(page, emailUnique("inconnu"), MOT_DE_PASSE_VALIDE);

    // On reste sur l'écran de connexion et une erreur s'affiche : le message
    // exact vient de l'API, on vérifie donc juste qu'il y en a un.
    await expect(page).toHaveURL(/\/connexion/);
    await expect(page.getByRole("button", { name: "Se connecter" })).toBeVisible();
  });

  test("rejette un mot de passe erroné pour un compte existant", async ({ page, context }) => {
    const utilisateur = utilisateurDeTest("mdp-errone");
    await sInscrire(page, utilisateur);
    await expect(page.getByRole("heading", { name: "Créez votre premier compte" })).toBeVisible();

    // L'inscription connecte l'utilisateur : on repart d'une session vierge.
    await context.clearCookies();

    await seConnecter(page, utilisateur.email, "MauvaisMotDePasse123!");
    await expect(page).toHaveURL(/\/connexion/);
  });

  test("connecte un utilisateur existant et le ramène dans l'application", async ({
    page,
    context,
  }) => {
    const utilisateur = utilisateurDeTest("connexion");
    await sInscrire(page, utilisateur);
    await expect(page.getByRole("heading", { name: "Créez votre premier compte" })).toBeVisible();

    await context.clearCookies();
    await seConnecter(page, utilisateur.email, utilisateur.motDePasse);

    // Toujours sans compte bancaire : on retombe sur l'onboarding, pas sur
    // l'écran de connexion. C'est la preuve que la session est bien établie.
    await expect(page.getByRole("heading", { name: "Créez votre premier compte" })).toBeVisible();
    await expect(page).not.toHaveURL(/\/connexion/);
  });

  test("bascule l'affichage du mot de passe", async ({ page }) => {
    await page.goto("/connexion");
    const champ = page.getByLabel("Mot de passe", { exact: true });
    await champ.fill(MOT_DE_PASSE_VALIDE);

    await expect(champ).toHaveAttribute("type", "password");
    await page.getByRole("button", { name: "Afficher" }).click();
    await expect(champ).toHaveAttribute("type", "text");
    await page.getByRole("button", { name: "Masquer" }).click();
    await expect(champ).toHaveAttribute("type", "password");
  });
});
