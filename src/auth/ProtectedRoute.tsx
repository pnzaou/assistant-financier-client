import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuth } from "./AuthContext";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { utilisateur, chargement } = useAuth();

  if (chargement) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--texte-doux)",
        }}
      >
        Chargement…
      </div>
    );
  }

  if (!utilisateur) return <Navigate to="/connexion" replace />;
  return <>{children}</>;
}