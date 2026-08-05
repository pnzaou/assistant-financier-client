import { defineConfig, mergeConfig } from "vitest/config";
import viteConfig from "./vite.config";

// On hérite de la config Vite (plugin React, alias…) pour que les tests
// compilent le JSX exactement comme le build. Seul le bloc `test` est ajouté.
export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: "jsdom",
      // Étend `expect` avec les matchers DOM (toBeInTheDocument, toHaveStyle…).
      setupFiles: ["./src/tests/setup.ts"],
      globals: true,
      // Les specs Playwright vivent dans e2e/ et ne doivent pas être ramassées
      // ici : elles ont besoin d'un vrai navigateur, pas de jsdom.
      include: ["src/**/*.test.{ts,tsx}"],
      coverage: {
        provider: "v8",
        // `lcov` est le format lu par SonarCloud ; `text` sert en local.
        reporter: ["text", "lcov", "html"],
        reportsDirectory: "coverage",
        include: ["src/**/*.{ts,tsx}"],
        exclude: [
          "src/main.tsx", // point d'entrée : rien à tester
          "src/tests/**",
          "src/**/*.test.{ts,tsx}",
          "src/lib/types.ts", // types purs, effacés à la compilation
          "src/**/*.d.ts",
        ],
      },
    },
  }),
);
