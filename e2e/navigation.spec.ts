import { expect, test } from "@playwright/test";

test.describe("Gardes de routes et navigation", () => {
  test("renvoie un visiteur anonyme vers la connexion", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/connexion/);
    await expect(page.getByRole("heading", { name: "Content de vous revoir" })).toBeVisible();
  });

  test.describe("routes privées", () => {
    for (const route of ["/comptes", "/transactions", "/transactions/nouvelle", "/bienvenue"]) {
      test(`protège ${route}`, async ({ page }) => {
        await page.goto(route);
        await expect(page).toHaveURL(/\/connexion/);
      });
    }
  });

  test("redirige une route inconnue vers l'accueil (puis la connexion)", async ({ page }) => {
    await page.goto("/cette-page-nexiste-pas");
    // `*` renvoie sur `/`, que ProtectedRoute renvoie à son tour sur /connexion.
    await expect(page).toHaveURL(/\/connexion/);
  });

  test("navigue entre connexion et inscription", async ({ page }) => {
    await page.goto("/connexion");

    await page.getByRole("link", { name: "Créer un compte" }).click();
    await expect(page).toHaveURL(/\/inscription/);
    await expect(page.getByRole("heading", { name: "Créer votre compte" })).toBeVisible();

    await page.getByRole("link", { name: "Se connecter" }).click();
    await expect(page).toHaveURL(/\/connexion/);
  });

  test("mène à la récupération de mot de passe", async ({ page }) => {
    await page.goto("/connexion");
    await page.getByRole("link", { name: "Mot de passe oublié ?" }).click();
    await expect(page).toHaveURL(/\/mot-de-passe-oublie/);
  });
});
