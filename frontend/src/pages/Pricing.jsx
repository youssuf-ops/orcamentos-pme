// ============================================================
// frontend/src/pages/Pricing.jsx
//
// Página de planos e pagamentos do OrcamentosPME.
// Responsabilidades:
//   1. Carregar o plano actual do utilizador (getSubscricao)
//   2. Mostrar os 4 planos com estado visual correcto
//   3. Abrir modal de pagamento ao clicar "Comprar"
//   4. Gerir fluxo MB WAY / Multibanco via EuPago
//   5. Polling de estado até confirmação do pagamento
// ============================================================

import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  getSubscricao,
  criarPagamento,
  verificarPagamento,
} from "../services/api";

// ─────────────────────────────────────────────
// DADOS DOS PLANOS — fonte única de verdade
//
// Centralizar aqui significa que se o preço mudar,
// alteras num sítio e toda a UI actualiza.
// ─────────────────────────────────────────────
const PLANOS = [
  {
    id: "free",
    nome: "Gratuito",
    preco: 0,
    periodo: "",
    orcamentos: "3 orçamentos/mês",
    descricao: "Para experimentar sem compromisso.",
    destaque: false,
    ribbon: null,
    features: [
      "3 orçamentos por mês",
      "PDF profissional",
      "Gestão de clientes",
      "Dashboard de métricas",
      "Watermark no PDF",
    ],
  },
  {
    id: "starter",
    nome: "Starter",
    preco: "11,99",
    periodo: "/mês",
    orcamentos: "15 orçamentos/mês",
    descricao: "Para começar a trabalhar a sério.",
    destaque: false,
    ribbon: null,
    features: [
      "15 orçamentos por mês",
      "PDF sem watermark",
      "Logótipo próprio no PDF",
      "Suporte por email",
    ],
  },
  {
    id: "pro",
    nome: "Pro",
    preco: "17,99",
    periodo: "/mês",
    orcamentos: "Orçamentos ilimitados",
    descricao: "Para negócios em crescimento.",
    destaque: true,
    ribbon: "MAIS POPULAR",
    features: [
      "Orçamentos ilimitados",
      "PDF sem watermark",
      "Suporte prioritário",
      "Novas funcionalidades primeiro",
    ],
  },
];
const FAQ = [
  {
    q: "Os meus dados ficam seguros?",
    a: "Sim. O sistema usa autenticação JWT e cada conta é completamente isolada. Nenhum outro utilizador vê os teus orçamentos ou clientes.",
  },
  {
    q: "Os packs expiram?",
    a: "O Pack Starter (20 orçamentos) e o Pack Pro (60 orçamentos) não expiram. Usas ao teu ritmo. O plano Ilimitado é mensal.",
  },
  {
    q: "Como funciona o pagamento?",
    a: "Pagamento por MB WAY ou referência Multibanco, processado pela EuPago (supervisionada pelo Banco de Portugal). Ativação imediata após confirmação.",
  },
  {
    q: "Posso cancelar quando quiser?",
    a: "Sim. Não há contratos mínimos. Cancelas quando quiseres — o acesso mantém-se até ao fim do período pago.",
  },
  {
    q: "Preciso de instalar alguma coisa?",
    a: "Não. Funciona 100% pelo browser — Chrome, Safari, Firefox. Telemóvel, tablet ou computador. Sem instalações.",
  },
];

// ─────────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ─────────────────────────────────────────────
export default function Pricing() {
  const navigate = useNavigate();

  // Estado de dados — o que veio da API
  const [subscricao, setSubscricao] = useState(null);
  const [loadingSubscricao, setLoadingSubscricao] = useState(true);

  // Estado do modal de pagamento
  const [modalPlano, setModalPlano] = useState(null); // qual plano foi clicado
  const [modalAberto, setModalAberto] = useState(false);

  // Estado do FAQ — qual item está aberto
  const [faqAberto, setFaqAberto] = useState(null);

  // ── Carregar plano actual ao montar o componente ──────────
  // useEffect com array vazio = executa uma vez, no mount.
  // É aqui que buscamos os dados iniciais — nunca no render.
  // 1. PRIMEIRO — declara a função

  const carregarSubscricao = useCallback(async () => {
    try {
      const res = await getSubscricao();
      setSubscricao(res.data);
    } catch (err) {
      console.error("Erro ao carregar subscrição:", err);
      setSubscricao({
        plano: "free",
        orcamentosUsados: 0,
        orcamentosDisponiveis: 3,
      });
    } finally {
      setLoadingSubscricao(false);
    }
  }, []);

  useEffect(() => {
    carregarSubscricao();
  }, [carregarSubscricao]);

  const abrirModal = (plano) => {
    setModalPlano(plano);
    setModalAberto(true);
  };

  const fecharModal = () => {
    setModalAberto(false);
    setModalPlano(null);
  };

  const aoPagarComSucesso = () => {
    fecharModal();
    carregarSubscricao(); // refresh do plano após pagamento confirmado
  };

  // ── Calcular progresso da barra ───────────────────────────
  const calcularProgresso = () => {
    if (!subscricao) return 0;
    if (subscricao.orcamentosDisponiveis === -1) return 100; // ilimitado
    if (subscricao.orcamentosDisponiveis === 0) return 0;
    return Math.min(
      (subscricao.orcamentosUsados / subscricao.orcamentosDisponiveis) * 100,
      100,
    );
  };

  return (
    <div style={estilos.pagina}>
      {/* ── NAV ─────────────────────────────────────── */}
      <nav style={estilos.nav}>
        <span style={estilos.navLogo}>
          Orçamentos<span style={estilos.gradText}>PME</span>
        </span>
        <button style={estilos.navBack} onClick={() => navigate("/dashboard")}>
          ← Dashboard
        </button>
      </nav>

      {/* ── HERO ────────────────────────────────────── */}
      <div style={estilos.hero}>
        <div style={estilos.heroGlow} />
        <div
          style={{
            position: "relative",
            maxWidth: 680,
            margin: "0 auto",
            textAlign: "center",
          }}
        >
          <div style={estilos.heroBadge}>
            🚀 Profissionaliza o teu negócio hoje
          </div>
          <h1 style={estilos.heroTitulo}>
            Orçamentos profissionais
            <br />
            <span style={estilos.gradText}>em 2 minutos</span>
          </h1>
          <p style={estilos.heroSub}>
            Sem Word. Sem Excel. Sem cálculos manuais.
            <br />O teu cliente recebe um PDF com o teu nome — direto do
            telemóvel.
          </p>

          {/* Barra de estado do plano actual */}
          {!loadingSubscricao && subscricao && (
            <div style={estilos.planBar}>
              <span style={estilos.planBarLabel}>Plano actual:</span>
              <span style={estilos.planBarPlano}>
                {subscricao.plano?.toUpperCase() || "FREE"}
              </span>
              <span style={estilos.planBarSep}>·</span>
              <span style={estilos.planBarOrcs}>
                {subscricao.orcamentosDisponiveis === -1
                  ? "Ilimitados"
                  : `${subscricao.orcamentosUsados}/${subscricao.orcamentosDisponiveis} orçamentos usados`}
              </span>
            </div>
          )}

          {/* Barra de progresso visual */}
          {!loadingSubscricao &&
            subscricao &&
            subscricao.orcamentosDisponiveis !== -1 && (
              <div style={estilos.progressoWrapper}>
                <div
                  style={{
                    ...estilos.progressoBarra,
                    width: `${calcularProgresso()}%`,
                    background:
                      calcularProgresso() >= 80
                        ? "linear-gradient(90deg,#ef4444,#dc2626)"
                        : "linear-gradient(90deg,#a855f7,#ec4899)",
                  }}
                />
              </div>
            )}
        </div>
      </div>

      <hr style={estilos.divisor} />

      {/* ── PLANOS ──────────────────────────────────── */}
      <section style={estilos.seccao}>
        <span style={estilos.seccaoTag}>Planos & Preços</span>
        <h2 style={estilos.seccaoTitulo}>Escolhe o teu plano</h2>
        <p style={estilos.seccaoSub}>
          Sem contratos. Pagamento por MB WAY ou Multibanco. Ativação imediata.
        </p>

        <div style={estilos.planosGrid}>
          {PLANOS.map((plano) => {
            const eActual = subscricao?.plano === plano.id;
            return (
              <div
                key={plano.id}
                style={{
                  ...estilos.planoCard,
                  ...(plano.destaque ? estilos.planoCardDestaque : {}),
                  ...(eActual ? estilos.planoCardActual : {}),
                }}
              >
                {plano.ribbon && (
                  <div style={estilos.ribbon}>{plano.ribbon}</div>
                )}

                <div style={estilos.planoNome}>{plano.nome}</div>
                <div style={estilos.planoPreco}>
                  {plano.preco === 0 ? "€0" : `€${plano.preco}`}
                  {plano.periodo && (
                    <span style={estilos.planoPeriodo}> {plano.periodo}</span>
                  )}
                </div>
                <div style={estilos.planoOrcs}>{plano.orcamentos}</div>
                <p style={estilos.planoDesc}>{plano.descricao}</p>

                <ul style={estilos.featuresList}>
                  {plano.features.map((f, i) => (
                    <li key={i} style={estilos.featuresItem}>
                      <span style={estilos.featuresCheck}>✓</span>
                      {f}
                    </li>
                  ))}
                </ul>

                {/* Botão — lógica de estado */}
                {plano.id === "free" || eActual ? (
                  <button
                    style={{ ...estilos.planoBtn, ...estilos.planoBtnDisabled }}
                    disabled
                  >
                    {eActual ? "✓ Plano actual" : "✓ Incluído"}
                  </button>
                ) : (
                  <button
                    style={{
                      ...estilos.planoBtn,
                      ...(plano.destaque ? estilos.planoBtnDestaque : {}),
                    }}
                    onClick={() => abrirModal(plano)}
                  >
                    {plano.id === "ilimitado" ? "Subscrever" : "Comprar Agora"}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <hr style={estilos.divisor} />

      {/* ── FAQ ─────────────────────────────────────── */}
      <section style={estilos.seccao}>
        <span style={estilos.seccaoTag}>Dúvidas Frequentes</span>
        <h2 style={estilos.seccaoTitulo}>
          Respostas <span style={estilos.gradText}>rápidas</span>
        </h2>

        <div style={estilos.faqLista}>
          {FAQ.map((item, i) => (
            <div key={i} style={estilos.faqItem}>
              <button
                style={estilos.faqPergunta}
                onClick={() => setFaqAberto(faqAberto === i ? null : i)}
              >
                <span>{item.q}</span>
                <span
                  style={{
                    ...estilos.faqSeta,
                    transform:
                      faqAberto === i ? "rotate(45deg)" : "rotate(0deg)",
                  }}
                >
                  +
                </span>
              </button>
              {faqAberto === i && (
                <div style={estilos.faqResposta}>{item.a}</div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── MODAL DE PAGAMENTO ──────────────────────── */}
      {modalAberto && modalPlano && (
        <ModalPagamento
          plano={modalPlano}
          onFechar={fecharModal}
          onSucesso={aoPagarComSucesso}
        />
      )}
    </div>
  );
}

// ============================================================
// COMPONENTE MODAL DE PAGAMENTO
//
// Gere o fluxo completo:
//   etapa 1 — escolha de método (MB WAY ou Multibanco)
//   etapa 2 — referência gerada, aguardar pagamento
//   etapa 3 — pagamento confirmado
//
// O polling usa useRef para guardar o intervalId.
// Porquê useRef e não useState?
//   - useState causa re-render quando muda
//   - useRef guarda o valor sem causar re-render
//   - O intervalId não precisa de aparecer na UI
// ============================================================
function ModalPagamento({ plano, onFechar, onSucesso }) {
  // etapa: 'metodo' | 'aguardar' | 'confirmado' | 'erro'
  const [etapa, setEtapa] = useState("metodo");
  const [metodo, setMetodo] = useState(null);
  const [telefone, setTelefone] = useState("");
  const [dadosPagamento, setDadosPagamento] = useState(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState(null);

  // useRef para o interval — não causa re-render quando muda
  const intervalRef = useRef(null);

  // ── Cleanup: parar polling quando o modal fecha ───────────
  // Esta é a parte que distingue código robusto de código frágil.
  // Se não fizeres cleanup, o interval continua a correr em
  // memória mesmo depois de o componente ser destruído.
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const iniciarPagamento = async () => {
    if (metodo === "mbway" && !telefone) {
      setErro("Introduz o teu número de telemóvel.");
      return;
    }
    setLoading(true);
    setErro(null);

    try {
      const res = await criarPagamento(plano.id, metodo, telefone || null);
      setDadosPagamento(res.data);
      setEtapa("aguardar");
      iniciarPolling(res.data.referencia);
    } catch (err) {
      setErro("Erro ao criar pagamento. Tenta novamente.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ── Polling — verificar estado a cada 5 segundos ──────────
  // setInterval executa a função repetidamente.
  // Guardamos o ID em intervalRef para poder parar quando necessário.
  const iniciarPolling = (referencia) => {
    intervalRef.current = setInterval(async () => {
      try {
        const res = await verificarPagamento(referencia);
        if (res.data.estado === "pago") {
          clearInterval(intervalRef.current);
          setEtapa("confirmado");
        } else if (res.data.estado === "falhado") {
          clearInterval(intervalRef.current);
          setEtapa("erro");
          setErro("Pagamento falhado ou expirado. Tenta novamente.");
        }
      } catch (err) {
        console.error("Erro no polling:", err);
      }
    }, 5000); // 5 000ms = 5 segundos
  };

  return (
    // Overlay — fundo escuro semi-transparente
    <div
      style={estilos.overlay}
      onClick={(e) => e.target === e.currentTarget && onFechar()}
    >
      <div style={estilos.modal}>
        {/* Header do modal */}
        <div style={estilos.modalHeader}>
          <div>
            <div style={estilos.modalTitulo}>
              {etapa === "confirmado"
                ? "Pagamento confirmado!"
                : `${plano.nome} · €${plano.preco}`}
            </div>
            <div style={estilos.modalSub}>
              {etapa === "confirmado"
                ? "O teu plano foi activado."
                : plano.orcamentos}
            </div>
          </div>
          <button style={estilos.modalFechar} onClick={onFechar}>
            ✕
          </button>
        </div>

        {/* ── Etapa 1: Escolha de método ── */}
        {etapa === "metodo" && (
          <div>
            <p style={estilos.modalLabel}>Como queres pagar?</p>
            <div style={estilos.metodosGrid}>
              <button
                style={{
                  ...estilos.metodoBtn,
                  ...(metodo === "mbway" ? estilos.metodoBtnActivo : {}),
                }}
                onClick={() => setMetodo("mbway")}
              >
                <span style={{ fontSize: 24 }}>📱</span>
                <span style={{ fontWeight: 700 }}>MB WAY</span>
                <span style={{ fontSize: 11, color: "#9ca3af" }}>
                  Confirmação em 5 min
                </span>
              </button>
              <button
                style={{
                  ...estilos.metodoBtn,
                  ...(metodo === "multibanco" ? estilos.metodoBtnActivo : {}),
                }}
                onClick={() => setMetodo("multibanco")}
              >
                <span style={{ fontSize: 24 }}>🏧</span>
                <span style={{ fontWeight: 700 }}>Multibanco</span>
                <span style={{ fontSize: 11, color: "#9ca3af" }}>
                  Referência válida 3 dias
                </span>
              </button>
            </div>

            {/* Campo de telefone — só aparece se MB WAY seleccionado */}
            {metodo === "mbway" && (
              <div style={{ marginTop: 16 }}>
                <label style={estilos.modalLabel}>Número de telemóvel</label>
                <input
                  type="tel"
                  placeholder="9XXXXXXXX"
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  style={estilos.input}
                  maxLength={9}
                />
              </div>
            )}

            {erro && <p style={estilos.erroTexto}>{erro}</p>}

            <button
              style={{
                ...estilos.btnPrimario,
                opacity: !metodo || loading ? 0.5 : 1,
              }}
              onClick={iniciarPagamento}
              disabled={!metodo || loading}
            >
              {loading ? "A processar..." : `Pagar €${plano.preco}`}
            </button>
          </div>
        )}

        {/* ── Etapa 2: Aguardar pagamento ── */}
        {etapa === "aguardar" && dadosPagamento && (
          <div style={{ textAlign: "center" }}>
            {metodo === "multibanco" ? (
              <div>
                <p style={estilos.modalLabel}>
                  Paga na caixa Multibanco ou homebanking:
                </p>
                <div style={estilos.referenciaBox}>
                  <div style={estilos.referenciaLinha}>
                    <span style={estilos.referenciaRotulo}>Entidade</span>
                    <span style={estilos.referenciaValor}>
                      {dadosPagamento.entidade}
                    </span>
                  </div>
                  <div style={estilos.referenciaLinha}>
                    <span style={estilos.referenciaRotulo}>Referência</span>
                    <span style={estilos.referenciaValor}>
                      {dadosPagamento.referencia}
                    </span>
                  </div>
                  <div style={estilos.referenciaLinha}>
                    <span style={estilos.referenciaRotulo}>Montante</span>
                    <span style={estilos.referenciaValor}>€{plano.preco}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <p style={estilos.modalLabel}>
                  Abre o MB WAY no telemóvel e aceita o pedido de pagamento de{" "}
                  <strong>€{plano.preco}</strong>.
                </p>
                <p style={{ color: "#6b7280", fontSize: 12, marginTop: 8 }}>
                  Tens 5 minutos para aceitar.
                </p>
              </div>
            )}

            <div style={estilos.pollingIndicador}>
              <span style={estilos.pollingPonto} />A verificar pagamento...
            </div>
          </div>
        )}

        {/* ── Etapa 3: Confirmado ── */}
        {etapa === "confirmado" && (
          <div style={{ textAlign: "center", padding: "24px 0" }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>✅</div>
            <p style={{ color: "#d1d5db", marginBottom: 24 }}>
              O teu plano <strong>{plano.nome}</strong> está activo.
              <br />
              Podes já criar os teus orçamentos.
            </p>
            <button style={estilos.btnPrimario} onClick={onSucesso}>
              Ir para o Dashboard
            </button>
          </div>
        )}

        {/* ── Etapa erro ── */}
        {etapa === "erro" && (
          <div style={{ textAlign: "center", padding: "24px 0" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>❌</div>
            <p style={estilos.erroTexto}>{erro}</p>
            <button
              style={{ ...estilos.btnPrimario, marginTop: 16 }}
              onClick={() => {
                setEtapa("metodo");
                setErro(null);
              }}
            >
              Tentar novamente
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// ESTILOS — objectos CSS em JavaScript
//
// Em React, os estilos inline usam camelCase (backgroundColor
// em vez de background-color). Valores numéricos são px.
//
// Centralizar aqui tem as mesmas vantagens que o api.js:
// muda um valor, aplica em todo o lado que usa esse estilo.
// ============================================================
const GRAD = "linear-gradient(135deg,#a855f7,#ec4899,#f97316)";

const estilos = {
  pagina: {
    background: "#050508",
    color: "#f0f0f0",
    fontFamily: "'DM Sans', sans-serif",
    minHeight: "100vh",
  },
  gradText: {
    background: GRAD,
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  },

  // NAV
  nav: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 32px",
    borderBottom: "1px solid rgba(255,255,255,0.07)",
    background: "rgba(5,5,8,0.97)",
    position: "sticky",
    top: 0,
    zIndex: 10,
  },
  navLogo: {
    fontFamily: "'Syne', sans-serif",
    fontWeight: 800,
    fontSize: 17,
    color: "#fff",
  },
  navBack: {
    background: "none",
    border: "1px solid rgba(168,85,247,0.4)",
    color: "#a855f7",
    fontSize: 12,
    padding: "7px 16px",
    borderRadius: 8,
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
  },

  // HERO
  hero: {
    position: "relative",
    padding: "80px 24px 64px",
    textAlign: "center",
    overflow: "hidden",
  },
  heroGlow: {
    position: "absolute",
    top: -80,
    left: "50%",
    transform: "translateX(-50%)",
    width: 700,
    height: 480,
    background:
      "radial-gradient(ellipse,rgba(168,85,247,.18) 0%,rgba(236,72,153,.07) 45%,transparent 70%)",
    pointerEvents: "none",
  },
  heroBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    background: "rgba(168,85,247,.1)",
    border: "1px solid rgba(168,85,247,.28)",
    color: "#c084fc",
    fontSize: 12,
    fontWeight: 500,
    padding: "7px 18px",
    borderRadius: 100,
    marginBottom: 24,
  },
  heroTitulo: {
    fontFamily: "'Syne', sans-serif",
    fontSize: "clamp(2rem,5vw,3.6rem)",
    fontWeight: 800,
    lineHeight: 1.06,
    letterSpacing: -2,
    marginBottom: 18,
    color: "#fff",
  },
  heroSub: {
    fontSize: 15,
    color: "#6b7280",
    lineHeight: 1.75,
    marginBottom: 28,
  },

  // BARRA DE PLANO
  planBar: {
    display: "inline-flex",
    alignItems: "center",
    gap: 10,
    background: "rgba(255,255,255,.04)",
    border: "1px solid rgba(255,255,255,.08)",
    borderRadius: 8,
    padding: "9px 20px",
    fontSize: 12,
    marginBottom: 12,
  },
  planBarLabel: { color: "#6b7280" },
  planBarPlano: {
    background: GRAD,
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    fontWeight: 700,
  },
  planBarSep: { color: "#374151" },
  planBarOrcs: { color: "#374151" },

  // BARRA DE PROGRESSO
  progressoWrapper: {
    width: "100%",
    maxWidth: 320,
    margin: "0 auto",
    height: 4,
    background: "rgba(255,255,255,.06)",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressoBarra: {
    height: "100%",
    borderRadius: 4,
    transition: "width 0.5s ease",
  },

  // DIVISOR
  divisor: {
    border: "none",
    borderTop: "1px solid rgba(255,255,255,0.07)",
  },

  // SECÇÃO
  seccao: {
    maxWidth: 1060,
    margin: "0 auto",
    padding: "72px 24px",
  },
  seccaoTag: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    background: GRAD,
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    display: "block",
    marginBottom: 10,
  },
  seccaoTitulo: {
    fontFamily: "'Syne', sans-serif",
    fontSize: "clamp(1.6rem,3vw,2.4rem)",
    fontWeight: 800,
    letterSpacing: -1,
    lineHeight: 1.12,
    color: "#fff",
    marginBottom: 10,
  },
  seccaoSub: {
    color: "#6b7280",
    fontSize: 14,
    marginBottom: 40,
  },

  // PLANOS GRID
  planosGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 14,
  },
  planoCard: {
    background: "#0d0d12",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 14,
    padding: "26px 20px",
    position: "relative",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
  },
  planoCardDestaque: {
    border: "1px solid rgba(168,85,247,.5)",
    background: "#0f0a1a",
  },
  planoCardActual: {
    border: "1px solid rgba(255,255,255,.2)",
  },
  ribbon: {
    position: "absolute",
    top: 14,
    right: -26,
    background: GRAD,
    color: "#fff",
    fontSize: 9,
    fontWeight: 800,
    padding: "3px 38px",
    transform: "rotate(45deg)",
    letterSpacing: "0.06em",
  },
  planoNome: {
    fontSize: 10,
    fontWeight: 700,
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    marginBottom: 8,
  },
  planoPreco: {
    fontFamily: "'Syne', sans-serif",
    fontSize: "2.2rem",
    fontWeight: 800,
    color: "#fff",
    lineHeight: 1,
    marginBottom: 2,
  },
  planoPeriodo: {
    fontSize: 13,
    color: "#4b5563",
    fontWeight: 400,
  },
  planoOrcs: {
    fontSize: 12,
    fontWeight: 700,
    background: GRAD,
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    margin: "7px 0",
  },
  planoDesc: {
    fontSize: 12,
    color: "#6b7280",
    lineHeight: 1.6,
    marginBottom: 18,
    flex: 1,
  },
  featuresList: {
    listStyle: "none",
    padding: 0,
    margin: "0 0 20px",
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  featuresItem: {
    fontSize: 12,
    color: "#9ca3af",
    display: "flex",
    gap: 7,
    alignItems: "flex-start",
  },
  featuresCheck: {
    background: GRAD,
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    fontWeight: 700,
    flexShrink: 0,
    fontSize: 12,
  },
  planoBtn: {
    padding: "11px 0",
    background: "rgba(255,255,255,.05)",
    border: "1px solid rgba(255,255,255,.1)",
    borderRadius: 8,
    color: "#e5e7eb",
    fontWeight: 600,
    fontSize: 13,
    cursor: "pointer",
    width: "100%",
    fontFamily: "'DM Sans', sans-serif",
    transition: "opacity .2s",
  },
  planoBtnDestaque: {
    background: GRAD,
    border: "none",
    color: "#fff",
  },
  planoBtnDisabled: {
    opacity: 0.35,
    cursor: "default",
  },

  // FAQ
  faqLista: {
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 14,
    overflow: "hidden",
    marginTop: 32,
  },
  faqItem: {
    borderBottom: "1px solid rgba(255,255,255,0.07)",
  },
  faqPergunta: {
    width: "100%",
    background: "#0a0a0f",
    border: "none",
    color: "#e5e7eb",
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 13,
    fontWeight: 500,
    padding: "16px 22px",
    textAlign: "left",
    cursor: "pointer",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 16,
  },
  faqSeta: {
    background: GRAD,
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    fontSize: 20,
    transition: "transform .25s",
    flexShrink: 0,
    lineHeight: 1,
    display: "inline-block",
  },
  faqResposta: {
    background: "#0a0a0f",
    padding: "0 22px 16px",
    fontSize: 12,
    color: "#6b7280",
    lineHeight: 1.75,
  },

  // OVERLAY + MODAL
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.8)",
    backdropFilter: "blur(4px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 100,
    padding: 16,
  },
  modal: {
    background: "#0d0d12",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 16,
    padding: "28px 24px",
    width: "100%",
    maxWidth: 440,
    maxHeight: "90vh",
    overflowY: "auto",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
  },
  modalTitulo: {
    fontFamily: "'Syne', sans-serif",
    fontSize: 18,
    fontWeight: 800,
    color: "#fff",
  },
  modalSub: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 4,
  },
  modalFechar: {
    background: "none",
    border: "none",
    color: "#6b7280",
    fontSize: 18,
    cursor: "pointer",
    padding: 4,
  },
  modalLabel: {
    fontSize: 13,
    color: "#9ca3af",
    marginBottom: 12,
    display: "block",
  },

  // MÉTODOS DE PAGAMENTO
  metodosGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 10,
    marginBottom: 16,
  },
  metodoBtn: {
    background: "rgba(255,255,255,.03)",
    border: "1px solid rgba(255,255,255,.1)",
    borderRadius: 10,
    padding: "14px 12px",
    color: "#e5e7eb",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 6,
    fontFamily: "'DM Sans', sans-serif",
    transition: "border-color .2s",
  },
  metodoBtnActivo: {
    border: "1px solid rgba(168,85,247,.6)",
    background: "rgba(168,85,247,.08)",
  },

  // INPUT
  input: {
    width: "100%",
    background: "rgba(255,255,255,.04)",
    border: "1px solid rgba(255,255,255,.12)",
    borderRadius: 8,
    color: "#f0f0f0",
    padding: "10px 14px",
    fontSize: 14,
    fontFamily: "'DM Sans', sans-serif",
    outline: "none",
    marginTop: 6,
  },

  // BOTÃO PRIMÁRIO
  btnPrimario: {
    width: "100%",
    padding: "13px 0",
    background: GRAD,
    border: "none",
    borderRadius: 10,
    color: "#fff",
    fontWeight: 700,
    fontSize: 14,
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
    marginTop: 16,
  },

  // REFERÊNCIA MULTIBANCO
  referenciaBox: {
    background: "rgba(255,255,255,.03)",
    border: "1px solid rgba(255,255,255,.08)",
    borderRadius: 10,
    padding: "16px 20px",
    margin: "16px 0",
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  referenciaLinha: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  referenciaRotulo: {
    fontSize: 11,
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
  },
  referenciaValor: {
    fontFamily: "'Syne', sans-serif",
    fontSize: 16,
    fontWeight: 800,
    color: "#fff",
    letterSpacing: 2,
  },

  // POLLING
  pollingIndicador: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    fontSize: 12,
    color: "#6b7280",
    marginTop: 20,
  },
  pollingPonto: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    background: "#a855f7",
    animation: "pulse 1.5s infinite",
  },

  // ERRO
  erroTexto: {
    color: "#ef4444",
    fontSize: 13,
    marginTop: 8,
  },
};
