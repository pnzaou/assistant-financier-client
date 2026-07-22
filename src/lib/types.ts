// Miroir des DTOs du serveur (server/src/dtos/*.dto.ts).
// Si le back change une forme, c'est ici qu'on répercute — nulle part ailleurs.

// ── Auth ─────────────────────────────────────────────────────────
export interface Utilisateur {
  id: string;
  email: string;
  nom: string;
  prenom: string;
  emailVerifie: boolean;
}

export interface ReponseAuth {
  utilisateur: Utilisateur;
  accessToken: string;
  refreshToken: string;
}

export interface IdentifiantsConnexion {
  email: string;
  motDePasse: string;
}

export interface DonneesInscription {
  email: string;
  motDePasse: string;
  nom: string;
  prenom: string;
}

// ── Comptes ──────────────────────────────────────────────────────
export type TypeCompte =
  | "COURANT"
  | "EPARGNE"
  | "CARTE_CREDIT"
  | "ESPECES"
  | "INVESTISSEMENT"
  | "AUTRE";

export interface Compte {
  id: string;
  nom: string;
  type: TypeCompte;
  soldeInitial: number;
  /** Recalculé par le serveur à chaque appel — toujours afficher ça, pas soldeInitial. */
  solde: number;
  devise: string;
  institution: string | null;
  couleur: string | null;
}

export interface CreationCompte {
  nom: string;
  type?: TypeCompte;
  soldeInitial?: number;
  devise?: string;
  institution?: string;
  couleur?: string;
}

// ── Catégories ───────────────────────────────────────────────────
export type TypeCategorie = "DEPENSE" | "REVENU";

export interface Categorie {
  id: string;
  nom: string;
  type: TypeCategorie;
  icone: string | null;
  couleur: string | null;
  parentId: string | null;
}

// ── Transactions ─────────────────────────────────────────────────
export type TypeTransaction = "DEPENSE" | "REVENU";

export interface Transaction {
  id: string;
  compteId: string;
  categorieId: string | null;
  montant: number;
  type: TypeTransaction;
  libelle: string;
  note: string | null;
  /** Format "AAAA-MM-JJ". */
  dateOperation: string;
  pointee: boolean;
}

export interface CreationTransaction {
  compteId: string;
  /** Toujours positif — le signe vient de `type`. */
  montant: number;
  type: TypeTransaction;
  libelle: string;
  note?: string;
  /** Format "AAAA-MM-JJ". */
  dateOperation: string;
  /** Optionnel : si absent, le serveur devine la catégorie depuis le libellé. */
  categorieId?: string;
}

export interface ModificationTransaction {
  montant?: number;
  libelle?: string;
  note?: string;
  dateOperation?: string;
  categorieId?: string;
  pointee?: boolean;
}

/** Le compte et le type ne sont pas modifiables : filtres de liste seulement. */
export interface FiltresTransactions {
  compteId?: string;
  categorieId?: string;
  /** "AAAA-MM-JJ" */
  du?: string;
  /** "AAAA-MM-JJ" */
  au?: string;
  page?: number;
  /** Max 100, défaut 20. */
  limite?: number;
}

export interface Page<T> {
  items: T[];
  page: number;
  limite: number;
  total: number;
}

// ── Dashboard ────────────────────────────────────────────────────
export interface SoldeCompte {
  compteId: string;
  nom: string;
  solde: number;
  devise: string;
}

export interface Soldes {
  comptes: SoldeCompte[];
  /** Somme brute, SANS conversion de devise. */
  totalGlobal: number;
}

export interface DepenseParCategorie {
  categorieId: string;
  nomCategorie: string;
  montantTotal: number;
}

export interface PeriodeDashboard {
  du?: string;
  au?: string;
}
