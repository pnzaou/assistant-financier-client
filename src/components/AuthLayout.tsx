import type { ReactNode } from "react";
import { Logo } from "./Logo";
import { Card } from "./Card";

type Props = {
  titre: string;
  sousTitre?: string;
  children: ReactNode;
  bas?: ReactNode;
};

export function AuthLayout({ titre, sousTitre, children, bas }: Props) {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "var(--esp-3)",
      }}
    >
      <div style={{ width: "100%", maxWidth: 420 }}>
        <Card>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "var(--esp-3)" }}>
            <Logo variante="complet" taille={44} />
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 600, textAlign: "center", margin: "0 0 8px" }}>
            {titre}
          </h1>
          {sousTitre && (
            <p
              style={{
                textAlign: "center",
                color: "var(--texte)",
                fontSize: 15,
                margin: "0 0 var(--esp-3)",
              }}
            >
              {sousTitre}
            </p>
          )}
          {children}
        </Card>
        {bas && (
          <p style={{ textAlign: "center", marginTop: "var(--esp-2)", fontSize: 14, color: "var(--texte)" }}>
            {bas}
          </p>
        )}
      </div>
    </main>
  );
}