#!/bin/sh
# Génère la configuration lue par le navigateur à partir de l'environnement du
# conteneur.
#
# Greffé dans /docker-entrypoint.d/ de l'image nginx officielle : son entrypoint
# exécute tous les scripts de ce dossier (sans argument) avant de lancer nginx.
#
# C'est ce qui permet de promouvoir exactement la même image de staging vers la
# prod : seule la variable API_URL change (ConfigMap côté Kubernetes).
set -eu

API_URL="${API_URL:-}"

# Échappe antislashs et guillemets : une URL malformée casserait le parsing du
# script côté navigateur et l'application ne démarrerait pas du tout.
API_URL_ECHAPPEE=$(printf '%s' "$API_URL" | sed 's/\\/\\\\/g; s/"/\\"/g')

cat > /usr/share/nginx/html/config.js <<EOF
window.__CONFIG__ = { apiUrl: "${API_URL_ECHAPPEE}" };
EOF

if [ -z "$API_URL" ]; then
  echo "[config-runtime] API_URL non définie : le front utilisera son URL par défaut." >&2
else
  echo "[config-runtime] API_URL = ${API_URL}"
fi
