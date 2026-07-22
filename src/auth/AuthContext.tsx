import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { api } from "../lib/api";
import type { ReponseAuth, Utilisateur } from "../lib/types";

interface IdentifiantsConnexion {
  email: string;
  motDePasse: string;
}

interface DonneesInscription {
  email: string;
  motDePasse: string;
  nom: string;
  prenom: string;
  telephone?: string;
}

interface AuthContexte {
  utilisateur: Utilisateur | null;
  chargement: boolean;
  login: (id: IdentifiantsConnexion) => Promise<void>;
  register: (d: DonneesInscription) => Promise<void>;
  logout: () => Promise<void>;
}

const Contexte = createContext<AuthContexte | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [utilisateur, setUtilisateur] = useState<Utilisateur | null>(null);
  const [chargement, setChargement] = useState(true);

  // Au chargement de l'app : la session (cookie) est-elle encore valide ?
  useEffect(() => {
    api
      .get<{ utilisateur: Utilisateur }>("/auth/moi")
      .then((data) => setUtilisateur(data.utilisateur))
      .catch(() => setUtilisateur(null))
      .finally(() => setChargement(false));
  }, []);

  async function login(id: IdentifiantsConnexion) {
    const data = await api.post<ReponseAuth>("/auth/login", id);
    setUtilisateur(data.utilisateur);
  }

  async function register(d: DonneesInscription) {
    const data = await api.post<ReponseAuth>("/auth/register", d);
    setUtilisateur(data.utilisateur);
  }

  async function logout() {
    try {
      await api.post("/auth/logout");
    } finally {
      setUtilisateur(null);
    }
  }

  return (
    <Contexte.Provider value={{ utilisateur, chargement, login, register, logout }}>
      {children}
    </Contexte.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(Contexte);
  if (!ctx) throw new Error("useAuth doit être utilisé dans <AuthProvider>.");
  return ctx;
}