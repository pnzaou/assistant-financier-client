// Valeurs par défaut pour le développement local.
//
// En production, ce fichier est ENTIÈREMENT RÉÉCRIT au démarrage du conteneur
// par docker-entrypoint.sh à partir de la variable d'environnement API_URL.
// Ne pas y mettre de secret : il est servi tel quel au navigateur.
//
// apiUrl vide → le code retombe sur VITE_API_URL puis sur http://localhost:5000.
window.__CONFIG__ = { apiUrl: "" };
