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
}

async function requete<T>(path: string, options: RequestInit = {}, reessai = true): Promise<T> {
  const res = await fetch(`${API}/api/v1${path}`, {
    ...options,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...options.headers },
  });

  // Access token expiré → on tente un refresh une seule fois, puis on rejoue.
  if (res.status === 401 && reessai && !path.startsWith("/auth/")) {
    const rafraichi = await rafraichirSession();
    if (rafraichi) return requete<T>(path, options, false);
  }

  if (res.status === 204) return undefined as T;

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(data.message ?? "Erreur inconnue.", res.status, data.erreurs);
  }
  return data as T;
}

async function rafraichirSession(): Promise<boolean> {
  try {
    const res = await fetch(`${API}/api/v1/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });
    return res.ok;
  } catch {
    return false;
  }
}

export const api = {
  get: <T>(path: string) => requete<T>(path),
  post: <T>(path: string, body?: unknown) =>
    requete<T>(path, { method: "POST", body: body ? JSON.stringify(body) : undefined }),
  patch: <T>(path: string, body: unknown) =>
    requete<T>(path, { method: "PATCH", body: JSON.stringify(body) }),
  delete: <T>(path: string) => requete<T>(path, { method: "DELETE" }),
};