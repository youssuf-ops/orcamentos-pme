// ============================================================
// frontend/src/pages/LandingPage.jsx
//
// Página pública — rota /
// Qualquer pessoa vê sem estar autenticada.
// Objetivo: converter visitante em conta registada.
// ============================================================

import { useNavigate } from "react-router-dom";
import { useEffect, useRef } from "react";

// ── Fonte via @import no head ─────────────────────────────
const fontLink = document.createElement("link");
fontLink.rel = "stylesheet";
fontLink.href =
  "https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500&display=swap";
document.head.appendChild(fontLink);

// ── Injectar animações CSS globais ────────────────────────
const style = document.createElement("style");
style.textContent = `
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(28px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes glowPulse {
    0%, 100% { opacity: 0.5; }
    50%       { opacity: 0.9; }
  }
  @keyframes blink {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.3; }
  }
  .fade-1 { animation: fadeUp 0.7s 0.1s ease both; }
  .fade-2 { animation: fadeUp 0.7s 0.25s ease both; }
  .fade-3 { animation: fadeUp 0.7s 0.4s ease both; }
  .fade-4 { animation: fadeUp 0.7s 0.55s ease both; }
  .fade-5 { animation: fadeUp 0.7s 0.7s ease both; }
  .plano-card-land:hover { transform: translateY(-4px); border-color: rgba(0,229,160,0.4) !important; }
  .btn-land-primary:hover { transform: translateY(-2px); box-shadow: 0 0 48px rgba(0,229,160,0.45) !important; }
  .btn-land-secondary:hover { border-color: #555 !important; }
  .feature-card-land:hover { background: #161616 !important; }
  .step-land:hover .step-num-land { color: rgba(0,229,160,0.3) !important; }
`;
document.head.appendChild(style);

// ── Dados ─────────────────────────────────────────────────
const PLANOS = [
  {
    id: "free",
    nome: "Gratuito",
    preco: "€0",
    periodo: "",
    orcs: "3 orçamentos",
    desc: "Para experimentar sem compromisso.",
    destaque: false,
    features: ["3 orçamentos", "PDF profissional", "Gestão de clientes", "Dashboard"],
  },
  {
    id: "starter",
    nome: "Starter",
    preco: "€20",
    periodo: "compra única",
    orcs: "20 orçamentos",
    desc: "Para começar a trabalhar a sério.",
    destaque: false,
    features: ["20 orçamentos", "Não expira", "PDF profissional", "Suporte email"],
  },
  {
    id: "pro",
    nome: "Pro",
    preco: "€45",
    periodo: "compra única",
    orcs: "60 orçamentos",
    desc: "Para negócios em crescimento.",
    destaque: true,
    features: ["60 orçamentos", "Não expira", "PDF profissional", "Suporte prioritário"],
  },
  {
    id: "ilimitado",
    nome: "Ilimitado",
    preco: "€19",
    periodo: "/mês",
    orcs: "Ilimitados",
    desc: "Para quem emite muito.",
    destaque: false,
    features: ["Sem limite", "Renovação mensal", "Suporte prioritário", "Funcionalidades primeiro"],
  },
];

const FEATURES = [
  { icon: "📄", titulo: "PDF em 1 clique", desc: "Orçamento com o teu nome, serviços e totais com IVA. Pronto a enviar por WhatsApp ou email." },
  { icon: "👥", titulo: "Base de clientes", desc: "Cria e gere os teus clientes. Histórico completo de orçamentos por cliente em segundos." },
  { icon: "📊", titulo: "Dashboard em tempo real", desc: "Aprovados, pendentes e valor total em aberto. Sabes sempre o estado do teu negócio." },
  { icon: "🔐", titulo: "Dados isolados", desc: "Autenticação JWT. A tua conta é privada — nenhum outro utilizador vê os teus dados." },
  { icon: "⚡", titulo: "2 minutos por orçamento", desc: "Do zero ao PDF em menos de 2 minutos. Funciona em telemóvel, tablet e computador." },
  { icon: "🧮", titulo: "IVA automático", desc: "O sistema calcula subtotal, IVA e total sem erro. Zero cálculos manuais." },
];

const PASSOS = [
  { n: "01", titulo: "Cria a tua conta", desc: "Regista-te com o nome do teu negócio e email. Acesso imediato — sem cartão, sem espera." },
  { n: "02", titulo: "Adiciona o cliente", desc: "Cria o cliente com nome e contacto. Fica guardado para todos os orçamentos futuros." },
  { n: "03", titulo: "Cria o orçamento", desc: "Adiciona serviços, quantidades e preços. O sistema calcula IVA e total em tempo real." },
  { n: "04", titulo: "Gera e envia o PDF", desc: "Clica em Gerar PDF. Fazes download e envias por WhatsApp ou email — ali mesmo." },
];

// ── Componente principal ───────────────────────────────────
export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div style={s.page}>

      {/* ── NAV ──────────────────────────────────────── */}
      <nav style={s.nav}>
        <div style={s.navLogo}>
          Orçamentos<span style={s.accent}>PME</span>
        </div>
        <div style={s.navRight}>
          <button style={s.btnNavLogin} onClick={() => navigate("/login")}>
            Entrar
          </button>
          <button style={s.btnNavCta} onClick={() => navigate("/register")}>
            Começar grátis
          </button>
        </div>
      </nav>

      {/* ── HERO ─────────────────────────────────────── */}
      <section style={s.hero}>
        <div style={s.heroGlow} />
        <div style={s.heroGlow2} />

        <div className="fade-1" style={s.heroBadge}>
          <span style={s.heroBadgeDot} />
          Sistema de orçamentos para PMEs portuguesas
        </div>

        <h1 className="fade-2" style={s.heroH1}>
          Chega de Word.<br />
          Chega de Excel.<br />
          <span style={s.heroH1Accent}>PDFs em 2 minutos.</span>
        </h1>

        <p className="fade-3" style={s.heroSub}>
          O teu cliente recebe um orçamento profissional com o teu nome,
          os serviços e os preços — direto do telemóvel, em menos de 2 minutos.
        </p>

        <div className="fade-4" style={s.heroActions}>
          <button
            className="btn-land-primary"
            style={s.btnPrimary}
            onClick={() => navigate("/register")}
          >
            Criar conta gratuita →
          </button>
          <button
            className="btn-land-secondary"
            style={s.btnSecondary}
            onClick={() => navigate("/login")}
          >
            Já tenho conta
          </button>
        </div>

        <div className="fade-5" style={s.heroProof}>
          {["2 min por orçamento", "100% online", "IVA automático", "PDF profissional"].map((item) => (
            <div key={item} style={s.proofItem}>
              <span style={s.proofDot}>✓</span> {item}
            </div>
          ))}
        </div>
      </section>

      {/* ── PARA QUEM É ──────────────────────────────── */}
      <div style={s.paraQuemBar}>
        {["Salões de beleza", "Barbearias", "Clínicas", "Consultores", "Spas", "Prestadores de serviços", "Empresas de obras"].map((item) => (
          <span key={item} style={s.paraQuemItem}>{item}</span>
        ))}
      </div>

      <hr style={s.divisor} />

      {/* ── FUNCIONALIDADES ──────────────────────────── */}
      <section style={s.seccao}>
        <p style={s.tag}>Funcionalidades</p>
        <h2 style={s.h2}>
          Tudo o que precisas<br />
          <span style={s.accent}>para fechar negócio</span>
        </h2>
        <p style={s.sub}>Desenvolvido para PMEs que emitem orçamentos para serviços, tratamentos, obras ou consultorias.</p>

        <div style={s.featGrid}>
          {FEATURES.map((f) => (
            <div key={f.titulo} className="feature-card-land" style={s.featCard}>
              <div style={s.featIcon}>{f.icon}</div>
              <div style={s.featTitulo}>{f.titulo}</div>
              <div style={s.featDesc}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      <hr style={s.divisor} />

      {/* ── COMO FUNCIONA ────────────────────────────── */}
      <section style={s.seccao}>
        <p style={s.tag}>Primeiros passos</p>
        <h2 style={s.h2}>
          Do zero ao primeiro PDF<br />
          <span style={s.accent}>em 5 minutos</span>
        </h2>

        <div style={s.passosGrid}>
          {PASSOS.map((p) => (
            <div key={p.n} className="step-land" style={s.passo}>
              <div className="step-num-land" style={s.passoNum}>{p.n}</div>
              <div>
                <div style={s.passoTitulo}>{p.titulo}</div>
                <div style={s.passoDesc}>{p.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <hr style={s.divisor} />

      {/* ── PLANOS ───────────────────────────────────── */}
      <section style={s.seccao}>
        <p style={s.tag}>Planos & Preços</p>
        <h2 style={s.h2}>Começa grátis.<br /><span style={s.accent}>Cresce quando precisares.</span></h2>
        <p style={s.sub}>Sem contratos. Pagamento por MB WAY ou Multibanco. Ativação imediata.</p>

        <div style={s.planosGrid}>
          {PLANOS.map((plano) => (
            <div
              key={plano.id}
              className="plano-card-land"
              style={{
                ...s.planoCard,
                ...(plano.destaque ? s.planoCardDestaque : {}),
              }}
            >
              {plano.destaque && <div style={s.ribbon}>MELHOR VALOR</div>}
              <div style={s.planoNome}>{plano.nome}</div>
              <div style={s.planoPreco}>
                {plano.preco}
                {plano.periodo && <span style={s.planoPeriodo}> {plano.periodo}</span>}
              </div>
              <div style={s.planoOrcs}>{plano.orcs}</div>
              <p style={s.planoDesc}>{plano.desc}</p>
              <ul style={s.planoFeats}>
                {plano.features.map((f) => (
                  <li key={f} style={s.planoFeatItem}>
                    <span style={s.check}>✓</span>{f}
                  </li>
                ))}
              </ul>
              <button
                style={{
                  ...s.planoBtnBase,
                  ...(plano.destaque ? s.planoBtnDestaque : {}),
                  ...(plano.id === "free" ? s.planoBtnFree : {}),
                }}
                onClick={() => navigate("/register")}
              >
                {plano.id === "free" ? "Começar grátis" : plano.id === "ilimitado" ? "Subscrever" : "Comprar"}
              </button>
            </div>
          ))}
        </div>
      </section>

      <hr style={s.divisor} />

      {/* ── CTA FINAL ────────────────────────────────── */}
      <section style={s.ctaSection}>
        <div style={s.ctaGlow} />
        <p style={{ ...s.tag, textAlign: "center" }}>Começa hoje</p>
        <h2 style={{ ...s.h2, textAlign: "center" }}>
          Pronto para <span style={s.accent}>profissionalizar</span><br />
          os teus orçamentos?
        </h2>
        <p style={{ ...s.sub, textAlign: "center" }}>
          Cria a tua conta agora e emite o primeiro PDF em menos de 5 minutos.<br />
          Sem cartão de crédito. 3 orçamentos grátis. Acesso imediato.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", position: "relative" }}>
          <button
            className="btn-land-primary"
            style={s.btnPrimary}
            onClick={() => navigate("/register")}
          >
            Criar conta gratuita →
          </button>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────── */}
      <footer style={s.footer}>
        <span style={s.footerLogo}>Orçamentos<span style={s.accent}>PME</span></span>
        <span style={s.footerSub}>by Albiclick · contacto@albiclick.com</span>
        <span style={s.footerSub}>© 2026</span>
      </footer>

    </div>
  );
}

// ── Estilos ───────────────────────────────────────────────
const ACCENT = "#00E5A0";
const GRAD = `linear-gradient(135deg, ${ACCENT}, #00B87A)`;

const s = {
  page: {
    background: "#0a0a0a",
    color: "#F0F0F0",
    fontFamily: "'DM Sans', sans-serif",
    minHeight: "100vh",
    overflowX: "hidden",
  },
  accent: {
    color: ACCENT,
  },

  // NAV
  nav: {
    position: "sticky",
    top: 0,
    zIndex: 50,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0 2rem",
    height: 60,
    background: "rgba(10,10,10,0.92)",
    backdropFilter: "blur(12px)",
    borderBottom: "1px solid #1a1a1a",
  },
  navLogo: {
    fontFamily: "'Syne', sans-serif",
    fontWeight: 800,
    fontSize: 17,
    color: "#fff",
    letterSpacing: -0.5,
  },
  navRight: {
    display: "flex",
    gap: 10,
    alignItems: "center",
  },
  btnNavLogin: {
    background: "none",
    border: "none",
    color: "#888",
    fontSize: 13,
    fontWeight: 500,
    cursor: "pointer",
    padding: "8px 14px",
    fontFamily: "'DM Sans', sans-serif",
  },
  btnNavCta: {
    background: ACCENT,
    border: "none",
    color: "#000",
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
    padding: "8px 18px",
    borderRadius: 6,
    fontFamily: "'DM Sans', sans-serif",
  },

  // HERO
  hero: {
    position: "relative",
    minHeight: "92vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    padding: "5rem 1.5rem 4rem",
    overflow: "hidden",
  },
  heroGlow: {
    position: "absolute",
    top: -180,
    left: "50%",
    transform: "translateX(-50%)",
    width: 700,
    height: 700,
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(0,229,160,0.07) 0%, transparent 70%)",
    pointerEvents: "none",
    animation: "glowPulse 6s ease-in-out infinite",
  },
  heroGlow2: {
    position: "absolute",
    bottom: -100,
    right: "10%",
    width: 400,
    height: 400,
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(0,184,122,0.05) 0%, transparent 70%)",
    pointerEvents: "none",
  },
  heroBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    background: "rgba(0,229,160,0.07)",
    border: "1px solid rgba(0,229,160,0.18)",
    color: ACCENT,
    fontSize: 12,
    fontWeight: 500,
    letterSpacing: "0.05em",
    padding: "6px 16px",
    borderRadius: 100,
    marginBottom: "2rem",
    position: "relative",
  },
  heroBadgeDot: {
    width: 6,
    height: 6,
    borderRadius: "50%",
    background: ACCENT,
    animation: "blink 2s infinite",
    flexShrink: 0,
  },
  heroH1: {
    fontFamily: "'Syne', sans-serif",
    fontSize: "clamp(2.6rem, 6vw, 5rem)",
    fontWeight: 800,
    lineHeight: 1.04,
    letterSpacing: -2,
    marginBottom: "1.5rem",
    color: "#fff",
    position: "relative",
  },
  heroH1Accent: {
    color: ACCENT,
  },
  heroSub: {
    fontSize: "clamp(1rem, 2vw, 1.15rem)",
    color: "#777",
    maxWidth: 540,
    lineHeight: 1.75,
    marginBottom: "2.5rem",
    position: "relative",
  },
  heroActions: {
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
    justifyContent: "center",
    marginBottom: "2.5rem",
    position: "relative",
  },
  btnPrimary: {
    background: ACCENT,
    border: "none",
    color: "#000",
    fontWeight: 700,
    fontSize: 14,
    padding: "14px 28px",
    borderRadius: 8,
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
    boxShadow: "0 0 32px rgba(0,229,160,0.2)",
    transition: "transform .2s, box-shadow .2s",
  },
  btnSecondary: {
    background: "transparent",
    border: "1px solid #333",
    color: "#ddd",
    fontWeight: 500,
    fontSize: 14,
    padding: "14px 28px",
    borderRadius: 8,
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
    transition: "border-color .2s",
  },
  heroProof: {
    display: "flex",
    gap: "1.5rem",
    flexWrap: "wrap",
    justifyContent: "center",
    position: "relative",
  },
  proofItem: {
    fontSize: 12,
    color: "#555",
    display: "flex",
    alignItems: "center",
    gap: 6,
  },
  proofDot: {
    color: ACCENT,
    fontWeight: 700,
  },

  // PARA QUEM
  paraQuemBar: {
    display: "flex",
    justifyContent: "center",
    gap: "1.5rem",
    flexWrap: "wrap",
    padding: "1.5rem 2rem",
    borderTop: "1px solid #141414",
    borderBottom: "1px solid #141414",
    background: "#0d0d0d",
  },
  paraQuemItem: {
    fontSize: 12,
    color: "#444",
    fontWeight: 500,
    letterSpacing: "0.04em",
  },

  // DIVISOR
  divisor: {
    border: "none",
    borderTop: "1px solid #141414",
  },

  // SECÇÃO
  seccao: {
    maxWidth: 1080,
    margin: "0 auto",
    padding: "5rem 1.5rem",
  },
  tag: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    color: ACCENT,
    marginBottom: "0.75rem",
    display: "block",
  },
  h2: {
    fontFamily: "'Syne', sans-serif",
    fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
    fontWeight: 800,
    letterSpacing: -1,
    lineHeight: 1.1,
    marginBottom: "1rem",
    color: "#fff",
  },
  sub: {
    color: "#666",
    fontSize: "0.95rem",
    lineHeight: 1.7,
    maxWidth: 520,
    marginBottom: "3rem",
  },

  // FEATURES
  featGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: 1,
    background: "#141414",
    border: "1px solid #141414",
    borderRadius: 12,
    overflow: "hidden",
  },
  featCard: {
    background: "#0f0f0f",
    padding: "2rem",
    transition: "background .2s",
    cursor: "default",
  },
  featIcon: {
    fontSize: 28,
    marginBottom: "0.75rem",
  },
  featTitulo: {
    fontFamily: "'Syne', sans-serif",
    fontSize: "0.95rem",
    fontWeight: 700,
    color: "#fff",
    marginBottom: "0.5rem",
  },
  featDesc: {
    fontSize: 13,
    color: "#555",
    lineHeight: 1.65,
  },

  // PASSOS
  passosGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: 0,
    borderTop: "1px solid #141414",
  },
  passo: {
    display: "grid",
    gridTemplateColumns: "56px 1fr",
    gap: "1rem",
    padding: "2rem 1rem",
    borderBottom: "1px solid #141414",
    alignItems: "flex-start",
    cursor: "default",
  },
  passoNum: {
    fontFamily: "'Syne', sans-serif",
    fontSize: "2.4rem",
    fontWeight: 800,
    color: "#1a1a1a",
    lineHeight: 1,
    transition: "color .3s",
  },
  passoTitulo: {
    fontFamily: "'Syne', sans-serif",
    fontSize: "0.95rem",
    fontWeight: 700,
    color: "#fff",
    marginBottom: "0.4rem",
  },
  passoDesc: {
    fontSize: 13,
    color: "#555",
    lineHeight: 1.7,
  },

  // PLANOS
  planosGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 14,
  },
  planoCard: {
    background: "#0f0f0f",
    border: "1px solid #1a1a1a",
    borderRadius: 14,
    padding: "1.75rem 1.25rem",
    position: "relative",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    transition: "transform .2s, border-color .2s",
    cursor: "default",
  },
  planoCardDestaque: {
    border: "1px solid rgba(0,229,160,0.25)",
    background: "#0a1410",
  },
  ribbon: {
    position: "absolute",
    top: 14,
    right: -26,
    background: GRAD,
    color: "#000",
    fontSize: 9,
    fontWeight: 800,
    padding: "3px 38px",
    transform: "rotate(45deg)",
    letterSpacing: "0.06em",
  },
  planoNome: {
    fontSize: 10,
    fontWeight: 700,
    color: "#555",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    marginBottom: 8,
  },
  planoPreco: {
    fontFamily: "'Syne', sans-serif",
    fontSize: "2rem",
    fontWeight: 800,
    color: "#fff",
    lineHeight: 1,
    marginBottom: 2,
  },
  planoPeriodo: {
    fontSize: 12,
    color: "#444",
    fontWeight: 400,
  },
  planoOrcs: {
    fontSize: 12,
    fontWeight: 700,
    color: ACCENT,
    margin: "6px 0",
  },
  planoDesc: {
    fontSize: 12,
    color: "#555",
    lineHeight: 1.6,
    marginBottom: 16,
    flex: 1,
  },
  planoFeats: {
    listStyle: "none",
    padding: 0,
    margin: "0 0 20px",
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  planoFeatItem: {
    fontSize: 12,
    color: "#555",
    display: "flex",
    gap: 8,
    alignItems: "flex-start",
  },
  check: {
    color: ACCENT,
    fontWeight: 700,
    flexShrink: 0,
  },
  planoBtnBase: {
    padding: "10px 0",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid #222",
    borderRadius: 8,
    color: "#ccc",
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
    color: "#000",
  },
  planoBtnFree: {
    border: "1px solid rgba(0,229,160,0.2)",
    color: ACCENT,
  },

  // CTA
  ctaSection: {
    position: "relative",
    textAlign: "center",
    padding: "6rem 1.5rem",
    overflow: "hidden",
  },
  ctaGlow: {
    position: "absolute",
    top: 0,
    left: "50%",
    transform: "translateX(-50%)",
    width: 600,
    height: 400,
    background: "radial-gradient(ellipse, rgba(0,229,160,0.06) 0%, transparent 70%)",
    pointerEvents: "none",
  },

  // FOOTER
  footer: {
    borderTop: "1px solid #141414",
    padding: "1.5rem 2rem",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 12,
  },
  footerLogo: {
    fontFamily: "'Syne', sans-serif",
    fontWeight: 800,
    fontSize: 14,
    color: "#fff",
  },
  footerSub: {
    fontSize: 12,
    color: "#333",
  },
};
