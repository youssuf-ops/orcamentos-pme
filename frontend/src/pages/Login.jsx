import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setErro(err.response?.data?.erro || "Erro ao fazer login.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.titulo}>OrcamentosPME</h1>
        <p style={styles.subtitulo}>Entra na tua conta</p>

        {erro && <div style={styles.erro}>{erro}</div>}

        <form onSubmit={handleSubmit}>
          <div style={styles.campo}>
            <label style={styles.label}>Email</label>
            <input
              style={styles.input}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@empresa.com"
              required
            />
          </div>
          <div style={styles.campo}>
            <label style={styles.label}>Password</label>
            <input
              style={styles.input}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••"
              required
            />
          </div>
          <button style={styles.botao} type="submit" disabled={loading}>
            {loading ? "A entrar..." : "Entrar"}
          </button>
        </form>

        <p style={styles.link}>
          Não tens conta?{" "}
          <Link to="/register" style={styles.linkTexto}>
            Regista-te
          </Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f0f2f5",
  },
  card: {
    backgroundColor: "#fff",
    padding: "40px",
    borderRadius: "12px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
    width: "100%",
    maxWidth: "400px",
  },
  titulo: { textAlign: "center", color: "#1a1a2e", marginBottom: "4px" },
  subtitulo: { textAlign: "center", color: "#666", marginBottom: "24px" },
  erro: {
    backgroundColor: "#fee2e2",
    color: "#dc2626",
    padding: "10px",
    borderRadius: "6px",
    marginBottom: "16px",
    fontSize: "14px",
  },
  campo: { marginBottom: "16px" },
  label: {
    display: "block",
    marginBottom: "6px",
    color: "#333",
    fontWeight: "500",
  },
  input: {
    width: "100%",
    padding: "10px 12px",
    border: "1px solid #ddd",
    borderRadius: "6px",
    fontSize: "14px",
    boxSizing: "border-box",
  },
  botao: {
    width: "100%",
    padding: "12px",
    backgroundColor: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    marginTop: "8px",
  },
  link: { textAlign: "center", marginTop: "16px", color: "#666" },
  linkTexto: { color: "#2563eb", textDecoration: "none", fontWeight: "500" },
};
