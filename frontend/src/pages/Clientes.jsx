import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getClientes, criarCliente, apagarCliente } from "../services/api";

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [dados, setDados] = useState({
    nome: "",
    email: "",
    telefone: "",
    nif: "",
    morada: "",
  });
  const navigate = useNavigate(); 

  const carregarClientes = async () => {
    try {
      const res = await getClientes();
      setClientes(res.data);
    } catch (err) {
      setErro("Erro ao carregar clientes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarClientes();
  }, []);

  

  const handleChange = (e) => {
    setDados({ ...dados, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await criarCliente(dados);
      setDados({ nome: "", email: "", telefone: "", nif: "", morada: "" });
      setMostrarForm(false);
      carregarClientes();
    } catch (err) {
      setErro("Erro ao criar cliente.");
    }
  };

  const handleApagar = async (id) => {
    if (!window.confirm("Tens a certeza?")) return;
    try {
      await apagarCliente(id);
      carregarClientes();
    } catch (err) {
      setErro("Erro ao apagar cliente.");
    }
  };

  return (
    <div style={styles.container}>
      <nav style={styles.nav}>
        <h2 style={styles.logo} onClick={() => navigate("/dashboard")}>
          OrcamentosPME
        </h2>
        <button
          style={styles.botaoVoltar}
          onClick={() => navigate("/dashboard")}
        >
          ← Dashboard
        </button>
      </nav>

      <div style={styles.conteudo}>
        <div style={styles.header}>
          <h1 style={styles.titulo}>Clientes</h1>
          <button
            style={styles.botaoNovo}
            onClick={() => setMostrarForm(!mostrarForm)}
          >
            {mostrarForm ? "Cancelar" : "+ Novo Cliente"}
          </button>
        </div>

        {erro && <div style={styles.erro}>{erro}</div>}

        {mostrarForm && (
          <div style={styles.card}>
            <h3 style={styles.cardTitulo}>Novo Cliente</h3>
            <form onSubmit={handleSubmit}>
              <div style={styles.grid2}>
                <div style={styles.campo}>
                  <label style={styles.label}>Nome *</label>
                  <input
                    style={styles.input}
                    name="nome"
                    value={dados.nome}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div style={styles.campo}>
                  <label style={styles.label}>Email</label>
                  <input
                    style={styles.input}
                    name="email"
                    type="email"
                    value={dados.email}
                    onChange={handleChange}
                  />
                </div>
                <div style={styles.campo}>
                  <label style={styles.label}>Telefone</label>
                  <input
                    style={styles.input}
                    name="telefone"
                    value={dados.telefone}
                    onChange={handleChange}
                  />
                </div>
                <div style={styles.campo}>
                  <label style={styles.label}>NIF</label>
                  <input
                    style={styles.input}
                    name="nif"
                    value={dados.nif}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div style={styles.campo}>
                <label style={styles.label}>Morada</label>
                <input
                  style={styles.input}
                  name="morada"
                  value={dados.morada}
                  onChange={handleChange}
                />
              </div>
              <button style={styles.botaoGuardar} type="submit">
                Guardar Cliente
              </button>
            </form>
          </div>
        )}

        {loading ? (
          <p style={styles.mensagem}>A carregar...</p>
        ) : clientes.length === 0 ? (
          <p style={styles.mensagem}>
            Ainda não tens clientes. Cria o primeiro!
          </p>
        ) : (
          <div style={styles.tabela}>
            <div style={styles.tabelaHeader}>
              <span>Nome</span>
              <span>Email</span>
              <span>Telefone</span>
              <span>NIF</span>
              <span>Ações</span>
            </div>
            {clientes.map((c) => (
              <div key={c._id} style={styles.tabelaLinha}>
                <span style={styles.nomeCliente}>{c.nome}</span>
                <span style={styles.tabelaTexto}>{c.email || "-"}</span>
                <span style={styles.tabelaTexto}>{c.telefone || "-"}</span>
                <span style={styles.tabelaTexto}>{c.nif || "-"}</span>
                <button
                  style={styles.botaoApagar}
                  onClick={() => handleApagar(c._id)}
                >
                  Apagar
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
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
  botaoVoltar: {
    padding: "8px 16px",
    backgroundColor: "transparent",
    border: "1px solid #ddd",
    borderRadius: "6px",
    cursor: "pointer",
  },
  conteudo: { padding: "40px 32px" },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
  },
  titulo: { color: "#1a1a2e", margin: 0 },
  botaoNovo: {
    padding: "10px 20px",
    backgroundColor: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "600",
  },
  erro: {
    backgroundColor: "#fee2e2",
    color: "#dc2626",
    padding: "10px",
    borderRadius: "6px",
    marginBottom: "16px",
  },
  card: {
    backgroundColor: "#fff",
    padding: "24px",
    borderRadius: "12px",
    boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
    marginBottom: "24px",
  },
  cardTitulo: { color: "#1a1a2e", marginTop: 0, marginBottom: "16px" },
  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" },
  campo: { marginBottom: "16px" },
  label: {
    display: "block",
    marginBottom: "6px",
    color: "#333",
    fontWeight: "500",
    fontSize: "14px",
  },
  input: {
    width: "100%",
    padding: "10px 12px",
    border: "1px solid #ddd",
    borderRadius: "6px",
    fontSize: "14px",
    boxSizing: "border-box",
  },
  botaoGuardar: {
    padding: "10px 24px",
    backgroundColor: "#16a34a",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "600",
  },
  mensagem: { textAlign: "center", color: "#666", padding: "40px" },
  tabela: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
    overflow: "hidden",
  },
  tabelaHeader: {
    display: "grid",
    gridTemplateColumns: "2fr 2fr 1fr 1fr 1fr",
    padding: "12px 24px",
    backgroundColor: "#f8fafc",
    fontWeight: "600",
    color: "#666",
    fontSize: "14px",
  },
  tabelaLinha: {
    display: "grid",
    gridTemplateColumns: "2fr 2fr 1fr 1fr 1fr",
    padding: "16px 24px",
    borderTop: "1px solid #f0f2f5",
    alignItems: "center",
  },
  nomeCliente: { fontWeight: "600", color: "#1a1a2e" },
  tabelaTexto: { color: "#666", fontSize: "14px" },
  botaoApagar: {
    padding: "6px 12px",
    backgroundColor: "#ef4444",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "12px",
  },
};
