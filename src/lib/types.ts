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