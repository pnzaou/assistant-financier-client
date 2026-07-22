const API = import.meta.env.VITE_API_URL ?? "http://localhost:5000";

export interface ErreurChamp {
  champ: string;
  message: string;
}

export class ApiError extends Error {
  statut: number;
  erreurs?: ErreurChamp[];
  constructor(message: string, statut: number, erreurs?: ErreurChamp[]) {
    super(message);
    this.statut = statut;
    this.erreurs = erreurs;
  }

  /** Erreurs de validation (422) remises à plat pour un formulaire : { email: "..." }. */
  parChamp(): Record<string, string> {
    const resultat: Record<string, string> = {};
    for (const e of this.erreurs ?? []) resultat[e.champ] = e.message;
    return resultat;
  }
}

// Routes qui ne doivent JAMAIS déclencher un refresh sur 401 : soit elles sont
// publiques (un 401 y signifie "mauvais identifiants", pas "token expiré"),
// soit c'est le refresh lui-même — le rejouer boucle à l'infini.
const SANS_REFRESH = [
  "/auth/login",
  "/auth/register",
  "/auth/refresh",
  "/auth/logout",
  "/auth/verifier-email",
  "/auth/mot-de-passe-oublie",
  "/auth/reinitialiser-mot-de-passe",
];

// Le store d'auth s'abonne ici pour vider l'utilisateur quand la session est
// définitivement perdue. Passer par un callback évite que lib/ importe stores/
// (et donc un cycle d'imports).
type EcouteurSession = () => void;
let surSessionExpiree: EcouteurSession | null = null;

export function definirGestionnaireSessionExpiree(ecouteur: EcouteurSession | null): void {
  surSessionExpiree = ecouteur;
}

// Un seul refresh en vol à la fois : le dashboard tire 2-3 requêtes en
// parallèle, sans ça un token expiré déclencherait 3 refresh concurrents
// (et une rotation de refresh token en écraserait deux).
let refreshEnCours: Promise<boolean> | null = null;

async function rafraichirSession(): Promise<boolean> {
  refreshEnCours ??= (async () => {
    try {
      const res = await fetch(`${API}/api/v1/auth/refresh`, {
        method: "POST",
        credentials: "include",
      });
      return res.ok;
    } catch {
      return false;
    } finally {
      // Libéré au tick suivant pour que les appels concurrents partagent bien
      // la même promesse.
      queueMicrotask(() => {
        refreshEnCours = null;
      });
    }
  })();
  return refreshEnCours;
}

/** `{ page: 1, compteId: undefined }` → `"?page=1"`. Les valeurs vides sont omises. */
function versQueryString(params?: Record<string, string | number | boolean | undefined>): string {
  if (!params) return "";
  const query = new URLSearchParams();
  for (const [cle, valeur] of Object.entries(params)) {
    if (valeur !== undefined && valeur !== "") query.set(cle, String(valeur));
  }
  const chaine = query.toString();
  return chaine ? `?${chaine}` : "";
}

async function requete<T>(path: string, options: RequestInit = {}, reessai = true): Promise<T> {
  const res = await fetch(`${API}/api/v1${path}`, {
    ...options,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...options.headers },
  });

  // Access token expiré (15 min) → un refresh, puis on rejoue une seule fois.
  if (res.status === 401 && reessai && !SANS_REFRESH.some((p) => path.startsWith(p))) {
    const rafraichi = await rafraichirSession();
    if (rafraichi) return requete<T>(path, options, false);
    // Le refresh token est mort lui aussi : la session est perdue pour de bon.
    surSessionExpiree?.();
  }

  if (res.status === 204) return undefined as T;

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(data.message ?? "Erreur inconnue.", res.status, data.erreurs);
  }
  return data as T;
}

export const api = {
  get: <T>(path: string, params?: Record<string, string | number | boolean | undefined>) =>
    requete<T>(`${path}${versQueryString(params)}`),
  post: <T>(path: string, body?: unknown) =>
    requete<T>(path, { method: "POST", body: body ? JSON.stringify(body) : undefined }),
  patch: <T>(path: string, body: unknown) =>
    requete<T>(path, { method: "PATCH", body: JSON.stringify(body) }),
  delete: <T>(path: string) => requete<T>(path, { method: "DELETE" }),
};

/** Message lisible pour l'UI, quelle que soit l'erreur remontée. */
export function messageErreur(erreur: unknown, defaut = "Une erreur est survenue."): string {
  if (erreur instanceof ApiError) return erreur.message;
  if (erreur instanceof Error && erreur.message) return erreur.message;
  return defaut;
}
