import { expect, test } from "@playwright/test";
import { sInscrire, utilisateurDeTest, MOT_DE_PASSE_VALIDE } from "./aides";

test.describe("Inscription", () => {
  test("un nouvel utilisateur s'inscrit puis crée son premier compte", async ({ page }) => {
    const utilisateur = utilisateurDeTest("inscription");

    await sInscrire(page, utilisateur);

    // Sans aucun compte, GardeOnboarding envoie sur /bienvenue plutôt que sur
    // le dashboard : c'est le comportement attendu d'un compte tout neuf.
    await expect(page.getByRole("heading", { name: "Créez votre premier compte" })).toBeVisible();

    await page.getByLabel("Nom du compte").fill("Compte courant");
    await page.getByLabel("Type de compte").selectOption("COURANT");
    await page.getByLabel("Solde initial (FCFA)").fill("150000");
    await page.getByRole("button", { name: "Créer le compte" }).click();

    // Une fois le premier compte créé, la garde laisse passer vers le dashboard.
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole("heading", { name: "Créez votre premier compte" })).toBeHidden();
  });

  test("refuse deux mots de passe différents sans appeler l'API", async ({ page }) => {
    const utilisateur = utilisateurDeTest("mdp-differents");

    // Si une requête part quand même, le test doit le voir.
    let appelRegister = false;
    await page.route("**/api/v1/auth/register", (route) => {
      appelRegister = true;
      return route.abort();
    });

    await page.goto("/inscription");
    await page.getByLabel("Prénom").fill(utilisateur.prenom);
    await page.getByLabel("Nom", { exact: true }).fill(utilisateur.nom);
    await page.getByLabel("Adresse e-mail").fill(utilisateur.email);
    await page.getByLabel("Mot de passe", { exact: true }).fill(MOT_DE_PASSE_VALIDE);
    await page.getByLabel("Confirmer le mot de passe").fill("AutreChose123!");
    await page.getByRole("checkbox").check();
    await page.getByRole("button", { name: "Créer mon compte" }).click();

    await expect(page.getByText("Les mots de passe ne correspondent pas.")).toBeVisible();
    expect(appelRegister).toBe(false);
  });

  test("exige l'acceptation des conditions générales", async ({ page }) => {
    const utilisateur = utilisateurDeTest("sans-cgu");

    await page.goto("/inscription");
    await page.getByLabel("Prénom").fill(utilisateur.prenom);
    await page.getByLabel("Nom", { exact: true }).fill(utilisateur.nom);
    await page.getByLabel("Adresse e-mail").fill(utilisateur.email);
    await page.getByLabel("Mot de passe", { exact: true }).fill(MOT_DE_PASSE_VALIDE);
    await page.getByLabel("Confirmer le mot de passe").fill(MOT_DE_PASSE_VALIDE);
    // Case CGU volontairement décochée.
    await page.getByRole("button", { name: "Créer mon compte" }).click();

    await expect(page.getByText("Vous devez accepter les conditions.")).toBeVisible();
  });

  test("refuse une adresse déjà utilisée", async ({ page }) => {
    const utilisateur = utilisateurDeTest("doublon");

    await sInscrire(page, utilisateur);
    await expect(page.getByRole("heading", { name: "Créez votre premier compte" })).toBeVisible();

    // Deuxième inscription avec la même adresse : l'API doit la rejeter et
    // l'erreur doit remonter jusqu'à l'écran.
    await sInscrire(page, utilisateur);
    await expect(page.getByRole("button", { name: "Créer mon compte" })).toBeVisible();
  });

  test("affiche la robustesse du mot de passe pendant la saisie", async ({ page }) => {
    await page.goto("/inscription");
    const champ = page.getByLabel("Mot de passe", { exact: true });

    await champ.fill("abc");
    await expect(page.getByText("Faible")).toBeVisible();

    await champ.fill("Motdepasse1");
    await expect(page.getByText("Moyen")).toBeVisible();

    await champ.fill(MOT_DE_PASSE_VALIDE);
    await expect(page.getByText("Robuste")).toBeVisible();
  });
});
