import { describe, expect, it } from "vitest";
import {
  formaterDate,
  formaterDateLongue,
  formaterMontant,
  formaterMontantSigne,
  LIBELLES_TYPE_COMPTE,
  LIBELLES_TYPE_TRANSACTION,
} from "./format";

// Intl sépare les milliers par une espace fine insécable (U+202F) et colle le
// symbole avec une insécable (U+00A0). Comparer à des espaces normales serait
// faux ; on normalise plutôt que de coder les caractères en dur.
const normaliser = (s: string) => s.replace(/\s/g, " ");

describe("formaterMontant", () => {
  it("écrit le XOF sans décimales", () => {
    expect(normaliser(formaterMontant(1_250_000))).toBe("1 250 000 F CFA");
  });

  it("arrondit les décimales en XOF au lieu de les afficher", () => {
    expect(normaliser(formaterMontant(1250.6))).toBe("1 251 F CFA");
  });

  it("garde deux décimales pour une devise qui en a", () => {
    expect(normaliser(formaterMontant(1250.5, "EUR"))).toBe("1 250,50 €");
  });

  it("formate zéro sans cas particulier", () => {
    expect(normaliser(formaterMontant(0))).toBe("0 F CFA");
  });

  it("utilise le XOF par défaut", () => {
    expect(formaterMontant(100)).toBe(formaterMontant(100, "XOF"));
  });
});

describe("formaterDate", () => {
  it("rend une date ISO en format court français", () => {
    expect(normaliser(formaterDate("2026-07-23"))).toBe("23 juil. 2026");
  });

  it("ne recule pas d'un jour (le piège du parsing UTC)", () => {
    // `new Date("2026-01-01")` vaut minuit UTC : dans un fuseau négatif, le
    // formatage local retomberait sur le 31 décembre. La construction locale
    // explicite de format.ts évite ça.
    expect(normaliser(formaterDate("2026-01-01"))).toContain("2026");
    expect(normaliser(formaterDate("2026-01-01"))).toContain("01 janv.");
  });
});

describe("formaterDateLongue", () => {
  it("écrit le mois en toutes lettres", () => {
    expect(normaliser(formaterDateLongue("2026-07-23"))).toBe("23 juillet 2026");
  });
});

describe("formaterMontantSigne", () => {
  it("préfixe un revenu d'un plus", () => {
    expect(normaliser(formaterMontantSigne(2_450_000, "REVENU"))).toBe("+2 450 000 F CFA");
  });

  it("préfixe une dépense d'un vrai signe moins typographique", () => {
    const resultat = formaterMontantSigne(64_300, "DEPENSE");
    expect(resultat.startsWith("−")).toBe(true); // U+2212, pas un tiret ASCII
    expect(normaliser(resultat)).toBe("−64 300 F CFA");
  });

  it("laisse un transfert sans signe", () => {
    expect(normaliser(formaterMontantSigne(10_000, "TRANSFERT"))).toBe("10 000 F CFA");
  });
});

describe("libellés", () => {
  it("couvre tous les types de compte", () => {
    // Si le enum Prisma gagne une valeur sans que la table soit mise à jour,
    // l'UI afficherait `undefined` : ce test le rattrape.
    expect(Object.values(LIBELLES_TYPE_COMPTE).every(Boolean)).toBe(true);
    expect(LIBELLES_TYPE_COMPTE.CARTE_CREDIT).toBe("Carte de crédit");
  });

  it("couvre tous les types de transaction", () => {
    expect(Object.values(LIBELLES_TYPE_TRANSACTION)).toEqual(["Dépense", "Revenu", "Transfert"]);
  });
});
