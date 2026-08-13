import { beforeEach, describe, expect, it, vi } from "vitest";
import * as transactionsApi from "../lib/transactions";
import { useTransactionsStore } from "./transactionsStore";

vi.mock("../lib/transactions", () => ({
  creerTransaction: vi.fn(),
  listerTransactions: vi.fn(),
  obtenirTransaction: vi.fn(),
  modifierTransaction: vi.fn(),
  supprimerTransaction: vi.fn(),
}));

describe("transactionsStore", () => {
  beforeEach(() => {
    useTransactionsStore.getState().reinitialiser();
    vi.clearAllMocks();
  });

  it("charge une transaction via l'API dédiée", async () => {
    const transaction = {
      id: "txn-1",
      compteId: "compte-1",
      type: "DEPENSE" as const,
      montant: 1250,
      libelle: "Courses",
      dateOperation: "2026-07-28",
      categorieId: "cat-1",
      note: null,
      pointee: false,
    };

    vi.mocked(transactionsApi.obtenirTransaction).mockResolvedValue({ transaction });

    const resultat = await useTransactionsStore.getState().chargerUneTransaction("txn-1");

    expect(transactionsApi.obtenirTransaction).toHaveBeenCalledWith("txn-1");
    expect(resultat).toEqual(transaction);
  });
});
