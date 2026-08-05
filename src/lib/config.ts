/**
 * Résolution de l'URL de l'API, par ordre de priorité :
 *
 *   1. `window.__CONFIG__.apiUrl` — écrit au démarrage du conteneur (runtime).
 *   2. `VITE_API_URL` — figé au build, utilisé par `npm run dev`.
 *   3. `http://localhost:5000` — défaut du docker-compose de développement.
 *
 * Le niveau 1 est ce qui rend l'image rejouable : sans lui, Vite inlinerait
 * l'URL dans le bundle et il faudrait reconstruire une image par environnement.
 */

declare global {
  interface Window {
    __CONFIG__?: { apiUrl?: string };
  }
}

export const API_URL: string =
  window.__CONFIG__?.apiUrl || import.meta.env.VITE_API_URL || "http://localhost:5000";
