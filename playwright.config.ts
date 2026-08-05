import { defineConfig, devices } from "@playwright/test";

// En CI, la stack complète (Postgres + API + front) est déjà debout via le
// docker-compose.e2e.yml du repo serveur : E2E_BASE_URL pointe dessus et
// Playwright ne démarre rien. En local, on lance le serveur de dev Vite.
const BASE_URL = process.env.E2E_BASE_URL ?? "http://localhost:5173";
const serveurDejaDebout = Boolean(process.env.E2E_BASE_URL);

export default defineConfig({
  testDir: "./e2e",
  outputDir: "resultats-e2e/artefacts",
  fullyParallel: true,

  // `test.only` oublié dans une PR = échec, pas une suite silencieusement vide.
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  // Les tests partagent une base : en série sur le runner pour éviter que deux
  // specs se marchent dessus.
  workers: process.env.CI ? 1 : undefined,
  timeout: 30_000,
  expect: { timeout: 10_000 },

  reporter: process.env.CI
    ? [
        ["list"],
        ["html", { outputFolder: "resultats-e2e/html", open: "never" }],
        ["junit", { outputFile: "resultats-e2e/junit.xml" }],
      ]
    : [["list"], ["html", { outputFolder: "resultats-e2e/html", open: "never" }]],

  use: {
    baseURL: BASE_URL,
    // Trace + capture uniquement quand ça casse : sinon les artefacts pèsent
    // des centaines de Mo sur chaque run.
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    locale: "fr-FR",
    timezoneId: "Africa/Dakar",
  },

  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    // Même moteur, donc aucun téléchargement supplémentaire, mais ça couvre le
    // rendu mobile (sidebar repliée, champs empilés).
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],

  webServer: serveurDejaDebout
    ? undefined
    : {
        command: "npm run dev",
        url: BASE_URL,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
});
