import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import { ProtectedRoute } from "./auth/ProtectedRoute";
import { AppShell } from "./components/layout/AppShell";
import { GardeOnboarding } from "./components/layout/GardeOnboarding";

// Écrans d'auth (inchangés)
import { Connexion } from "./pages/Connexion";
import { Inscription } from "./pages/Inscription";
import { MotDePasseOublie } from "./pages/MotDePasseOublie";
import { ReinitialiserMotDePasse } from "./pages/ReinitialiserMotDePasse";
import { VerifierEmail } from "./pages/VerifierEmail";

// Onboarding : ex-Accueil, en carte centrée plein écran
import { Bienvenue } from "./pages/Bienvenue";

// Écrans applicatifs — étapes 2 à 5
import { Dashboard } from "./pages/Dashboard";
import { Comptes } from "./pages/Comptes";
import { NouveauCompte } from "./pages/NouveauCompte";
import { Historique } from "./pages/Historique";
import { NouvelleTransaction } from "./pages/NouvelleTransaction";
import { DetailTransaction } from "./pages/DetailTransaction";

/**
 * Arbre de routes en trois niveaux :
 *
 *   public            → écrans d'auth, carte centrée
 *   ProtectedRoute    → exige une session (sinon /connexion)
 *     GardeOnboarding → exige au moins un compte (sinon /bienvenue)
 *       AppShell      → sidebar + topbar, gabarit des pages internes
 *
 * /bienvenue vit sous GardeOnboarding mais HORS d'AppShell : plein écran
 * sans sidebar, conforme à la maquette.
 */

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* --- Public --- */}
          <Route path="/connexion" element={<Connexion />} />
          <Route path="/inscription" element={<Inscription />} />
          <Route path="/mot-de-passe-oublie" element={<MotDePasseOublie />} />
          <Route path="/reinitialiser-mot-de-passe" element={<ReinitialiserMotDePasse />} />
          <Route path="/verifier-email" element={<VerifierEmail />} />

          {/* --- Privé --- */}
          <Route element={<ProtectedRoute />}>
            <Route element={<GardeOnboarding />}>
              {/* Onboarding : plein écran, sans coquille */}
              <Route path="/bienvenue" element={<Bienvenue />} />

              {/* Application : dans la coquille */}
              <Route element={<AppShell />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/comptes/nouveau" element={<NouveauCompte />} />
                <Route path="/transactions" element={<Historique />} />
                <Route path="/transactions/nouvelle" element={<NouvelleTransaction />} />
                <Route path="/transactions/:id" element={<DetailTransaction />} />
                <Route path="/comptes" element={<Comptes />} />
              </Route>
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;