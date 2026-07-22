// Vérifie que chaque chemin/paramètre/enveloppe utilisé par client/src/lib/*
// correspond au vrai backend. Simule le navigateur (cookies httpOnly).
const API = "http://localhost:5000/api/v1";

let cookies = {};
function entete() {
  const c = Object.entries(cookies).map(([k, v]) => `${k}=${v}`).join("; ");
  return c ? { Cookie: c } : {};
}
function memoriser(res) {
  for (const brut of res.headers.getSetCookie?.() ?? []) {
    const [paire] = brut.split(";");
    const i = paire.indexOf("=");
    const nom = paire.slice(0, i);
    const val = paire.slice(i + 1);
    if (val === "" ) delete cookies[nom]; else cookies[nom] = val;
  }
}

async function appel(methode, chemin, corps) {
  const res = await fetch(`${API}${chemin}`, {
    method: methode,
    headers: { "Content-Type": "application/json", ...entete() },
    body: corps ? JSON.stringify(corps) : undefined,
  });
  memoriser(res);
  const data = res.status === 204 ? null : await res.json().catch(() => null);
  return { statut: res.status, data };
}

const echecs = [];
function verifier(nom, condition, detail = "") {
  if (condition) console.log(`  ok   ${nom}`);
  else {
    console.log(`  ECHEC ${nom} ${detail}`);
    echecs.push(nom);
  }
}
function memesCles(objet, attendues) {
  const reelles = Object.keys(objet).sort();
  const att = [...attendues].sort();
  return JSON.stringify(reelles) === JSON.stringify(att)
    ? true
    : (console.log(`        cles reelles: ${reelles.join(",")} | attendues: ${att.join(",")}`), false);
}

const suffixe = Date.now();
const email = `verif${suffixe}@exemple.com`;
const motDePasse = "MotDePasse1";

console.log("\n[1] auth");
let r = await appel("POST", "/auth/register", { email, motDePasse, nom: "Test", prenom: "Verif" });
verifier("POST /auth/register -> 201", r.statut === 201, `recu ${r.statut}`);
verifier("enveloppe ReponseAuth", memesCles(r.data, ["utilisateur", "accessToken", "refreshToken"]));
verifier("forme Utilisateur", memesCles(r.data.utilisateur, ["id", "email", "nom", "prenom", "emailVerifie"]));

r = await appel("GET", "/auth/moi");
verifier("GET /auth/moi -> 200", r.statut === 200, `recu ${r.statut}`);
verifier("enveloppe { utilisateur }", memesCles(r.data, ["utilisateur"]));
verifier("moi renvoie le bon email", r.data.utilisateur.email === email);

r = await appel("POST", "/auth/refresh");
verifier("POST /auth/refresh -> 200 (cookie refresh envoye sur /auth)", r.statut === 200, `recu ${r.statut}`);

console.log("\n[2] comptes");
r = await appel("GET", "/comptes");
verifier("GET /comptes -> 200", r.statut === 200, `recu ${r.statut}`);
verifier("enveloppe { comptes }", memesCles(r.data, ["comptes"]));
verifier("nouvel utilisateur = aucun compte", Array.isArray(r.data.comptes) && r.data.comptes.length === 0);

r = await appel("POST", "/comptes", { nom: "Compte courant", type: "COURANT", soldeInitial: 1000, devise: "XOF" });
verifier("POST /comptes -> 201", r.statut === 201, `recu ${r.statut}`);
verifier("forme Compte", memesCles(r.data.compte, ["id","nom","type","soldeInitial","solde","devise","institution","couleur"]));
verifier("montants = number", typeof r.data.compte.solde === "number" && typeof r.data.compte.soldeInitial === "number");
const compteId = r.data.compte.id;

console.log("\n[3] categories");
r = await appel("GET", "/categories");
verifier("GET /categories -> 200", r.statut === 200, `recu ${r.statut}`);
verifier("enveloppe { categories }", memesCles(r.data, ["categories"]));
verifier("forme Categorie", memesCles(r.data.categories[0], ["id","nom","type","icone","couleur","parentId"]));
const nbTotal = r.data.categories.length;

r = await appel("GET", "/categories?type=DEPENSE");
verifier("filtre ?type=DEPENSE", r.statut === 200 && r.data.categories.every((c) => c.type === "DEPENSE") && r.data.categories.length < nbTotal);

console.log("\n[4] transactions");
r = await appel("POST", "/transactions", {
  compteId, montant: 2500, type: "DEPENSE", libelle: "Yango vers l'aeroport", dateOperation: "2026-07-21",
});
verifier("POST /transactions sans categorieId -> 201", r.statut === 201, `recu ${r.statut}`);
verifier("forme Transaction", memesCles(r.data.transaction, ["id","compteId","categorieId","montant","type","libelle","note","dateOperation","pointee"]));
verifier("categorisation auto remplie", r.data.transaction.categorieId !== null);
verifier("dateOperation en AAAA-MM-JJ", /^\d{4}-\d{2}-\d{2}$/.test(r.data.transaction.dateOperation), `recu ${r.data.transaction.dateOperation}`);
const trxId = r.data.transaction.id;

await appel("POST", "/transactions", { compteId, montant: 50000, type: "REVENU", libelle: "Salaire juillet", dateOperation: "2026-07-01" });

r = await appel("GET", "/transactions?page=1&limite=20");
verifier("GET /transactions -> 200", r.statut === 200, `recu ${r.statut}`);
verifier("enveloppe { transactions: Page }", memesCles(r.data.transactions, ["items","page","limite","total"]));
verifier("pagination coherente", r.data.transactions.total === 2 && r.data.transactions.page === 1 && r.data.transactions.limite === 20);

r = await appel("GET", `/transactions?compteId=${compteId}&du=2026-07-01&au=2026-07-15`);
verifier("filtres compteId+du+au", r.statut === 200 && r.data.transactions.total === 1, `total=${r.data?.transactions?.total}`);

r = await appel("GET", `/transactions/${trxId}`);
verifier("GET /transactions/:id -> 200", r.statut === 200 && r.data.transaction.id === trxId);

r = await appel("PATCH", `/transactions/${trxId}`, { montant: 3000, pointee: true });
verifier("PATCH /transactions/:id -> 200", r.statut === 200, `recu ${r.statut}`);
verifier("PATCH applique", r.data.transaction.montant === 3000 && r.data.transaction.pointee === true);

console.log("\n[5] dashboard");
r = await appel("GET", "/dashboard/soldes");
verifier("GET /dashboard/soldes -> 200", r.statut === 200, `recu ${r.statut}`);
verifier("enveloppe { soldes }", memesCles(r.data, ["soldes"]));
verifier("forme Soldes", memesCles(r.data.soldes, ["comptes","totalGlobal"]));
verifier("forme SoldeCompte", memesCles(r.data.soldes.comptes[0], ["compteId","nom","solde","devise"]));
verifier("solde recalcule (1000 - 3000 + 50000)", r.data.soldes.totalGlobal === 48000, `recu ${r.data.soldes.totalGlobal}`);

r = await appel("GET", "/dashboard/depenses-par-categorie");
verifier("GET /dashboard/depenses-par-categorie -> 200", r.statut === 200, `recu ${r.statut}`);
verifier("enveloppe { depenses }", memesCles(r.data, ["depenses"]));
verifier("forme DepenseParCategorie", memesCles(r.data.depenses[0], ["categorieId","nomCategorie","montantTotal"]));
verifier("le REVENU n'apparait pas dans les depenses", r.data.depenses.every((d) => d.montantTotal === 3000));

r = await appel("GET", "/dashboard/depenses-par-categorie?du=2026-07-01&au=2026-07-31");
verifier("periode du/au acceptee", r.statut === 200, `recu ${r.statut}`);

console.log("\n[6] erreurs (formes attendues par ApiError)");
r = await appel("POST", "/auth/register", { email: "pas-un-email", motDePasse: "court", nom: "", prenom: "" });
verifier("422 sur validation", r.statut === 422, `recu ${r.statut}`);
verifier("422 -> { message, erreurs[] }", memesCles(r.data, ["message", "erreurs"]));
verifier("erreurs[] -> { champ, message }", memesCles(r.data.erreurs[0], ["champ", "message"]));

r = await appel("GET", "/transactions/00000000-0000-4000-8000-000000000000");
verifier("404 -> { message }", r.statut === 404 && memesCles(r.data, ["message"]), `recu ${r.statut}`);

console.log("\n[7] deconnexion + 401");
r = await appel("POST", "/auth/logout");
verifier("POST /auth/logout -> 204", r.statut === 204, `recu ${r.statut}`);
r = await appel("GET", "/auth/moi");
verifier("GET /auth/moi apres logout -> 401", r.statut === 401, `recu ${r.statut}`);
r = await appel("POST", "/auth/refresh");
verifier("refresh apres logout -> 401 (session expiree)", r.statut === 401, `recu ${r.statut}`);

console.log(`\n${echecs.length === 0 ? "TOUT PASSE" : `${echecs.length} ECHEC(S): ${echecs.join(" | ")}`}`);
process.exit(echecs.length === 0 ? 0 : 1);
