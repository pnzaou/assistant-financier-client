# Assistant Financier — Client (front web)

Front de l'application Assistant Financier intelligent.
**Stack :** React 19 · TypeScript · Vite · Docker (nginx en prod).

## Développement

Le front ne se lance pas seul : il est orchestré par le docker-compose du repo
**server**. Cloner les deux repos côte à côte (noms de dossiers exacts) :

```
assistant-financier/
├── server/   ← repo API
└── client/   ← ce repo
```

Puis, depuis `server/` :

```bash
docker compose --profile client up --build
```

- Front : <http://localhost:5173> (hot reload actif, rien à installer en local)
- API : <http://localhost:5000>

La page d'accueil vérifie automatiquement la connexion à l'API (`/health`).

## Appeler l'API

Toujours passer par `src/lib/config.ts` (jamais d'URL en dur, jamais
`import.meta.env` directement) :

```ts
import { API_URL } from "./lib/config";
fetch(`${API_URL}/health`, { credentials: "include" });
```

`API_URL` est résolue dans cet ordre : `window.__CONFIG__.apiUrl` (injectée au
démarrage du conteneur) → `VITE_API_URL` (dev) → `http://localhost:5000`.

## Build de production

L'image finale est un nginx qui sert le site statique. L'URL de l'API n'est
**pas** figée au build : elle est écrite dans `/config.js` au démarrage du
conteneur par `config-runtime.sh`. Une seule image sert donc tous les
environnements.

```bash
docker build --target prod -t assistant-financier-client .
docker run --rm -p 8080:80 -e API_URL=https://api.mondomaine.com assistant-financier-client
```

Le conteneur expose aussi `/healthz` pour les probes Kubernetes.

## Tests

```bash
npm test              # unitaires + composants (Vitest + Testing Library)
npm run test:coverage # idem + rapport lcov (consommé par SonarCloud)
npm run test:e2e      # IHM / e2e (Playwright) — nécessite l'API sur :5000
```

Les specs Playwright vivent dans `e2e/`, les tests unitaires à côté du code
qu'ils couvrent (`src/**/*.test.ts`).

## CI/CD (GitHub Actions)

Voir [CONTRIBUTING.md](./CONTRIBUTING.md) pour la stratégie de branching et la
liste complète des vérifications.

## Notes

- `vite.config.ts` doit garder `server: { host: true, port: 5173, watch: { usePolling: true } }` :
  indispensable pour que le serveur de dev soit joignable et se recharge sous Docker/Windows.
- Autocomplétion VS Code sans exécution locale : `npm install` local (optionnel),
  l'app tourne dans Docker de toute façon.
