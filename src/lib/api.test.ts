import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { api, ApiError, definirGestionnaireSessionExpiree, messageErreur } from "./api";

const BASE = "http://localhost:5000/api/v1";

/** Fabrique une réponse minimale : le client n'utilise que ok/status/json. */
function reponse(statut: number, corps: unknown = {}) {
  return {
    ok: statut >= 200 && statut < 300,
    status: statut,
    json: async () => corps,
  } as unknown as Response;
}

let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  fetchMock = vi.fn();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  // `surSessionExpiree` vit au niveau du module : sans ce reset, un test
  // fuiterait son écouteur dans le suivant.
  definirGestionnaireSessionExpiree(null);
  vi.unstubAllGlobals();
});

describe("construction de la requête", () => {
  it("préfixe le chemin par /api/v1 et envoie les cookies", async () => {
    fetchMock.mockResolvedValue(reponse(200, { comptes: [] }));

    await api.get("/comptes");

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE}/comptes`,
      expect.objectContaining({ credentials: "include" }),
    );
  });

  it("sérialise les paramètres non vides en query string", async () => {
    fetchMock.mockResolvedValue(reponse(200, {}));

    await api.get("/transactions", { page: 1, limite: 20 });

    expect(fetchMock.mock.calls[0][0]).toBe(`${BASE}/transactions?page=1&limite=20`);
  });

  it("omet les paramètres undefined et les chaînes vides", async () => {
    fetchMock.mockResolvedValue(reponse(200, {}));

    await api.get("/transactions", { page: 1, compteId: undefined, recherche: "" });

    expect(fetchMock.mock.calls[0][0]).toBe(`${BASE}/transactions?page=1`);
  });

  it("n'ajoute pas de `?` quand tous les paramètres sont vides", async () => {
    fetchMock.mockResolvedValue(reponse(200, {}));

    await api.get("/transactions", { compteId: undefined });

    expect(fetchMock.mock.calls[0][0]).toBe(`${BASE}/transactions`);
  });

  it("envoie le corps en JSON sur un POST", async () => {
    fetchMock.mockResolvedValue(reponse(200, {}));

    await api.post("/comptes", { nom: "Compte courant" });

    const options = fetchMock.mock.calls[0][1];
    expect(options.method).toBe("POST");
    expect(options.body).toBe(JSON.stringify({ nom: "Compte courant" }));
    expect(options.headers["Content-Type"]).toBe("application/json");
  });

  it("n'envoie pas de corps sur un POST sans données", async () => {
    fetchMock.mockResolvedValue(reponse(200, {}));

    await api.post("/auth/logout");

    expect(fetchMock.mock.calls[0][1].body).toBeUndefined();
  });
});

describe("traitement de la réponse", () => {
  it("renvoie undefined sur un 204 sans tenter de parser le corps", async () => {
    const json = vi.fn();
    fetchMock.mockResolvedValue({ ok: true, status: 204, json } as unknown as Response);

    await expect(api.delete("/comptes/1")).resolves.toBeUndefined();
    expect(json).not.toHaveBeenCalled();
  });

  it("lève une ApiError portant le statut et le message du serveur", async () => {
    fetchMock.mockResolvedValue(reponse(404, { message: "Compte introuvable." }));

    await expect(api.get("/comptes/999")).rejects.toMatchObject({
      message: "Compte introuvable.",
      statut: 404,
    });
  });

  it("retombe sur un message générique si le serveur n'en fournit pas", async () => {
    fetchMock.mockResolvedValue(reponse(500, {}));

    await expect(api.get("/comptes")).rejects.toThrow("Erreur inconnue.");
  });

  it("survit à un corps d'erreur qui n'est pas du JSON", async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 502,
      json: async () => {
        throw new SyntaxError("Unexpected token < in JSON");
      },
    } as unknown as Response);

    await expect(api.get("/comptes")).rejects.toMatchObject({ statut: 502 });
  });
});

describe("ApiError.parChamp", () => {
  it("met les erreurs de validation à plat pour un formulaire", () => {
    const erreur = new ApiError("Validation échouée", 422, [
      { champ: "email", message: "Email invalide." },
      { champ: "motDePasse", message: "8 caractères minimum." },
    ]);

    expect(erreur.parChamp()).toEqual({
      email: "Email invalide.",
      motDePasse: "8 caractères minimum.",
    });
  });

  it("renvoie un objet vide quand il n'y a pas d'erreurs de champ", () => {
    expect(new ApiError("Boum", 500).parChamp()).toEqual({});
  });
});

describe("rafraîchissement de session sur 401", () => {
  it("rafraîchit puis rejoue la requête une seule fois", async () => {
    fetchMock
      .mockResolvedValueOnce(reponse(401, { message: "Token expiré." })) // appel initial
      .mockResolvedValueOnce(reponse(200)) // refresh
      .mockResolvedValueOnce(reponse(200, { comptes: ["ok"] })); // rejeu

    await expect(api.get("/comptes")).resolves.toEqual({ comptes: ["ok"] });

    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(fetchMock.mock.calls[1][0]).toBe(`${BASE}/auth/refresh`);
    expect(fetchMock.mock.calls[1][1].method).toBe("POST");
  });

  it("ne rejoue pas une deuxième fois si le rejeu échoue encore", async () => {
    fetchMock
      .mockResolvedValueOnce(reponse(401, { message: "Token expiré." }))
      .mockResolvedValueOnce(reponse(200)) // refresh OK
      .mockResolvedValueOnce(reponse(401, { message: "Toujours refusé." })); // rejeu KO

    await expect(api.get("/comptes")).rejects.toMatchObject({ statut: 401 });

    // 3 appels et pas davantage : pas de boucle de refresh.
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it("prévient que la session est perdue quand le refresh échoue", async () => {
    const sessionPerdue = vi.fn();
    definirGestionnaireSessionExpiree(sessionPerdue);

    fetchMock
      .mockResolvedValueOnce(reponse(401, { message: "Token expiré." }))
      .mockResolvedValueOnce(reponse(401)); // refresh refusé

    await expect(api.get("/comptes")).rejects.toMatchObject({ statut: 401 });
    expect(sessionPerdue).toHaveBeenCalledOnce();
  });

  it("traite un refresh injoignable comme un refresh échoué", async () => {
    const sessionPerdue = vi.fn();
    definirGestionnaireSessionExpiree(sessionPerdue);

    fetchMock
      .mockResolvedValueOnce(reponse(401, { message: "Token expiré." }))
      .mockRejectedValueOnce(new TypeError("Failed to fetch"));

    await expect(api.get("/comptes")).rejects.toMatchObject({ statut: 401 });
    expect(sessionPerdue).toHaveBeenCalledOnce();
  });

  it.each([
    "/auth/login",
    "/auth/register",
    "/auth/refresh",
    "/auth/mot-de-passe-oublie",
    "/auth/reinitialiser-mot-de-passe",
  ])("ne tente aucun refresh sur %s", async (route) => {
    const sessionPerdue = vi.fn();
    definirGestionnaireSessionExpiree(sessionPerdue);
    fetchMock.mockResolvedValue(reponse(401, { message: "Identifiants invalides." }));

    await expect(api.post(route, {})).rejects.toThrow("Identifiants invalides.");

    // Un 401 sur ces routes veut dire « mauvais identifiants », pas « token
    // expiré » : rejouer serait au mieux inutile, au pire une boucle infinie.
    expect(fetchMock).toHaveBeenCalledOnce();
    expect(sessionPerdue).not.toHaveBeenCalled();
  });

  it("ne déclenche qu'un seul refresh pour plusieurs 401 concurrents", async () => {
    // Le dashboard tire trois requêtes en parallèle : sans le verrou de
    // `refreshEnCours`, trois refresh partiraient et la rotation du refresh
    // token en invaliderait deux.
    let appelsRefresh = 0;
    const appelsParUrl = new Map<string, number>();

    fetchMock.mockImplementation(async (url: string) => {
      if (url.endsWith("/auth/refresh")) {
        appelsRefresh++;
        return reponse(200);
      }
      const n = (appelsParUrl.get(url) ?? 0) + 1;
      appelsParUrl.set(url, n);
      return n === 1 ? reponse(401, { message: "Token expiré." }) : reponse(200, { url });
    });

    await Promise.all([api.get("/comptes"), api.get("/transactions"), api.get("/dashboard")]);

    expect(appelsRefresh).toBe(1);
  });
});

describe("messageErreur", () => {
  it("privilégie le message d'une ApiError", () => {
    expect(messageErreur(new ApiError("Solde insuffisant.", 400))).toBe("Solde insuffisant.");
  });

  it("accepte une Error standard", () => {
    expect(messageErreur(new TypeError("Failed to fetch"))).toBe("Failed to fetch");
  });

  it("retombe sur le défaut pour ce qui n'est pas une erreur", () => {
    expect(messageErreur(null)).toBe("Une erreur est survenue.");
    expect(messageErreur({ oups: true }, "Réessayez.")).toBe("Réessayez.");
  });

  it("retombe sur le défaut pour une Error au message vide", () => {
    expect(messageErreur(new Error(""))).toBe("Une erreur est survenue.");
  });
});
