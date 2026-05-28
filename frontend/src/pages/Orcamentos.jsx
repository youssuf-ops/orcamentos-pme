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
      0
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
    const userGuardado = JSON.parse(localStorage.getItem("user") || "{}");
    const subscricaoGuardada = JSON.parse(localStorage.getItem("subscricao") || "{}");
    const isPlanoFree = !subscricaoGuardada.plano || subscricaoGuardada.plano === "free";

    const doc = new jsPDF();
    const W = doc.internal.pageSize.getWidth();

    const AZUL = [37, 99, 235];
    const ESCURO = [26, 26, 46];
    const CINZA = [107, 114, 128];
    const CLARO = [243, 244, 246];

    // CABEÇALHO — faixa azul
    doc.setFillColor(...AZUL);
    doc.rect(0, 0, W, 40, "F");

    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 255, 255);
    doc.text(userGuardado.empresa || userGuardado.nome || "A tua empresa", 14, 16);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("ORCAMENTO", W - 14, 12, { align: "right" });
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(orcamento.numero || "", W - 14, 22, { align: "right" });

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text(
      "Data: " + new Date(orcamento.createdAt).toLocaleDateString("pt-PT"),
      W - 14, 30, { align: "right" }
    );
    if (orcamento.validade) {
      doc.text(
        "Validade: " + new Date(orcamento.validade).toLocaleDateString("pt-PT"),
        W - 14, 36, { align: "right" }
      );
    }

    // EMITENTE
    let y = 52;
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...CINZA);
    doc.text("EMITIDO POR", 14, y);
    y += 5;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...ESCURO);
    doc.setFontSize(9);
    if (userGuardado.empresa) {
      doc.setFont("helvetica", "bold");
      doc.text(userGuardado.empresa, 14, y); y += 5;
      doc.setFont("helvetica", "normal");
    }
    if (userGuardado.nome) { doc.text(userGuardado.nome, 14, y); y += 5; }
    if (userGuardado.nif) { doc.text("NIF: " + userGuardado.nif, 14, y); y += 5; }
    if (userGuardado.morada) { doc.text(userGuardado.morada, 14, y); y += 5; }
    if (userGuardado.telefone) { doc.text("Tel: " + userGuardado.telefone, 14, y); y += 5; }
    if (userGuardado.email) { doc.text(userGuardado.email, 14, y); y += 5; }

    // CLIENTE
    let yc = 52;
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...CINZA);
    doc.text("DESTINATARIO", W / 2, yc);
    yc += 5;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...ESCURO);
    doc.setFontSize(9);
    const cliente = orcamento.cliente;
    if (cliente?.nome) {
      doc.setFont("helvetica", "bold");
      doc.text(cliente.nome, W / 2, yc); yc += 5;
      doc.setFont("helvetica", "normal");
    }
    if (cliente?.nif) { doc.text("NIF: " + cliente.nif, W / 2, yc); yc += 5; }
    if (cliente?.morada) { doc.text(cliente.morada, W / 2, yc); yc += 5; }
    if (cliente?.telefone) { doc.text("Tel: " + cliente.telefone, W / 2, yc); yc += 5; }
    if (cliente?.email) { doc.text(cliente.email, W / 2, yc); yc += 5; }

    // LINHA SEPARADORA
    const yLinha = Math.max(y, yc) + 6;
    doc.setDrawColor(...CLARO);
    doc.setLineWidth(0.5);
    doc.line(14, yLinha, W - 14, yLinha);

    // TABELA DE ITENS
    autoTable(doc, {
      startY: yLinha + 6,
      head: [["N", "Descricao", "Qtd", "Preco Unit.", "IVA " + orcamento.iva + "%", "Total"]],
      body: orcamento.itens.map((item, i) => [
        String(i + 1).padStart(2, "0"),
        item.descricao,
        item.quantidade,
        "EUR " + item.precoUnitario.toFixed(2),
        "EUR " + (item.precoUnitario * item.quantidade * (orcamento.iva / 100)).toFixed(2),
        "EUR " + item.total.toFixed(2),
      ]),
      styles: {
        fontSize: 9,
        cellPadding: { top: 6, right: 8, bottom: 6, left: 8 },
      },
      headStyles: {
        fillColor: AZUL,
        textColor: 255,
        fontStyle: "bold",
        fontSize: 8,
      },
      alternateRowStyles: {
        fillColor: [249, 250, 251],
      },
      columnStyles: {
        0: { cellWidth: 10 },
        1: { cellWidth: "auto" },
        2: { cellWidth: 14, halign: "center" },
        3: { cellWidth: 26, halign: "right" },
        4: { cellWidth: 22, halign: "right" },
        5: { cellWidth: 26, halign: "right" },
      },
    });

    // TOTAIS
    const finalY = doc.lastAutoTable.finalY + 8;

    doc.setFillColor(...CLARO);
    doc.roundedRect(W - 80, finalY, 66, 36, 3, 3, "F");

    doc.setFontSize(9);
    doc.setTextColor(...CINZA);
    doc.text("Subtotal:", W - 75, finalY + 9);
    doc.text("IVA (" + orcamento.iva + "%):", W - 75, finalY + 18);

    doc.setTextColor(...ESCURO);
    doc.text("EUR " + orcamento.subtotal?.toFixed(2), W - 17, finalY + 9, { align: "right" });
    doc.text(
      "EUR " + (orcamento.total - orcamento.subtotal).toFixed(2),
      W - 17, finalY + 18, { align: "right" }
    );

    // Total em destaque
    doc.setFillColor(...AZUL);
    doc.roundedRect(W - 80, finalY + 22, 66, 14, 3, 3, "F");
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 255, 255);
    doc.text("TOTAL:", W - 75, finalY + 31);
    doc.text("EUR " + orcamento.total?.toFixed(2), W - 17, finalY + 31, { align: "right" });

    // TERMOS E CONDIÇÕES / NOTAS
    if (orcamento.notas) {
      const yTermos = finalY + 44;
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...CINZA);
      doc.text("TERMOS E CONDICOES", 14, yTermos);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...ESCURO);
      doc.setFontSize(8);
      const linhas = doc.splitTextToSize(orcamento.notas, W - 28);
      doc.text(linhas, 14, yTermos + 6);
    }

    // WATERMARK — só no plano free
    if (isPlanoFree) {
      const yRodape = doc.internal.pageSize.getHeight() - 8;
      doc.setFontSize(7);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...CINZA);
      doc.text(
        "Gerado gratuitamente com OrcamentosPME | orcamentos.albiclick.com",
        W / 2, yRodape, { align: "center" }
      );
    }

    doc.save((orcamento.numero || "orcamento") + ".pdf");
  };

  return (
    <div style={styles.container}>
      <nav style={styles.nav}>
        <h2 style={styles.logo} onClick={() => navigate("/dashboard")}>
          OrcamentosPME
        </h2>
        <button style={styles.botaoVoltar} onClick={() => navigate("/dashboard")}>
          Dashboard
        </button>
      </nav>

      <div style={styles.conteudo}>
        <div style={styles.header}>
          <h1 style={styles.titulo}>Orcamentos</h1>
          <button
            style={styles.botaoNovo}
            onClick={() => setMostrarForm(!mostrarForm)}
          >
            {mostrarForm ? "Cancelar" : "+ Novo Orcamento"}
          </button>
        </div>

        {erro && <div style={styles.erro}>{erro}</div>}

        {mostrarForm && (
          <div style={styles.card}>
            <h3 style={styles.cardTitulo}>Novo Orcamento</h3>
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

              <h4 style={styles.secaoTitulo}>Itens do Orcamento</h4>
              {itens.map((item, index) => (
                <div key={index} style={styles.itemLinha}>
                  <input
                    style={{ ...styles.input, flex: 3 }}
                    placeholder="Descricao"
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
                    placeholder="Preco EUR"
                    type="number"
                    value={item.precoUnitario}
                    onChange={(e) =>
                      handleItemChange(index, "precoUnitario", e.target.value)
                    }
                    min="0"
                    step="0.01"
                  />
                  <span style={styles.itemTotal}>
                    EUR {(item.quantidade * item.precoUnitario).toFixed(2)}
                  </span>
                  {itens.length > 1 && (
                    <button
                      type="button"
                      style={styles.botaoRemover}
                      onClick={() => removerItem(index)}
                    >
                      X
                    </button>
                  )}
                </div>
              ))}

              <button type="button" style={styles.botaoAddItem} onClick={adicionarItem}>
                + Adicionar Item
              </button>

              <div style={styles.totalBox}>
                <strong>Total com IVA: EUR {calcularTotal()}</strong>
              </div>

              <div style={styles.campo}>
                <label style={styles.label}>Notas / Termos e Condicoes</label>
                <textarea
                  style={{ ...styles.input, height: "80px", resize: "vertical" }}
                  name="notas"
                  value={dados.notas}
                  onChange={handleDadosChange}
                  placeholder="Ex: Pagamento 50% adjudicacao, 50% entrega. Validade 30 dias."
                />
              </div>

              <button style={styles.botaoGuardar} type="submit">
                Criar Orcamento
              </button>
            </form>
          </div>
        )}

        {loading ? (
          <p style={styles.mensagem}>A carregar...</p>
        ) : orcamentos.length === 0 ? (
          <p style={styles.mensagem}>Ainda nao tens orcamentos. Cria o primeiro!</p>
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
                  <span style={styles.total}>EUR {o.total?.toFixed(2)}</span>
                  <span style={styles.data}>
                    {new Date(o.createdAt).toLocaleDateString("pt-PT")}
                  </span>
                </div>
                <div style={styles.acoes}>
                  <button style={styles.botaoPDF} onClick={() => gerarPDF(o)}>
                    PDF
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
  botaoPDF: {
    padding: "6px 14px",
    backgroundColor: "#1a1a2e",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "13px",
  },
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
