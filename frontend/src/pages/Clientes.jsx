import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getClientes, criarCliente, apagarCliente } from "../services/api";

// ── Validações ────────────────────────────────────────────
const validarNIF = (v) => {
  if (!v) return "";
  if (!/^\d{9}$/.test(v)) return "NIF deve ter exactamente 9 dígitos.";
  return "";
};
const validarTelefone = (v) => {
  if (!v) return "";
  if (!/^(9[1236]\d{7}|2\d{8})$/.test(v.replace(/\s/g, "")))
    return "Telefone inválido. Ex: 914 075 516";
  return "";
};
const validarCP = (v) => {
  if (!v) return "";
  if (!/^\d{4}-\d{3}$/.test(v)) return "Formato: 0000-000";
  return "";
};

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [dados, setDados] = useState({
    nome: "", email: "", telefone: "", nif: "", morada: "", codigoPostal: "",
  });
  const [errosCampos, setErrosCampos] = useState({});
  const navigate = useNavigate();

  const carregarClientes = async () => {
    try {
      const res = await getClientes();
      setClientes(res.data);
    } catch {
      setErro("Erro ao carregar clientes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { carregarClientes(); }, []);

  const handleChange = (e) => {
    setDados({ ...dados, [e.target.name]: e.target.value });
    setErrosCampos((prev) => ({ ...prev, [e.target.name]: "" }));
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    let msg = "";
    if (name === "nif") msg = validarNIF(value);
    if (name === "telefone") msg = validarTelefone(value);
    if (name === "codigoPostal") msg = validarCP(value);
    setErrosCampos((prev) => ({ ...prev, [name]: msg }));
  };

  const validarTudo = () => {
    const erros = {
      nif: validarNIF(dados.nif),
      telefone: validarTelefone(dados.telefone),
      codigoPostal: validarCP(dados.codigoPostal),
    };
    setErrosCampos(erros);
    return !Object.values(erros).some((e) => e !== "");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validarTudo()) return;
    try {
      const moradaCompleta = dados.codigoPostal
        ? dados.morada + (dados.morada ? ", " : "") + dados.codigoPostal
        : dados.morada;
      await criarCliente({ ...dados, morada: moradaCompleta });
      setDados({ nome: "", email: "", telefone: "", nif: "", morada: "", codigoPostal: "" });
      setErrosCampos({});
      setMostrarForm(false);
      carregarClientes();
    } catch {
      setErro("Erro ao criar cliente.");
    }
  };

  const handleApagar = async (id) => {
    if (!window.confirm("Tens a certeza?")) return;
    try {
      await apagarCliente(id);
      carregarClientes();
    } catch {
      setErro("Erro ao apagar cliente.");
    }
  };

  return (
    <div style={s.container}>
      <nav style={s.nav}>
        <h2 style={s.logo} onClick={() => navigate("/dashboard")}>OrcamentosPME</h2>
        <button style={s.btnVoltar} onClick={() => navigate("/dashboard")}>← Dashboard</button>
      </nav>

      <div style={s.conteudo}>
        <div style={s.header}>
          <h1 style={s.titulo}>Clientes</h1>
          <button style={s.btnNovo} onClick={() => setMostrarForm(!mostrarForm)}>
            {mostrarForm ? "Cancelar" : "+ Novo Cliente"}
          </button>
        </div>

        {erro && <div style={s.erro}>{erro}</div>}

        {mostrarForm && (
          <div style={s.card}>
            <h3 style={s.cardTitulo}>Novo Cliente</h3>
            <form onSubmit={handleSubmit}>
              <div style={s.grid2}>
                {/* Nome */}
                <div style={s.campo}>
                  <label style={s.label}>Nome *</label>
                  <input
                    style={s.input}
                    name="nome"
                    value={dados.nome}
                    onChange={handleChange}
                    placeholder="Ex: João Silva"
                    required
                  />
                </div>
                {/* Email */}
                <div style={s.campo}>
                  <label style={s.label}>Email</label>
                  <input
                    style={s.input}
                    name="email"
                    type="email"
                    value={dados.email}
                    onChange={handleChange}
                    placeholder="Ex: joao@empresa.pt"
                  />
                </div>
                {/* Telefone */}
                <div style={s.campo}>
                  <label style={s.label}>Telefone</label>
                  <input
                    style={{ ...s.input, ...(errosCampos.telefone ? s.inputErro : {}) }}
                    name="telefone"
                    value={dados.telefone}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Ex: 914 075 516"
                  />
                  {errosCampos.telefone && <span style={s.erroInline}>{errosCampos.telefone}</span>}
                </div>
                {/* NIF */}
                <div style={s.campo}>
                  <label style={s.label}>NIF</label>
                  <input
                    style={{ ...s.input, ...(errosCampos.nif ? s.inputErro : {}) }}
                    name="nif"
                    value={dados.nif}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Ex: 318674432"
                    maxLength={9}
                  />
                  {errosCampos.nif && <span style={s.erroInline}>{errosCampos.nif}</span>}
                </div>
              </div>

              {/* Morada */}
              <div style={s.campo}>
                <label style={s.label}>Morada</label>
                <input
                  style={s.input}
                  name="morada"
                  value={dados.morada}
                  onChange={handleChange}
                  placeholder="Ex: Rua Principal, Nº 10"
                />
              </div>

              {/* Código Postal */}
              <div style={{ ...s.campo, maxWidth: 200 }}>
                <label style={s.label}>Código Postal</label>
                <input
                  style={{ ...s.input, ...(errosCampos.codigoPostal ? s.inputErro : {}) }}
                  name="codigoPostal"
                  value={dados.codigoPostal}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Ex: 6000-000"
                  maxLength={8}
                />
                {errosCampos.codigoPostal && <span style={s.erroInline}>{errosCampos.codigoPostal}</span>}
              </div>

              <button style={s.btnGuardar} type="submit">Guardar Cliente</button>
            </form>
          </div>
        )}

        {loading ? (
          <p style={s.mensagem}>A carregar...</p>
        ) : clientes.length === 0 ? (
          <p style={s.mensagem}>Ainda não tens clientes. Cria o primeiro!</p>
        ) : (
          <div style={s.tabela}>
            <div style={s.tabelaHeader}>
              <span>Nome</span>
              <span>Email</span>
              <span>Telefone</span>
              <span>NIF</span>
              <span>Ações</span>
            </div>
            {clientes.map((c) => (
              <div key={c._id} style={s.tabelaLinha}>
                <div>
                  <div style={s.nomeCliente}>{c.nome}</div>
                  {c.morada && <div style={s.moradaCliente}>{c.morada}</div>}
                </div>
                <span style={s.tabelaTexto}>{c.email || "-"}</span>
                <span style={s.tabelaTexto}>{c.telefone || "-"}</span>
                <span style={s.tabelaTexto}>{c.nif || "-"}</span>
                <button style={s.btnApagar} onClick={() => handleApagar(c._id)}>Apagar</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const s = {
  container: { minHeight: "100vh", backgroundColor: "#f0f2f5" },
  nav: { backgroundColor: "#fff", padding: "16px 32px", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" },
  logo: { color: "#1a1a2e", margin: 0, cursor: "pointer" },
  btnVoltar: { padding: "8px 16px", backgroundColor: "transparent", border: "1px solid #ddd", borderRadius: "6px", cursor: "pointer" },
  conteudo: { padding: "40px 32px" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" },
  titulo: { color: "#1a1a2e", margin: 0 },
  btnNovo: { padding: "10px 20px", backgroundColor: "#2563eb", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "600" },
  erro: { backgroundColor: "#fee2e2", color: "#dc2626", padding: "10px", borderRadius: "6px", marginBottom: "16px" },
  card: { backgroundColor: "#fff", padding: "24px", borderRadius: "12px", boxShadow: "0 2px 12px rgba(0,0,0,0.08)", marginBottom: "24px" },
  cardTitulo: { color: "#1a1a2e", marginTop: 0, marginBottom: "16px" },
  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" },
  campo: { marginBottom: "16px" },
  label: { display: "block", marginBottom: "6px", color: "#333", fontWeight: "500", fontSize: "14px" },
  input: { width: "100%", padding: "10px 12px", border: "1px solid #ddd", borderRadius: "6px", fontSize: "14px", boxSizing: "border-box" },
  inputErro: { border: "1px solid #ef4444" },
  erroInline: { fontSize: 11, color: "#ef4444", marginTop: 4, display: "block" },
  btnGuardar: { padding: "10px 24px", backgroundColor: "#16a34a", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "600" },
  mensagem: { textAlign: "center", color: "#666", padding: "40px" },
  tabela: { backgroundColor: "#fff", borderRadius: "12px", boxShadow: "0 2px 12px rgba(0,0,0,0.08)", overflow: "hidden" },
  tabelaHeader: { display: "grid", gridTemplateColumns: "2fr 2fr 1fr 1fr 1fr", padding: "12px 24px", backgroundColor: "#f8fafc", fontWeight: "600", color: "#666", fontSize: "14px" },
  tabelaLinha: { display: "grid", gridTemplateColumns: "2fr 2fr 1fr 1fr 1fr", padding: "16px 24px", borderTop: "1px solid #f0f2f5", alignItems: "center" },
  nomeCliente: { fontWeight: "600", color: "#1a1a2e" },
  moradaCliente: { fontSize: "12px", color: "#9ca3af", marginTop: 2 },
  tabelaTexto: { color: "#666", fontSize: "14px" },
  btnApagar: { padding: "6px 12px", backgroundColor: "#ef4444", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "12px" },
};
