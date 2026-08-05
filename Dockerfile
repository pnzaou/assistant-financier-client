# syntax=docker/dockerfile:1

# ─── Base ────────────────────────────────────────────────────────
FROM node:24-slim AS base
WORKDIR /app
ENV NPM_CONFIG_UPDATE_NOTIFIER=false

# ─── Dépendances (cache tant que package*.json ne change pas) ────
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

# ─── Développement ───────────────────────────────────────────────
# Utilisé par le docker-compose du repo server (profil "client").
# Le code arrive par bind mount ; node_modules vit dans un volume nommé.
FROM deps AS dev
ENV NODE_ENV=development
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]

# ─── Build de production (site statique) ─────────────────────────
# L'URL de l'API n'est PLUS figée ici : elle est injectée au démarrage du
# conteneur (voir docker-entrypoint.sh), pour qu'une même image serve staging
# et prod. VITE_API_URL ne reste qu'en dernier recours (build hors conteneur).
FROM deps AS build
COPY . .
RUN npm run build

# ─── Image de production : nginx sert dist/ ──────────────────────
FROM nginx:1.29-alpine AS prod
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
COPY config-runtime.sh /docker-entrypoint.d/40-config-runtime.sh
RUN chmod +x /docker-entrypoint.d/40-config-runtime.sh

# L'image nginx officielle exécute déjà tout /docker-entrypoint.d/*.sh avant de
# lancer nginx ; on s'y greffe plutôt que de remplacer son ENTRYPOINT.
# Configuration au démarrage :
#   docker run -e API_URL=https://api.mondomaine.com assistant-financier-client
ENV API_URL=""
EXPOSE 80
