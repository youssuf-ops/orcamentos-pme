// frontend/src/App.jsx
// Alterações: rota / agora é a LandingPage pública
// /dashboard redireciona utilizadores autenticados

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Perfil from "./pages/Perfil";
import Dashboard from "./pages/Dashboard";
import Clientes from "./pages/Clientes";
import Orcamentos from "./pages/Orcamentos";
import Pricing from "./pages/Pricing";
import LandingPage from "./pages/LandingPage";

function RotaProtegida({ children }) {
  const { user, loading } = useAuth();
  if (loading)
    return (
      <div style={{ textAlign: "center", padding: "40px" }}>A carregar...</div>
    );
  return user ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Pública — qualquer pessoa vê */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protegidas — exigem login */}
          <Route
            path="/dashboard"
            element={
              <RotaProtegida>
                <Dashboard />
              </RotaProtegida>
            }
          />
          <Route
            path="/clientes"
            element={
              <RotaProtegida>
                <Clientes />
              </RotaProtegida>
            }
          />
          <Route
            path="/orcamentos"
            element={
              <RotaProtegida>
                <Orcamentos />
              </RotaProtegida>
            }
          />
          <Route
            path="/perfil"
            element={
              <RotaProtegida>
                <Perfil />
              </RotaProtegida>
            }
          />
          <Route
            path="/pricing"
            element={
              <RotaProtegida>
                <Pricing />
              </RotaProtegida>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
