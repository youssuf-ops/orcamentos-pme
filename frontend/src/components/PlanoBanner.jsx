// ============================================================
// frontend/src/components/PlanoBanner.jsx
//
// Componente de estado do plano — aparece no Dashboard.
// Responsabilidades:
//   - Mostrar plano actual, orçamentos usados/disponíveis
//   - Barra de progresso visual (fica vermelha acima de 80%)
//   - Botão de upgrade quando acima de 80% de uso
//   - Banner de bloqueio quando limite atingido
//
// Props recebidas:
//   - subscricao: { plano, orcamentosUsados, orcamentosDisponiveis, planoAtivo }
//   - onUpgrade: função chamada ao clicar "Fazer upgrade"
// ============================================================

import { useNavigate } from "react-router-dom";

export default function PlanoBanner({ subscricao, onUpgrade }) {
  const navigate = useNavigate();

  // Se ainda não temos dados, não renderiza nada
  if (!subscricao) return null;

  const { plano, orcamentosUsados, orcamentosDisponiveis } = subscricao;

  // ── Calcular progresso ────────────────────────────────────
  // -1 = ilimitado → progresso 100% mas cor verde
  const ilimitado = orcamentosDisponiveis === -1;
  const percentagem = ilimitado
    ? 100
    : orcamentosDisponiveis === 0
    ? 0
    : Math.min((orcamentosUsados / orcamentosDisponiveis) * 100, 100);

  const bloqueado = !ilimitado && orcamentosUsados >= orcamentosDisponiveis;
  const avisoBaixo = !ilimitado && percentagem >= 80 && !bloqueado;

  // ── Cor da barra por estado ───────────────────────────────
  const corBarra = bloqueado
    ? "#ef4444"
    : avisoBaixo
    ? "#f59e0b"
    : ilimitado
    ? "#10b981"
    : "#2563eb";

  const handleUpgrade = () => {
    if (onUpgrade) onUpgrade();
    navigate("/pricing");
  };

  // ── Banner de bloqueio — limite atingido ──────────────────
  if (bloqueado) {
    return (
      <div style={estilos.bannerBloqueado}>
        <div style={estilos.bannerIcone}>🔒</div>
        <div style={estilos.bannerTexto}>
          <div style={estilos.bannerTitulo}>Limite do plano atingido</div>
          <div style={estilos.bannerSub}>
            Usaste {orcamentosUsados}/{orcamentosDisponiveis} orçamentos do plano{" "}
            <strong>{NOMES_PLANOS[plano] || plano}</strong>. Faz upgrade para continuar a criar orçamentos.
          </div>
        </div>
        <button style={estilos.btnUpgrade} onClick={handleUpgrade}>
          Fazer upgrade →
        </button>
      </div>
    );
  }

  // ── Banner normal — mostrar estado do plano ───────────────
  return (
    <div style={{
      ...estilos.banner,
      borderColor: avisoBaixo ? "rgba(245,158,11,0.3)" : "rgba(255,255,255,0.08)",
    }}>
      {/* Linha superior — plano e contagem */}
      <div style={estilos.bannerTopo}>
        <div style={estilos.bannerEsquerda}>
          <span style={estilos.planoLabel}>O teu plano</span>
          <span style={{
            ...estilos.planoNome,
            color: CORES_PLANOS[plano] || "#2563eb",
          }}>
            {NOMES_PLANOS[plano] || plano?.toUpperCase()}
          </span>
        </div>

        <div style={estilos.bannerDireita}>
          {ilimitado ? (
            <span style={estilos.ilimitadoTag}>∞ Ilimitado</span>
          ) : (
            <span style={estilos.contagem}>
              <strong style={{ color: avisoBaixo ? "#f59e0b" : "#1a1a2e" }}>
                {orcamentosUsados}
              </strong>
              /{orcamentosDisponiveis} orçamentos usados
            </span>
          )}

          {/* Botão de upgrade — aparece acima de 80% */}
          {avisoBaixo && (
            <button style={estilos.btnUpgradeSmall} onClick={handleUpgrade}>
              Fazer upgrade
            </button>
          )}
        </div>
      </div>

      {/* Barra de progresso — só para planos com limite */}
      {!ilimitado && (
        <div style={estilos.progressoWrapper}>
          <div style={{
            ...estilos.progressoBarra,
            width: `${percentagem}%`,
            backgroundColor: corBarra,
          }} />
        </div>
      )}

      {/* Aviso subtil quando acima de 80% */}
      {avisoBaixo && (
        <div style={estilos.avisoTexto}>
          ⚠️ Estás a chegar ao limite. Faz upgrade antes de ficar bloqueado.
        </div>
      )}
    </div>
  );
}

// ── Mapeamento de IDs para nomes e cores ─────────────────────
const NOMES_PLANOS = {
  free: "Gratuito",
  starter: "Pack Starter",
  pro: "Pack Pro",
  ilimitado: "Ilimitado",
};

const CORES_PLANOS = {
  free: "#6b7280",
  starter: "#2563eb",
  pro: "#7c3aed",
  ilimitado: "#10b981",
};

// ── Estilos ──────────────────────────────────────────────────
const estilos = {
  // Banner normal
  banner: {
    backgroundColor: "#fff",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 12,
    padding: "16px 20px",
    boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
    marginBottom: 24,
  },
  bannerTopo: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 10,
  },
  bannerEsquerda: {
    display: "flex",
    flexDirection: "column",
    gap: 2,
  },
  planoLabel: {
    fontSize: 11,
    color: "#9ca3af",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    fontWeight: 600,
  },
  planoNome: {
    fontSize: 16,
    fontWeight: 700,
  },
  bannerDireita: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    flexWrap: "wrap",
  },
  contagem: {
    fontSize: 13,
    color: "#6b7280",
  },
  ilimitadoTag: {
    fontSize: 13,
    fontWeight: 700,
    color: "#10b981",
    background: "rgba(16,185,129,0.08)",
    padding: "4px 10px",
    borderRadius: 6,
  },

  // Barra de progresso
  progressoWrapper: {
    width: "100%",
    height: 6,
    background: "#f3f4f6",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressoBarra: {
    height: "100%",
    borderRadius: 4,
    transition: "width 0.5s ease",
  },

  // Aviso
  avisoTexto: {
    fontSize: 12,
    color: "#92400e",
    background: "rgba(245,158,11,0.08)",
    padding: "6px 10px",
    borderRadius: 6,
    marginTop: 10,
  },

  // Botão upgrade pequeno
  btnUpgradeSmall: {
    padding: "6px 14px",
    background: "#7c3aed",
    border: "none",
    borderRadius: 6,
    color: "#fff",
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "inherit",
  },

  // Banner de bloqueio
  bannerBloqueado: {
    backgroundColor: "#fef2f2",
    border: "1px solid rgba(239,68,68,0.3)",
    borderRadius: 12,
    padding: "16px 20px",
    display: "flex",
    alignItems: "center",
    gap: 16,
    marginBottom: 24,
    flexWrap: "wrap",
  },
  bannerIcone: {
    fontSize: 28,
    flexShrink: 0,
  },
  bannerTexto: {
    flex: 1,
    minWidth: 200,
  },
  bannerTitulo: {
    fontSize: 15,
    fontWeight: 700,
    color: "#991b1b",
    marginBottom: 4,
  },
  bannerSub: {
    fontSize: 13,
    color: "#b91c1c",
    lineHeight: 1.5,
  },
  btnUpgrade: {
    padding: "10px 20px",
    background: "#ef4444",
    border: "none",
    borderRadius: 8,
    color: "#fff",
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
    whiteSpace: "nowrap",
    fontFamily: "inherit",
  },
};
