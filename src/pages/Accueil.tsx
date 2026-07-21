import { useEffect, useState, useCallback } from "react";
import { AppLayout } from "../components/AppLayout";
import { CreerCompte } from "./CreerCompte";
import { Card } from "../components/Card";
import { listerComptes } from "../lib/comptes";
import { formaterMontant, LIBELLES_TYPE_COMPTE } from "../lib/format";
import type { Compte } from "../lib/types";

export function Accueil() {
  const [comptes, setComptes] = useState<Compte[] | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);

  const charger = useCallback(() => {
    listerComptes()
      .then((data) => {
        setErreur(null);
        setComptes(data.comptes);
      })
      .catch(() => setErreur("Impossible de charger vos comptes."));
  }, []);

  useEffect(() => {
    charger();
  }, [charger]);

  return (
    <AppLayout>
      {comptes === null && !erreur && (
        <p style={{ color: "var(--texte-doux)", textAlign: "center" }}>Chargement…</p>
      )}

      {erreur && (
        <p style={{ color: "var(--erreur)", textAlign: "center" }}>{erreur}</p>
      )}

      {comptes !== null && comptes.length === 0 && (
        <CreerCompte premierCompte onCree={charger} />
      )}

      {comptes !== null && comptes.length > 0 && (
        <>
          <h1 style={{ fontSize: 24, fontWeight: 600, margin: "0 0 var(--esp-3)" }}>
            Vos comptes
          </h1>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
              gap: "var(--esp-2)",
            }}
          >
            {comptes.map((c) => (
              <Card key={c.id}>
                <p style={{ fontSize: 13, color: "var(--texte-doux)", margin: "0 0 4px" }}>
                  {LIBELLES_TYPE_COMPTE[c.type]}
                </p>
                <p style={{ fontSize: 16, fontWeight: 600, margin: "0 0 8px" }}>{c.nom}</p>
                <p style={{ fontSize: 22, fontWeight: 600, margin: 0 }}>
                  {formaterMontant(c.solde, c.devise)}
                </p>
              </Card>
            ))}
          </div>
        </>
      )}
    </AppLayout>
  );
}