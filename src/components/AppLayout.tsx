import type { ReactNode } from "react";
import { Logo } from "./Logo";
import { useAuth } from "../auth/AuthContext";

export function AppLayout({ children }: { children: ReactNode }) {
  const { utilisateur, logout } = useAuth();

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px var(--esp-3)",
          borderBottom: "1px solid var(--hairline)",
          background: "var(--blanc)",
        }}
      >
        <Logo variante="complet" taille={36} />
        <div style={{ display: "flex", alignItems: "center", gap: "var(--esp-2)" }}>
          {utilisateur && (
            <span style={{ fontSize: 14, color: "var(--texte)" }}>
              {utilisateur.prenom} {utilisateur.nom}
            </span>
          )}
          <button
            onClick={logout}
            style={{
              border: "1px solid var(--hairline)",
              background: "transparent",
              borderRadius: "var(--rayon-pill)",
              padding: "8px 16px",
              fontSize: 13,
              fontWeight: 600,
              fontFamily: "var(--police)",
              color: "var(--encre)",
              cursor: "pointer",
            }}
          >
            Déconnexion
          </button>
        </div>
      </header>

      <main
        style={{
          flex: 1,
          padding: "var(--esp-4) var(--esp-3)",
          maxWidth: 960,
          width: "100%",
          margin: "0 auto",
        }}
      >
        {children}
      </main>
    </div>
  );
}