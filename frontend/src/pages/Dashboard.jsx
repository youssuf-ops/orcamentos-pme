// frontend/src/pages/Dashboard.jsx
// Alterações em relação à versão anterior:
//   1. Import do PlanoBanner adicionado
//   2. Import do getSubscricao adicionado
//   3. Estado subscricao adicionado
//   4. carregarSubscricao adicionada ao useEffect inicial
//   5. PlanoBanner renderizado antes das métricas
// Tudo o resto fica igual.

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { getOrcamentos, getSubscricao } from "../services/api";
import PlanoBanner from "../components/PlanoBanner";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [metricas, setMetricas] = useState({
    total: 0,
    pendentes: 0,
    aprovados: 0,
    rejeitados: 0,
    valorTotal: 0,
    valorAprovado: 0,
  });

  // ── NOVO: estado da subscrição ────────────────────────────
  const [subscricao, setSubscricao] = useState(null);

  // ── Carregar tudo no mount ────────────────────────────────
  const carregarDados = useCallback(async () => {
    // Corre as duas chamadas em paralelo — mais rápido
    // Promise.all: espera que AMBAS terminem antes de continuar
    // Se uma falhar, o catch apanha o erro
    const [resOrcamentos, resSubscricao] = await Promise.allSettled([
      getOrcamentos(),
      getSubscricao(),
    ]);

    // Processar orçamentos
    if (resOrcamentos.status === "fulfilled") {
      const orcamentos = resOrcamentos.value.data;
      setMetricas({
        total: orcamentos.length,
        pendentes: orcamentos.filter((o) => o.status === "pendente").length,
        aprovados: orcamentos.filter((o) => o.status === "aprovado").length,
        rejeitados: orcamentos.filter((o) => o.status === "rejeitado").length,
        valorTotal: orcamentos.reduce((acc, o) => acc + (o.total || 0), 0),
        valorAprovado: orcamentos
          .filter((o) => o.status === "aprovado")
          .reduce((acc, o) => acc + (o.total || 0), 0),
      });
    }

    // Processar subscrição
    if (resSubscricao.status === "fulfilled") {
      setSubscricao(resSubscricao.value.data);
    } else {
      // Fallback: assumir plano free para não bloquear UI
      setSubscricao({
        plano: "free",
        orcamentosUsados: 0,
        orcamentosDisponiveis: 3,
        planoAtivo: true,
      });
    }
  }, []);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const taxaAprovacao =
    metricas.total > 0
      ? Math.round((metricas.aprovados / metricas.total) * 100)
      : 0;

  return (
    <div style={styles.container}>
      <nav style={styles.nav}>
        <h2 style={styles.logo}>OrcamentosPME</h2>
        <div style={styles.navRight}>
          <span style={styles.userInfo}>{user?.empresa || user?.nome}</span>
          <button style={styles.botaoLogout} onClick={handleLogout}>
            Sair
          </button>
        </div>
      </nav>

      <div style={styles.conteudo}>
        <h1 style={styles.titulo}>Bem-vindo, {user?.nome} 👋</h1>
        <p style={styles.subtitulo}>Resumo do teu negócio</p>

        {/* ── NOVO: Banner do plano ─────────────────────────
            Aparece antes das métricas.
            Se bloqueado → banner vermelho com botão upgrade
            Se acima 80% → banner amarelo com aviso
            Se normal → banner discreto com barra de progresso
        ─────────────────────────────────────────────────── */}
        <PlanoBanner
          subscricao={subscricao}
          onUpgrade={() => navigate("/pricing")}
        />

        <div style={styles.metricasGrid}>
          <div style={styles.metricaCard}>
            <span style={styles.metricaIcone}>📄</span>
            <span style={styles.metricaValor}>{metricas.total}</span>
            <span style={styles.metricaLabel}>Total Orçamentos</span>
          </div>
          <div
            style={{ ...styles.metricaCard, borderTop: "4px solid #f59e0b" }}
          >
            <span style={styles.metricaIcone}>⏳</span>
            <span style={styles.metricaValor}>{metricas.pendentes}</span>
            <span style={styles.metricaLabel}>Pendentes</span>
          </div>
          <div
            style={{ ...styles.metricaCard, borderTop: "4px solid #16a34a" }}
          >
            <span style={styles.metricaIcone}>✅</span>
            <span style={styles.metricaValor}>{metricas.aprovados}</span>
            <span style={styles.metricaLabel}>Aprovados</span>
          </div>
          <div
            style={{ ...styles.metricaCard, borderTop: "4px solid #ef4444" }}
          >
            <span style={styles.metricaIcone}>❌</span>
            <span style={styles.metricaValor}>{metricas.rejeitados}</span>
            <span style={styles.metricaLabel}>Rejeitados</span>
          </div>
          <div
            style={{ ...styles.metricaCard, borderTop: "4px solid #2563eb" }}
          >
            <span style={styles.metricaIcone}>💶</span>
            <span style={styles.metricaValor}>
              €{metricas.valorTotal.toFixed(2)}
            </span>
            <span style={styles.metricaLabel}>Valor Total</span>
          </div>
          <div
            style={{ ...styles.metricaCard, borderTop: "4px solid #16a34a" }}
          >
            <span style={styles.metricaIcone}>💰</span>
            <span style={styles.metricaValor}>
              €{metricas.valorAprovado.toFixed(2)}
            </span>
            <span style={styles.metricaLabel}>Valor Aprovado</span>
          </div>
          <div
            style={{ ...styles.metricaCard, borderTop: "4px solid #7c3aed" }}
          >
            <span style={styles.metricaIcone}>📊</span>
            <span style={styles.metricaValor}>{taxaAprovacao}%</span>
            <span style={styles.metricaLabel}>Taxa de Aprovação</span>
          </div>
        </div>

        <h2 style={styles.secaoTitulo}>Navegação</h2>
        <div style={styles.grid}>
          <div style={styles.card} onClick={() => navigate("/orcamentos")}>
            <div style={styles.cardIcone}>📄</div>
            <h3 style={styles.cardTitulo}>Orçamentos</h3>
            <p style={styles.cardDescricao}>Cria e gere os teus orçamentos</p>
          </div>
          <div style={styles.card} onClick={() => navigate("/clientes")}>
            <div style={styles.cardIcone}>👥</div>
            <h3 style={styles.cardTitulo}>Clientes</h3>
            <p style={styles.cardDescricao}>Gere a tua base de clientes</p>
          </div>
          {/* ── NOVO: card de acesso à Pricing ── */}
          <div style={styles.card} onClick={() => navigate("/pricing")}>
            <div style={styles.cardIcone}>💎</div>
            <h3 style={styles.cardTitulo}>Planos</h3>
            <p style={styles.cardDescricao}>Gere o teu plano e pagamentos</p>
          </div>
        </div>
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
  logo: { color: "#1a1a2e", margin: 0 },
  navRight: { display: "flex", alignItems: "center", gap: "16px" },
  userInfo: { color: "#666", fontSize: "14px" },
  botaoLogout: {
    padding: "8px 16px",
    backgroundColor: "#ef4444",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "500",
  },
  conteudo: { padding: "40px 32px" },
  titulo: { color: "#1a1a2e", marginBottom: "4px" },
  subtitulo: { color: "#666", marginBottom: "32px" },
  metricasGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
    gap: "16px",
    marginBottom: "40px",
  },
  metricaCard: {
    backgroundColor: "#fff",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
    borderTop: "4px solid #e5e7eb",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "8px",
  },
  metricaIcone: { fontSize: "24px" },
  metricaValor: { fontSize: "28px", fontWeight: "700", color: "#1a1a2e" },
  metricaLabel: { fontSize: "12px", color: "#666", textAlign: "center" },
  secaoTitulo: { color: "#1a1a2e", marginBottom: "16px" },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "24px",
    maxWidth: "700px",
  },
  card: {
    backgroundColor: "#fff",
    padding: "32px",
    borderRadius: "12px",
    boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
    cursor: "pointer",
    textAlign: "center",
  },
  cardIcone: { fontSize: "40px", marginBottom: "12px" },
  cardTitulo: { color: "#1a1a2e", marginBottom: "8px" },
  cardDescricao: { color: "#666", fontSize: "14px", margin: 0 },
};
