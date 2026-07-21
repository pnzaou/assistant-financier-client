import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import { ProtectedRoute } from "./auth/ProtectedRoute";
import { Connexion } from "./pages/Connexion";
import { Inscription } from "./pages/Inscription";
import { MotDePasseOublie } from "./pages/MotDePasseOublie";
import { ReinitialiserMotDePasse } from "./pages/ReinitialiserMotDePasse";
import { VerifierEmail } from "./pages/VerifierEmail";

function Accueil() {
  return (
    <div style={{ padding: "var(--esp-4)" }}>
      <h1>Tableau de bord (à venir)</h1>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/connexion" element={<Connexion />} />
          <Route path="/inscription" element={<Inscription />} />
          <Route path="/mot-de-passe-oublie" element={<MotDePasseOublie />} />
          <Route path="/reinitialiser-mot-de-passe" element={<ReinitialiserMotDePasse />} />
          <Route path="/verifier-email" element={<VerifierEmail />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Accueil />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;