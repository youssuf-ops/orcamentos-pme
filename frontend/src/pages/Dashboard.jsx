// frontend/src/pages/Dashboard.jsx
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { getOrcamentos, getSubscricao } from "../services/api";
import PlanoBanner from "../components/PlanoBanner";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [metricas, setMetricas] = useState({
    total: 0, pendentes: 0, aprovados: 0, rejeitados: 0,
    valorTotal: 0, valorAprovado: 0,
  });
  const [subscricao, setSubscricao] = useState(null);

  const carregarDados = useCallback(async () => {
    const [resOrcamentos, resSubscricao] = await Promise.allSettled([
      getOrcamentos(),
      getSubscricao(),
    ]);
    if (resOrcamentos.status === "fulfilled") {
      const orcamentos = resOrcamentos.value.data;
      setMetricas({
        total: orcamentos.length,
        pendentes: orcamentos.filter((o) => o.status === "pendente").length,
        aprovados: orcamentos.filter((o) => o.status === "aprovado").length,
        rejeitados: orcamentos.filter((o) => o.status === "rejeitado").length,
        valorTotal: orcamentos.reduce((acc, o) => acc + (o.total || 0), 0),
        valorAprovado: orcamentos.filter((o) => o.status === "aprovado").reduce((acc, o) => acc + (o.total || 0), 0),
      });
    }
    if (resSubscricao.status === "fulfilled") {
      setSubscricao(resSubscricao.value.data);
    } else {
      setSubscricao({ plano: "free", orcamentosUsados: 0, orcamentosDisponiveis: 3, planoAtivo: true });
    }
  }, []);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const taxaAprovacao = metricas.total > 0
    ? Math.round((metricas.aprovados / metricas.total) * 100)
    : 0;

  return (
    <div style={styles.container}>
      <nav style={styles.nav}>
        <h2 style={styles.logo}>OrcamentosPME</h2>
        <div style={styles.navRight}>
          <span style={styles.userInfo}>{user?.empresa || user?.nome}</span>
          <button style={styles.botaoPerfil} onClick={() => navigate("/perfil")}>⚙️ Perfil</button>
          <button style={styles.botaoLogout} onClick={handleLogout}>Sair</button>
        </div>
      </nav>

      <div style={styles.conteudo}>
        <h1 style={styles.titulo}>Bem-vindo, {user?.nome} 👋</h1>
        <p style={styles.subtitulo}>Resumo do teu negócio</p>

        <PlanoBanner subscricao={subscricao} onUpgrade={() => navigate("/pricing")} />

        <div style={styles.metricasGrid}>
          <div style={styles.metricaCard}><span style={styles.metricaIcone}>📄</span><span style={styles.metricaValor}>{metricas.total}</span><span style={styles.metricaLabel}>Total Orçamentos</span></div>
          <div style={{ ...styles.metricaCard, borderTop: "4px solid #f59e0b" }}><span style={styles.metricaIcone}>⏳</span><span style={styles.metricaValor}>{metricas.pendentes}</span><span style={styles.metricaLabel}>Pendentes</span></div>
          <div style={{ ...styles.metricaCard, borderTop: "4px solid #16a34a" }}><span style={styles.metricaIcone}>✅</span><span style={styles.metricaValor}>{metricas.aprovados}</span><span style={styles.metricaLabel}>Aprovados</span></div>
          <div style={{ ...styles.metricaCard, borderTop: "4px solid #ef4444" }}><span style={styles.metricaIcone}>❌</span><span style={styles.metricaValor}>{metricas.rejeitados}</span><span style={styles.metricaLabel}>Rejeitados</span></div>
          <div style={{ ...styles.metricaCard, borderTop: "4px solid #2563eb" }}><span style={styles.metricaIcone}>💶</span><span style={styles.metricaValor}>€{metricas.valorTotal.toFixed(2)}</span><span style={styles.metricaLabel}>Valor Total</span></div>
          <div style={{ ...styles.metricaCard, borderTop: "4px solid #16a34a" }}><span style={styles.metricaIcone}>💰</span><span style={styles.metricaValor}>€{metricas.valorAprovado.toFixed(2)}</span><span style={styles.metricaLabel}>Valor Aprovado</span></div>
          <div style={{ ...styles.metricaCard, borderTop: "4px solid #7c3aed" }}><span style={styles.metricaIcone}>📊</span><span style={styles.metricaValor}>{taxaAprovacao}%</span><span style={styles.metricaLabel}>Taxa de Aprovação</span></div>
        </div>

        <h2 style={styles.secaoTitulo}>Navegação</h2>
        <div style={styles.grid}>
          <div style={styles.card} onClick={() => navigate("/orcamentos")}><div style={styles.cardIcone}>📄</div><h3 style={styles.cardTitulo}>Orçamentos</h3><p style={styles.cardDescricao}>Cria e gere os teus orçamentos</p></div>
          <div style={styles.card} onClick={() => navigate("/clientes")}><div style={styles.cardIcone}>👥</div><h3 style={styles.cardTitulo}>Clientes</h3><p style={styles.cardDescricao}>Gere a tua base de clientes</p></div>
          <div style={styles.card} onClick={() => navigate("/pricing")}><div style={styles.cardIcone}>💎</div><h3 style={styles.cardTitulo}>Planos</h3><p style={styles.cardDescricao}>Gere o teu plano e pagamentos</p></div>
          <div style={styles.card} onClick={() => navigate("/perfil")}><div style={styles.cardIcone}>⚙️</div><h3 style={styles.cardTitulo}>Perfil</h3><p style={styles.cardDescricao}>Dados da empresa para os PDFs</p></div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: "100vh", backgroundColor: "#f0f2f5" },
  nav: { backgroundColor: "#fff", padding: "16px 32px", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" },
  logo: { color: "#1a1a2e", margin: 0 },
  navRight: { display: "flex", alignItems: "center", gap: "12px" },
  userInfo: { color: "#666", fontSize: "14px" },
  botaoPerfil: { padding: "8px 14px", backgroundColor: "transparent", border: "1px solid #e5e7eb", borderRadius: "6px", cursor: "pointer", fontSize: "13px", color: "#374151" },
  botaoLogout: { padding: "8px 16px", backgroundColor: "#ef4444", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "500" },
  conteudo: { padding: "40px 32px" },
  titulo: { color: "#1a1a2e", marginBottom: "4px" },
  subtitulo: { color: "#666", marginBottom: "32px" },
  metricasGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "16px", marginBottom: "40px" },
  metricaCard: { backgroundColor: "#fff", padding: "20px", borderRadius: "12px", boxShadow: "0 2px 12px rgba(0,0,0,0.08)", borderTop: "4px solid #e5e7eb", display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" },
  metricaIcone: { fontSize: "24px" },
  metricaValor: { fontSize: "28px", fontWeight: "700", color: "#1a1a2e" },
  metricaLabel: { fontSize: "12px", color: "#666", textAlign: "center" },
  secaoTitulo: { color: "#1a1a2e", marginBottom: "16px" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "24px", maxWidth: "900px" },
  card: { backgroundColor: "#fff", padding: "32px", borderRadius: "12px", boxShadow: "0 2px 12px rgba(0,0,0,0.08)", cursor: "pointer", textAlign: "center" },
  cardIcone: { fontSize: "40px", marginBottom: "12px" },
  cardTitulo: { color: "#1a1a2e", marginBottom: "8px" },
  cardDescricao: { color: "#666", fontSize: "14px", margin: 0 },
};
