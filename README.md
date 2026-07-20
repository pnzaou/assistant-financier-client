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

Toujours passer par la variable injectée par le compose (jamais d'URL en dur) :

```ts
const API = import.meta.env.VITE_API_URL ?? "http://localhost:5000";
fetch(`${API}/health`, { credentials: "include" });
```

## Build de production

L'image finale est un nginx qui sert le site statique. Les variables `VITE_*`
sont **figées au moment du build** :

```bash
docker build --target prod --build-arg VITE_API_URL=https://api.mondomaine.com -t assistant-financier-client .
docker run --rm -p 8080:80 assistant-financier-client   # test local sur http://localhost:8080
```

## CI (GitHub Actions)

À chaque push et sur chaque pull request (`.github/workflows/ci.yml`) :
lint ESLint, build complet (`tsc` + Vite) et build de l'image Docker de
production. Résultat ✅/❌ sur chaque commit, détail dans l'onglet **Actions**.

## Notes

- `vite.config.ts` doit garder `server: { host: true, port: 5173, watch: { usePolling: true } }` :
  indispensable pour que le serveur de dev soit joignable et se recharge sous Docker/Windows.
- Autocomplétion VS Code sans exécution locale : `npm install` local (optionnel),
  l'app tourne dans Docker de toute façon.
