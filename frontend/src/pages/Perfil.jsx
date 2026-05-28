// frontend/src/pages/Perfil.jsx
// Página para o utilizador editar os dados da empresa
// Estes dados aparecem no cabeçalho do PDF emitido

import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getPerfil, atualizarPerfil } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function Perfil() {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();

  const [dados, setDados] = useState({
    nome: "",
    empresa: "",
    nif: "",
    morada: "",
    telefone: "",
  });
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [erro, setErro] = useState("");

  const carregarPerfil = useCallback(async () => {
    try {
      const res = await getPerfil();
      const u = res.data;
      setDados({
        nome: u.nome || "",
        empresa: u.empresa || "",
        nif: u.nif || "",
        morada: u.morada || "",
        telefone: u.telefone || "",
      });
    } catch {
      setErro("Erro ao carregar perfil.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregarPerfil();
  }, [carregarPerfil]);

  const handleChange = (e) => {
    setDados({ ...dados, [e.target.name]: e.target.value });
    setSucesso(false);
    setErro("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGuardando(true);
    setErro("");
    setSucesso(false);
    try {
      const res = await atualizarPerfil(dados);
      // Actualizar o user no contexto para o Dashboard reflectir
      if (setUser) {
        setUser((prev) => ({ ...prev, ...res.data }));
      }
      // Actualizar localStorage
      const userActual = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem("user", JSON.stringify({ ...userActual, ...res.data }));
      setSucesso(true);
    } catch {
      setErro("Erro ao guardar perfil. Tenta novamente.");
    } finally {
      setGuardando(false);
    }
  };

  if (loading) {
    return (
      <div style={s.container}>
        <p style={{ textAlign: "center", padding: 40, color: "#666" }}>A carregar...</p>
      </div>
    );
  }

  return (
    <div style={s.container}>
      {/* NAV */}
      <nav style={s.nav}>
        <h2 style={s.logo} onClick={() => navigate("/dashboard")}>OrcamentosPME</h2>
        <button style={s.btnVoltar} onClick={() => navigate("/dashboard")}>
          ← Dashboard
        </button>
      </nav>

      <div style={s.conteudo}>
        <div style={s.header}>
          <div>
            <h1 style={s.titulo}>Perfil da Empresa</h1>
            <p style={s.subtitulo}>
              Estes dados aparecem no cabeçalho de todos os teus PDFs.
            </p>
          </div>
        </div>

        {/* INFO BOX */}
        <div style={s.infoBox}>
          <span style={s.infoIcon}>💡</span>
          <span style={s.infoTexto}>
            Preenche o nome da empresa, NIF e morada para que os teus orçamentos
            tenham aspeto profissional e legal.
          </span>
        </div>

        <form onSubmit={handleSubmit} style={s.form}>

          {/* DADOS DE ACESSO — só leitura */}
          <div style={s.seccao}>
            <h3 style={s.seccaoTitulo}>Dados de acesso</h3>
            <div style={s.campo}>
              <label style={s.label}>Email</label>
              <input
                style={{ ...s.input, background: "#f9fafb", color: "#9ca3af" }}
                type="email"
                value={user?.email || ""}
                disabled
              />
              <span style={s.hint}>O email não pode ser alterado.</span>
            </div>
          </div>

          {/* DADOS DA EMPRESA */}
          <div style={s.seccao}>
            <h3 style={s.seccaoTitulo}>Dados da empresa</h3>
            <div style={s.grid2}>
              <div style={s.campo}>
                <label style={s.label}>Nome completo *</label>
                <input
                  style={s.input}
                  type="text"
                  name="nome"
                  value={dados.nome}
                  onChange={handleChange}
                  placeholder="O teu nome ou nome da empresa"
                  required
                />
              </div>
              <div style={s.campo}>
                <label style={s.label}>Nome comercial / Empresa</label>
                <input
                  style={s.input}
                  type="text"
                  name="empresa"
                  value={dados.empresa}
                  onChange={handleChange}
                  placeholder="Ex: Albiclick, Lda."
                />
              </div>
              <div style={s.campo}>
                <label style={s.label}>NIF</label>
                <input
                  style={s.input}
                  type="text"
                  name="nif"
                  value={dados.nif}
                  onChange={handleChange}
                  placeholder="Ex: 318674432"
                  maxLength={9}
                />
              </div>
              <div style={s.campo}>
                <label style={s.label}>Telefone</label>
                <input
                  style={s.input}
                  type="tel"
                  name="telefone"
                  value={dados.telefone}
                  onChange={handleChange}
                  placeholder="Ex: 914 075 516"
                />
              </div>
            </div>
            <div style={s.campo}>
              <label style={s.label}>Morada</label>
              <input
                style={s.input}
                type="text"
                name="morada"
                value={dados.morada}
                onChange={handleChange}
                placeholder="Ex: Rua Principal, Nº 10, 6000-000 Castelo Branco"
              />
            </div>
          </div>

          {/* FEEDBACK */}
          {erro && <div style={s.erro}>{erro}</div>}
          {sucesso && (
            <div style={s.sucesso}>
              ✅ Perfil guardado com sucesso. Os teus PDFs já incluem os dados actualizados.
            </div>
          )}

          <button type="submit" style={s.btnGuardar} disabled={guardando}>
            {guardando ? "A guardar..." : "Guardar alterações"}
          </button>
        </form>
      </div>
    </div>
  );
}

const s = {
  container: { minHeight: "100vh", backgroundColor: "#f0f2f5" },
  nav: {
    backgroundColor: "#fff",
    padding: "16px 32px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  },
  logo: { color: "#1a1a2e", margin: 0, cursor: "pointer" },
  btnVoltar: {
    padding: "8px 16px",
    backgroundColor: "transparent",
    border: "1px solid #ddd",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: 13,
  },
  conteudo: { padding: "40px 32px", maxWidth: 720, margin: "0 auto" },
  header: { marginBottom: 24 },
  titulo: { color: "#1a1a2e", margin: 0, marginBottom: 4 },
  subtitulo: { color: "#666", fontSize: 14, margin: 0 },
  infoBox: {
    display: "flex",
    alignItems: "flex-start",
    gap: 12,
    background: "#eff6ff",
    border: "1px solid #bfdbfe",
    borderRadius: 8,
    padding: "12px 16px",
    marginBottom: 24,
  },
  infoIcon: { fontSize: 18, flexShrink: 0 },
  infoTexto: { fontSize: 13, color: "#1d4ed8", lineHeight: 1.6 },
  form: {
    background: "#fff",
    borderRadius: 12,
    boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
    padding: 28,
  },
  seccao: { marginBottom: 28 },
  seccaoTitulo: {
    color: "#1a1a2e",
    fontSize: 15,
    fontWeight: 700,
    marginBottom: 16,
    marginTop: 0,
    paddingBottom: 10,
    borderBottom: "1px solid #f3f4f6",
  },
  grid2: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 16,
  },
  campo: { marginBottom: 16 },
  label: {
    display: "block",
    marginBottom: 6,
    color: "#374151",
    fontWeight: 500,
    fontSize: 13,
  },
  input: {
    width: "100%",
    padding: "10px 12px",
    border: "1px solid #e5e7eb",
    borderRadius: 6,
    fontSize: 14,
    boxSizing: "border-box",
    outline: "none",
    fontFamily: "inherit",
  },
  hint: { fontSize: 11, color: "#9ca3af", marginTop: 4, display: "block" },
  erro: {
    background: "#fee2e2",
    color: "#dc2626",
    padding: "10px 14px",
    borderRadius: 6,
    fontSize: 13,
    marginBottom: 16,
  },
  sucesso: {
    background: "#dcfce7",
    color: "#16a34a",
    padding: "10px 14px",
    borderRadius: 6,
    fontSize: 13,
    marginBottom: 16,
  },
  btnGuardar: {
    padding: "11px 28px",
    backgroundColor: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
    fontWeight: 600,
    fontSize: 14,
    fontFamily: "inherit",
  },
};
