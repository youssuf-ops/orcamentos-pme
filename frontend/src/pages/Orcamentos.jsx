import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  getOrcamentos,
  getClientes,
  criarOrcamento,
  atualizarStatus,
  apagarOrcamento,
} from "../services/api";

const statusCores = {
  pendente: { bg: "#fef3c7", cor: "#d97706" },
  aprovado: { bg: "#dcfce7", cor: "#16a34a" },
  rejeitado: { bg: "#fee2e2", cor: "#dc2626" },
  expirado: { bg: "#f3f4f6", cor: "#6b7280" },
};

export default function Orcamentos() {
  const [orcamentos, setOrcamentos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [dados, setDados] = useState({
    cliente: "",
    iva: 23,
    validade: "",
    notas: "",
  });
  const [itens, setItens] = useState([
    { descricao: "", quantidade: 1, precoUnitario: 0 },
  ]);
  const navigate = useNavigate();

  const carregarDados = async () => {
    try {
      const [resOrc, resCli] = await Promise.all([
        getOrcamentos(),
        getClientes(),
      ]);
      setOrcamentos(resOrc.data);
      setClientes(resCli.data);
    } catch {
      setErro("Erro ao carregar dados.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const handleDadosChange = (e) => {
    setDados({ ...dados, [e.target.name]: e.target.value });
  };

  const handleItemChange = (index, campo, valor) => {
    const novosItens = [...itens];
    novosItens[index][campo] = campo === "descricao" ? valor : Number(valor);
    setItens(novosItens);
  };

  const adicionarItem = () => {
    setItens([...itens, { descricao: "", quantidade: 1, precoUnitario: 0 }]);
  };

  const removerItem = (index) => {
    setItens(itens.filter((_, i) => i !== index));
  };

  const calcularTotal = () => {
    const subtotal = itens.reduce(
      (acc, item) => acc + item.quantidade * item.precoUnitario,
      0,
    );
    return (subtotal * (1 + dados.iva / 100)).toFixed(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await criarOrcamento({ ...dados, itens });
      setDados({ cliente: "", iva: 23, validade: "", notas: "" });
      setItens([{ descricao: "", quantidade: 1, precoUnitario: 0 }]);
      setMostrarForm(false);
      carregarDados();
    } catch {
      setErro("Erro ao criar orçamento.");
    }
  };

  const handleStatus = async (id, status) => {
    try {
      await atualizarStatus(id, status);
      carregarDados();
    } catch {
      setErro("Erro ao atualizar status.");
    }
  };

  const handleApagar = async (id) => {
    if (!window.confirm("Tens a certeza?")) return;
    try {
      await apagarOrcamento(id);
      carregarDados();
    } catch {
      setErro("Erro ao apagar orçamento.");
    }
  };

  const gerarPDF = (orcamento) => {
    const doc = new jsPDF();

    // Cabeçalho
    doc.setFontSize(20);
    doc.setTextColor(26, 26, 46);
    doc.text("ORÇAMENTO", 14, 20);

    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text(`Número: ${orcamento.numero}`, 14, 30);
    doc.text(
      `Data: ${new Date(orcamento.createdAt).toLocaleDateString("pt-PT")}`,
      14,
      37,
    );
    doc.text(`Cliente: ${orcamento.cliente?.nome}`, 14, 44);
    if (orcamento.validade) {
      doc.text(
        `Válido até: ${new Date(orcamento.validade).toLocaleDateString("pt-PT")}`,
        14,
        51,
      );
    }

    // Tabela de itens
    autoTable(doc, {
      startY: 60,
      head: [["Descrição", "Qtd", "Preço Unit.", "Total"]],
      body: orcamento.itens.map((item) => [
        item.descricao,
        item.quantidade,
        `€${item.precoUnitario.toFixed(2)}`,
        `€${item.total.toFixed(2)}`,
      ]),
      styles: { fontSize: 10 },
      headStyles: { fillColor: [37, 99, 235] },
    });

    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(11);
    doc.setTextColor(50);
    doc.text(`Subtotal: €${orcamento.subtotal?.toFixed(2)}`, 140, finalY);
    doc.text(
      `IVA (${orcamento.iva}%): €${(orcamento.total - orcamento.subtotal).toFixed(2)}`,
      140,
      finalY + 7,
    );
    doc.setFontSize(13);
    doc.setTextColor(26, 26, 46);
    doc.text(`Total: €${orcamento.total?.toFixed(2)}`, 140, finalY + 16);

    if (orcamento.notas) {
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Notas: ${orcamento.notas}`, 14, finalY + 30);
    }

    doc.save(`${orcamento.numero}.pdf`);
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
          <h1 style={styles.titulo}>Orçamentos</h1>
          <button
            style={styles.botaoNovo}
            onClick={() => setMostrarForm(!mostrarForm)}
          >
            {mostrarForm ? "Cancelar" : "+ Novo Orçamento"}
          </button>
        </div>

        {erro && <div style={styles.erro}>{erro}</div>}

        {mostrarForm && (
          <div style={styles.card}>
            <h3 style={styles.cardTitulo}>Novo Orçamento</h3>
            <form onSubmit={handleSubmit}>
              <div style={styles.grid2}>
                <div style={styles.campo}>
                  <label style={styles.label}>Cliente *</label>
                  <select
                    style={styles.input}
                    name="cliente"
                    value={dados.cliente}
                    onChange={handleDadosChange}
                    required
                  >
                    <option value="">Seleciona um cliente</option>
                    {clientes.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.nome}
                      </option>
                    ))}
                  </select>
                </div>
                <div style={styles.campo}>
                  <label style={styles.label}>IVA (%)</label>
                  <input
                    style={styles.input}
                    name="iva"
                    type="number"
                    value={dados.iva}
                    onChange={handleDadosChange}
                  />
                </div>
                <div style={styles.campo}>
                  <label style={styles.label}>Validade</label>
                  <input
                    style={styles.input}
                    name="validade"
                    type="date"
                    value={dados.validade}
                    onChange={handleDadosChange}
                  />
                </div>
              </div>

              <h4 style={styles.secaoTitulo}>Itens do Orçamento</h4>
              {itens.map((item, index) => (
                <div key={index} style={styles.itemLinha}>
                  <input
                    style={{ ...styles.input, flex: 3 }}
                    placeholder="Descrição"
                    value={item.descricao}
                    onChange={(e) =>
                      handleItemChange(index, "descricao", e.target.value)
                    }
                    required
                  />
                  <input
                    style={{ ...styles.input, flex: 1 }}
                    placeholder="Qtd"
                    type="number"
                    value={item.quantidade}
                    onChange={(e) =>
                      handleItemChange(index, "quantidade", e.target.value)
                    }
                    min="1"
                  />
                  <input
                    style={{ ...styles.input, flex: 1 }}
                    placeholder="Preço €"
                    type="number"
                    value={item.precoUnitario}
                    onChange={(e) =>
                      handleItemChange(index, "precoUnitario", e.target.value)
                    }
                    min="0"
                    step="0.01"
                  />
                  <span style={styles.itemTotal}>
                    €{(item.quantidade * item.precoUnitario).toFixed(2)}
                  </span>
                  {itens.length > 1 && (
                    <button
                      type="button"
                      style={styles.botaoRemover}
                      onClick={() => removerItem(index)}
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}

              <button
                type="button"
                style={styles.botaoAddItem}
                onClick={adicionarItem}
              >
                + Adicionar Item
              </button>

              <div style={styles.totalBox}>
                <strong>Total com IVA: €{calcularTotal()}</strong>
              </div>

              <div style={styles.campo}>
                <label style={styles.label}>Notas</label>
                <textarea
                  style={{
                    ...styles.input,
                    height: "80px",
                    resize: "vertical",
                  }}
                  name="notas"
                  value={dados.notas}
                  onChange={handleDadosChange}
                />
              </div>

              <button style={styles.botaoGuardar} type="submit">
                Criar Orçamento
              </button>
            </form>
          </div>
        )}

        {loading ? (
          <p style={styles.mensagem}>A carregar...</p>
        ) : orcamentos.length === 0 ? (
          <p style={styles.mensagem}>
            Ainda não tens orçamentos. Cria o primeiro!
          </p>
        ) : (
          <div style={styles.lista}>
            {orcamentos.map((o) => (
              <div key={o._id} style={styles.orcamentoCard}>
                <div style={styles.orcamentoHeader}>
                  <div>
                    <span style={styles.numero}>{o.numero}</span>
                    <span style={styles.clienteNome}>{o.cliente?.nome}</span>
                  </div>
                  <span
                    style={{
                      ...styles.badge,
                      backgroundColor: statusCores[o.status]?.bg,
                      color: statusCores[o.status]?.cor,
                    }}
                  >
                    {o.status}
                  </span>
                </div>
                <div style={styles.orcamentoInfo}>
                  <span style={styles.total}>€{o.total?.toFixed(2)}</span>
                  <span style={styles.data}>
                    {new Date(o.createdAt).toLocaleDateString("pt-PT")}
                  </span>
                </div>
                <div style={styles.acoes}>
                  <button style={styles.botaoPDF} onClick={() => gerarPDF(o)}>
                    📄 PDF
                  </button>
                  {o.status === "pendente" && (
                    <>
                      <button
                        style={styles.botaoAprovar}
                        onClick={() => handleStatus(o._id, "aprovado")}
                      >
                        Aprovar
                      </button>
                      <button
                        style={styles.botaoRejeitar}
                        onClick={() => handleStatus(o._id, "rejeitado")}
                      >
                        Rejeitar
                      </button>
                    </>
                  )}
                  <button
                    style={styles.botaoApagar}
                    onClick={() => handleApagar(o._id)}
                  >
                    Apagar
                  </button>
                </div>
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
  secaoTitulo: { color: "#1a1a2e", marginBottom: "12px", marginTop: "8px" },
  itemLinha: {
    display: "flex",
    gap: "8px",
    alignItems: "center",
    marginBottom: "8px",
  },
  itemTotal: {
    minWidth: "80px",
    textAlign: "right",
    fontWeight: "600",
    color: "#1a1a2e",
  },
  botaoRemover: {
    padding: "8px",
    backgroundColor: "#ef4444",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
  botaoAddItem: {
    padding: "8px 16px",
    backgroundColor: "transparent",
    border: "1px dashed #2563eb",
    color: "#2563eb",
    borderRadius: "6px",
    cursor: "pointer",
    marginBottom: "16px",
  },
  totalBox: {
    backgroundColor: "#f0f9ff",
    padding: "12px 16px",
    borderRadius: "6px",
    marginBottom: "16px",
    textAlign: "right",
    color: "#1a1a2e",
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
  lista: { display: "grid", gap: "16px" },
  orcamentoCard: {
    backgroundColor: "#fff",
    padding: "20px 24px",
    borderRadius: "12px",
    boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
  },
  orcamentoHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "12px",
  },
  numero: { fontWeight: "700", color: "#1a1a2e", marginRight: "12px" },
  clienteNome: { color: "#666" },
  badge: {
    padding: "4px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
  },
  orcamentoInfo: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "12px",
  },
  total: { fontSize: "20px", fontWeight: "700", color: "#1a1a2e" },
  data: { color: "#666", fontSize: "14px" },
  acoes: { display: "flex", gap: "8px" },
  botaoAprovar: {
    padding: "6px 14px",
    backgroundColor: "#16a34a",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "13px",
  },
  botaoRejeitar: {
    padding: "6px 14px",
    backgroundColor: "#ef4444",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "13px",
  },
  botaoApagar: {
    padding: "6px 14px",
    backgroundColor: "#6b7280",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "13px",
  },
};
