// Paire de clés RSA jetable pour la stack e2e (docker-compose.e2e.yml).
//
// L'API attend des clés RS256 en PEM aplati (sauts de ligne encodés `\n`) ; elle
// les reconstitue avec .replace(/\\n/g, "\n"). Ce script duplique volontairement
// le `scripts/generer-cles.js` du repo serveur : il ne sert qu'à démarrer une
// stack de test, et le client ne doit pas avoir à cloner l'autre repo pour ça.
//
// 2048 bits suffisent ici (le serveur utilise 4096 en vrai) : ces clés vivent
// le temps d'un run de CI et la génération est nettement plus rapide.
//
//   node scripts/generer-cles-e2e.mjs > .env.e2e
import { generateKeyPairSync } from "node:crypto";

const { privateKey, publicKey } = generateKeyPairSync("rsa", {
  modulusLength: 2048,
  privateKeyEncoding: { type: "pkcs8", format: "pem" },
  publicKeyEncoding: { type: "spki", format: "pem" },
});

const aplatir = (pem) =>
  pem
    .trim()
    .split("\n")
    .map((ligne) => ligne.trim())
    .filter(Boolean)
    .join("\\n");

console.log(`JWT_PRIVATE_KEY="${aplatir(privateKey)}"`);
console.log(`JWT_PUBLIC_KEY="${aplatir(publicKey)}"`);
