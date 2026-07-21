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
}