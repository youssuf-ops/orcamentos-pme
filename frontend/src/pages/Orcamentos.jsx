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

// Validade default: hoje + 30 dias
const dataValidade30 = new Date();
dataValidade30.setDate(dataValidade30.getDate() + 30);
const validadeDefault = dataValidade30.toISOString().split("T")[0];

export default function Orcamentos() {
  const [orcamentos, setOrcamentos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [dados, setDados] = useState({
    cliente: "",
    iva: 23,
    validade: validadeDefault,
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

  const handleDadosChange = (e) =>
    setDados({ ...dados, [e.target.name]: e.target.value });

  const handleItemChange = (index, campo, valor) => {
    const novosItens = [...itens];
    novosItens[index][campo] = campo === "descricao" ? valor : Number(valor);
    setItens(novosItens);
  };

  const adicionarItem = () =>
    setItens([...itens, { descricao: "", quantidade: 1, precoUnitario: 0 }]);
  const removerItem = (index) => setItens(itens.filter((_, i) => i !== index));

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
      // Reset com nova validade default
      const novaValidade = new Date();
      novaValidade.setDate(novaValidade.getDate() + 30);
      setDados({
        cliente: "",
        iva: 23,
        validade: novaValidade.toISOString().split("T")[0],
        notas: "",
      });
      setItens([{ descricao: "", quantidade: 1, precoUnitario: 0 }]);
      setMostrarForm(false);
      carregarDados();
    } catch {
      setErro("Erro ao criar orcamento.");
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
      setErro("Erro ao apagar orcamento.");
    }
  };

  const gerarPDF = (orcamento) => {
    const userGuardado = JSON.parse(localStorage.getItem("user") || "{}");
    const subscricaoGuardada = JSON.parse(
      localStorage.getItem("subscricao") || "{}",
    );
    const isPlanoFree =
      !subscricaoGuardada.plano || subscricaoGuardada.plano === "free";

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });
    const W = doc.internal.pageSize.getWidth();
    const EUR = "EUR ";
    const AZUL = [37, 99, 235];
    const ESCURO = [26, 26, 46];
    const CINZA = [107, 114, 128];
    const CINZA_CLARO = [243, 244, 246];

    // CABECALHO
    doc.setFillColor(...AZUL);
    doc.rect(0, 0, W, 38, "F");
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 255, 255);
    doc.text(
      userGuardado.empresa || userGuardado.nome || "A tua empresa",
      14,
      16,
    );
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("OR\u00c7AMENTO", W - 14, 11, { align: "right" });
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text(orcamento.numero || "", W - 14, 20, { align: "right" });
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text(
      "Data: " + new Date(orcamento.createdAt).toLocaleDateString("pt-PT"),
      W - 14,
      28,
      { align: "right" },
    );
    if (orcamento.validade) {
      doc.text(
        "Validade: " + new Date(orcamento.validade).toLocaleDateString("pt-PT"),
        W - 14,
        34,
        { align: "right" },
      );
    }

    // EMITENTE
    let y = 50;
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...CINZA);
    doc.text("EMITIDO POR", 14, y);
    y += 5;
    doc.setTextColor(...ESCURO);
    doc.setFontSize(9);
    if (userGuardado.empresa) {
      doc.setFont("helvetica", "bold");
      doc.text(userGuardado.empresa, 14, y);
      y += 5;
    }
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    if (userGuardado.nome) {
      doc.text(userGuardado.nome, 14, y);
      y += 4;
    }
    if (userGuardado.nif) {
      doc.text("NIF: " + userGuardado.nif, 14, y);
      y += 4;
    }
    if (userGuardado.morada) {
      doc.text(userGuardado.morada, 14, y);
      y += 4;
    }
    if (userGuardado.telefone) {
      doc.text("Tel: " + userGuardado.telefone, 14, y);
      y += 4;
    }
    if (userGuardado.email) {
      doc.text(userGuardado.email, 14, y);
      y += 4;
    }

    // CLIENTE
    const xCliente = W / 2 + 5;
    let yc = 50;
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...CINZA);
    doc.text("DESTINAT\u00c1RIO", xCliente, yc);
    yc += 5;
    doc.setTextColor(...ESCURO);
    doc.setFontSize(9);
    const cliente = orcamento.cliente;
    if (cliente?.nome) {
      doc.setFont("helvetica", "bold");
      doc.text(cliente.nome, xCliente, yc);
      yc += 5;
    }
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    if (cliente?.nif) {
      doc.text("NIF: " + cliente.nif, xCliente, yc);
      yc += 4;
    }
    if (cliente?.morada) {
      doc.text(cliente.morada, xCliente, yc);
      yc += 4;
    }
    if (cliente?.telefone) {
      doc.text("Tel: " + cliente.telefone, xCliente, yc);
      yc += 4;
    }
    if (cliente?.email) {
      doc.text(cliente.email, xCliente, yc);
      yc += 4;
    }

    // LINHA DIVISORIA
    const yLinha = Math.max(y, yc) + 4;
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.3);
    doc.line(14, yLinha, W - 14, yLinha);

    // TABELA
    autoTable(doc, {
      startY: yLinha + 5,
      margin: { left: 14, right: 14 },
      tableWidth: 182,
      head: [
        [
          "N",
          "Descri\u00e7\u00e3o",
          "Qtd",
          "Pre\u00e7o Unit.",
          "IVA " + orcamento.iva + "%",
          "Total c/ IVA",
        ],
      ],
      body: orcamento.itens.map((item, i) => [
        String(i + 1).padStart(2, "0"),
        item.descricao,
        item.quantidade,
        EUR + item.precoUnitario.toFixed(2),
        EUR +
          (
            item.precoUnitario *
            item.quantidade *
            (orcamento.iva / 100)
          ).toFixed(2),
        EUR +
          (
            item.precoUnitario *
            item.quantidade *
            (1 + orcamento.iva / 100)
          ).toFixed(2),
      ]),
      styles: {
        fontSize: 8,
        cellPadding: { top: 4, right: 3, bottom: 4, left: 3 },
        overflow: "linebreak",
        valign: "middle",
      },
      headStyles: {
        fillColor: AZUL,
        textColor: 255,
        fontStyle: "bold",
        fontSize: 8,
        halign: "center",
      },
      alternateRowStyles: { fillColor: [249, 250, 251] },
      columnStyles: {
        0: { cellWidth: 12, halign: "center" },
        1: { cellWidth: 88, halign: "left" },
        2: { cellWidth: 14, halign: "center" },
        3: { cellWidth: 24, halign: "right" },
        4: { cellWidth: 22, halign: "right" },
        5: { cellWidth: 22, halign: "right" },
      },
    });

    // TOTAIS
    const finalY = doc.lastAutoTable.finalY + 6;
    doc.setFillColor(...CINZA_CLARO);
    doc.roundedRect(W - 76, finalY, 62, 30, 2, 2, "F");
    doc.setFontSize(8.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...CINZA);
    doc.text("Subtotal:", W - 72, finalY + 8);
    doc.text("IVA (" + orcamento.iva + "%):", W - 72, finalY + 16);
    doc.setTextColor(...ESCURO);
    doc.text(EUR + orcamento.subtotal?.toFixed(2), W - 16, finalY + 8, {
      align: "right",
    });
    doc.text(
      EUR + (orcamento.total - orcamento.subtotal).toFixed(2),
      W - 16,
      finalY + 16,
      { align: "right" },
    );

    doc.setFillColor(...AZUL);
    doc.roundedRect(W - 76, finalY + 20, 62, 12, 2, 2, "F");
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 255, 255);
    doc.text("TOTAL:", W - 72, finalY + 28);
    doc.text(EUR + orcamento.total?.toFixed(2), W - 16, finalY + 28, {
      align: "right",
    });

    // TERMOS
    if (orcamento.notas) {
      const yTermos = finalY + 38;
      doc.setFontSize(7);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...CINZA);
      doc.text("TERMOS E CONDI\u00c7\u00d5ES", 14, yTermos);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...ESCURO);
      doc.setFontSize(8);
      const linhas = doc.splitTextToSize(orcamento.notas, W - 28);
      doc.text(linhas, 14, yTermos + 5);
    }

    // RODAPE
    const yRodape = doc.internal.pageSize.getHeight() - 14;
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.3);
    doc.line(14, yRodape - 4, W - 14, yRodape - 4);
    doc.setFontSize(8);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(...CINZA);
    doc.text("Obrigado pela prefer\u00eancia!", W / 2, yRodape, {
      align: "center",
    });

    if (isPlanoFree) {
      doc.setFontSize(7);
      doc.setFont("helvetica", "normal");
      doc.text(
        "Gerado gratuitamente com OrcamentosPME | orcamentos.albiclick.com",
        W / 2,
        yRodape + 5,
        { align: "center" },
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
        <button
          style={styles.botaoVoltar}
          onClick={() => navigate("/dashboard")}
        >
          Dashboard
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
                    placeholder="Preço"
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

              <button
                type="button"
                style={styles.botaoAddItem}
                onClick={adicionarItem}
              >
                + Adicionar Item
              </button>

              <div style={styles.totalBox}>
                <strong>Total com IVA: EUR {calcularTotal()}</strong>
              </div>

              <div style={styles.campo}>
                <label style={styles.label}>Notas / Termos e Condições</label>
                <textarea
                  style={{
                    ...styles.input,
                    height: "80px",
                    resize: "vertical",
                  }}
                  name="notas"
                  value={dados.notas}
                  onChange={handleDadosChange}
                  placeholder="Ex: Pagamento 50% adjudicação, 50% entrega. Validade 30 dias."
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
    color: "#1a1a2e",
    fontSize: "14px",
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
