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
# Vite fige les variables VITE_* au moment du build :
#   docker build --target prod --build-arg VITE_API_URL=https://api.mondomaine.com -t assistant-financier-client .
FROM deps AS build
COPY . .
ARG VITE_API_URL=http://localhost:5000
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# ─── Image de production : nginx sert dist/ ──────────────────────
FROM nginx:1.29-alpine AS prod
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
