import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Clientes from "./pages/Clientes";
import Orcamentos from "./pages/Orcamentos";
import Pricing from "./pages/Pricing";

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
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
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
            path="/pricing"
            element={
              <RotaProtegida>
                <Pricing />
              </RotaProtegida>
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
