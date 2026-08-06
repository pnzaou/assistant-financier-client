import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// Testing Library ne démonte pas automatiquement entre les tests hors Jest :
// sans ça, deux tests qui rendent le même composant verraient deux instances.
afterEach(() => {
  cleanup();
});
