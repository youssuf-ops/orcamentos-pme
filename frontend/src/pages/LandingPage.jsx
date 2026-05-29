// frontend/src/pages/LandingPage.jsx
// Correcções mobile: nav, hero, planos grid, prova social
// Planos actualizados: Free €0 / Starter €11,99/mês / Pro €17,99/mês

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// ============================================================
// FONTES — injectadas uma vez no head
// Nota: em produção é melhor colocar no index.html directamente.
// Mas como o projecto usa estilos inline em JSX, mantemos aqui.
// ============================================================
if (!document.getElementById("lp-fonts")) {
  const link = document.createElement("link");
  link.id = "lp-fonts";
  link.rel = "stylesheet";
  link.href =
    "https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap";
  document.head.appendChild(link);
}

// ============================================================
// CSS GLOBAL — animações + media queries
// Os media queries NÃO funcionam em estilos inline React.
// A única forma de os usar é via <style> tag ou ficheiro CSS.
// Por isso injectamos aqui, com guard para não duplicar.
// ============================================================
if (!document.getElementById("lp-styles")) {
  const style = document.createElement("style");
  style.id = "lp-styles";
  style.textContent = `
    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(20px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes glowPulse {
      0%, 100% { opacity: 0.4; }
      50%       { opacity: 0.9; }
    }
    @keyframes blinkDot {
      0%, 100% { opacity: 1; }
      50%       { opacity: 0.2; }
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .lp-f1 { animation: fadeUp .6s .05s ease both; }
    .lp-f2 { animation: fadeUp .6s .15s ease both; }
    .lp-f3 { animation: fadeUp .6s .25s ease both; }
    .lp-f4 { animation: fadeUp .6s .35s ease both; }
    .lp-f5 { animation: fadeUp .6s .45s ease both; }

    /* HOVER utilitários */
    .lp-btn-glow:hover  { transform: translateY(-2px) !important; box-shadow: 0 0 52px rgba(168,85,247,.55) !important; }
    .lp-btn-ghost:hover { border-color: #555 !important; }
    .lp-feat-card:hover { background: #0e0e15 !important; }
    .lp-plan-card:hover { transform: translateY(-3px); }
    .lp-faq-btn:hover   { background: #0e0e15 !important; }

    /* ── MOBILE (< 480px) ─────────────────────────────── */
    @media (max-width: 479px) {

      /* Nav: logo menor, botões compactos */
      .lp-nav-logo  { font-size: 15px !important; }
      .lp-nav-inner { gap: 6px !important; }
      .lp-nav-login { display: none !important; }          /* esconde "Entrar" */
      .lp-nav-cta   { font-size: 12px !important; padding: 7px 14px !important; }

      /* Hero: menos padding, título menor */
      .lp-hero      { padding: 4rem 1.1rem 3rem !important; }
      .lp-hero-h1   { font-size: 2.6rem !important; letter-spacing: -2px !important; }
      .lp-hero-sub  { font-size: 0.95rem !important; }

      /* Hero actions: coluna única */
      .lp-hero-actions { flex-direction: column !important; align-items: stretch !important; }

      /* Proof bar: 2 colunas */
      .lp-proof-bar  { gap: 0 !important; }
      .lp-proof-item { flex: 1 1 50% !important; padding: 1rem 0.5rem !important; }

      /* Para quem: menor */
      .lp-para-quem { padding: 0.75rem 1rem !important; gap: 0.75rem !important; }

      /* Features: 1 coluna */
      .lp-feat-grid { grid-template-columns: 1fr !important; }

      /* Planos: 1 coluna (não 4!) */
      .lp-plans-grid { grid-template-columns: 1fr !important; gap: 14px !important; }

      /* Secções: padding lateral menor */
      .lp-section { padding: 3rem 1.1rem !important; }

      /* Footer: coluna única centrada */
      .lp-footer { flex-direction: column !important; align-items: center !important; text-align: center !important; padding: 1.25rem 1rem !important; }
    }

    /* ── TABLET (480px – 767px) ───────────────────────── */
    @media (min-width: 480px) and (max-width: 767px) {
      .lp-nav-login { display: none !important; }
      .lp-hero      { padding: 5rem 1.5rem 3.5rem !important; }
      .lp-feat-grid { grid-template-columns: repeat(2, 1fr) !important; }
      .lp-plans-grid { grid-template-columns: 1fr 1fr !important; }
      .lp-section   { padding: 3.5rem 1.5rem !important; }
    }

    /* ── TABLET GRANDE (768px – 1023px) ──────────────── */
    @media (min-width: 768px) and (max-width: 1023px) {
      .lp-feat-grid  { grid-template-columns: repeat(3, 1fr) !important; }
      .lp-plans-grid { grid-template-columns: repeat(3, 1fr) !important; }
    }
  `;
  document.head.appendChild(style);
}

// ============================================================
// GRADIENTE — constante central
// Se mudares a cor do produto, mudas só aqui.
// ============================================================
const G = "linear-gradient(135deg,#a855f7,#ec4899,#f97316)";

// Componente utilitário: texto com gradiente
const GradText = ({ children }) => (
  <span style={{ background: G, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
    {children}
  </span>
);

// Componente utilitário: tag de secção
const Tag = ({ children, center = false }) => (
  <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", background: G, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: 12, textAlign: center ? "center" : "left" }}>
    {children}
  </p>
);

const HR = () => (
  <hr style={{ border: "none", borderTop: "1px solid rgba(255,255,255,.06)", margin: 0 }} />
);

// ============================================================
// FAQ ITEM — componente isolado com estado próprio
// ============================================================
function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: "1px solid rgba(255,255,255,.07)" }}>
      <button
        className="lp-faq-btn"
        onClick={() => setOpen(!open)}
        style={{ width: "100%", background: "#0a0a0f", border: "none", color: "#e5e7eb", fontFamily: "'DM Sans',sans-serif", fontSize: 13, fontWeight: 500, padding: "16px 20px", textAlign: "left", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, transition: "background .15s" }}
      >
        <span style={{ flex: 1 }}>{q}</span>
        <span style={{ background: G, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", fontSize: 22, transform: open ? "rotate(45deg)" : "none", transition: "transform .25s", display: "inline-block", flexShrink: 0, lineHeight: 1 }}>+</span>
      </button>
      {open && (
        <p style={{ background: "#0a0a0f", margin: 0, padding: "0 20px 16px", fontSize: 13, color: "#6b7280", lineHeight: 1.8 }}>{a}</p>
      )}
    </div>
  );
}

// ============================================================
// DADOS — fonte única de verdade
// Planos actualizados: Free / Starter €11,99/mês / Pro €17,99/mês
// ============================================================
const FEATS = [
  { e: "📄", t: "PDF em 1 clique",        d: "Orçamento com o teu nome, serviços e IVA. Pronto a enviar por WhatsApp." },
  { e: "👥", t: "Base de clientes",        d: "Cria clientes e acede ao histórico completo de orçamentos em segundos." },
  { e: "📊", t: "Dashboard em tempo real", d: "Aprovados, pendentes e valor em aberto. Sabes sempre o estado do negócio." },
  { e: "🔐", t: "Dados isolados",          d: "JWT em cada request. A tua conta é 100% privada — zero partilha de dados." },
  { e: "⚡", t: "2 minutos por orçamento", d: "Do zero ao PDF em menos de 2 minutos. Funciona em qualquer dispositivo." },
  { e: "🧮", t: "IVA automático",          d: "Subtotal, IVA e total calculados sem erros. Zero cálculos manuais." },
];

// PLANOS NOVOS — subscrição mensal
const PLANS = [
  {
    id: "free",
    n: "Gratuito",
    preco: "€0",
    per: "",
    orcs: "3 orçamentos / mês",
    desc: "Para experimentar sem compromisso.",
    destaque: false,
    ribbon: null,
    fs: ["3 orçamentos por mês", "PDF profissional", "Gestão de clientes", "Dashboard de métricas"],
    contra: ["PDF inclui watermark"],
    cta: "Começar grátis",
  },
  {
    id: "starter",
    n: "Starter",
    preco: "€11,99",
    per: "/mês",
    orcs: "15 orçamentos / mês",
    desc: "Para começar a trabalhar a sério.",
    destaque: false,
    ribbon: null,
    fs: ["15 orçamentos por mês", "PDF sem watermark", "Gestão de clientes", "Suporte por email", "Reset mensal automático"],
    contra: [],
    cta: "Subscrever Starter",
  },
  {
    id: "pro",
    n: "Pro",
    preco: "€17,99",
    per: "/mês",
    orcs: "Orçamentos ilimitados",
    desc: "Para negócios em crescimento sem limites.",
    destaque: true,
    ribbon: "MAIS POPULAR",
    fs: ["Sem limite de orçamentos", "PDF sem watermark", "Suporte prioritário", "Funcionalidades primeiro"],
    contra: [],
    cta: "Subscrever Pro",
  },
];

const FAQS = [
  { q: "O que é a watermark no plano gratuito?",       a: "No plano gratuito, os PDFs incluem um rodapé \"Gerado por OrcamentosPME\". Qualquer plano pago remove essa marca — o PDF fica só com o teu nome." },
  { q: "O que acontece quando atinjo o limite mensal?", a: "Quando usas os orçamentos do mês, o sistema bloqueia a criação de novos até ao início do mês seguinte. Podes fazer upgrade imediato para continuar sem interrupção." },
  { q: "Os planos renovam automaticamente?",            a: "Sim. O Starter e o Pro são subscrições mensais — renovam no mesmo dia de cada mês. Cancelas quando quiseres e o acesso mantém-se até ao fim do período pago." },
  { q: "Como funciona o pagamento?",                    a: "MB WAY ou referência Multibanco via EuPago, supervisionada pelo Banco de Portugal. Activação automática após confirmação do pagamento." },
  { q: "Preciso de instalar alguma coisa?",             a: "Não. 100% no browser — Chrome, Safari, Firefox. Telemóvel, tablet ou computador. Sem instalações, sem actualizações manuais." },
  { q: "Os meus dados ficam seguros?",                  a: "Sim. Autenticação JWT e isolamento total por conta. Nenhum outro utilizador do sistema vê os teus orçamentos ou clientes." },
];

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================
export default function LandingPage() {
  const nav = useNavigate();

  return (
    <div style={{ background: "#050508", color: "#f0f0f0", fontFamily: "'DM Sans',sans-serif", minHeight: "100vh", overflowX: "hidden" }}>

      {/* ── NAV ────────────────────────────────────────── */}
      {/*
        PROBLEMA MOBILE CORRIGIDO:
        - padding reduzido: "0 1.25rem" em vez de "0 2rem"
        - botão "Entrar" escondido em mobile via CSS (.lp-nav-login)
        - overflow: hidden no nav para garantir que nada sai fora
      */}
      <nav style={{ position: "sticky", top: 0, zIndex: 100, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 1.25rem", height: 58, background: "rgba(5,5,8,.97)", borderBottom: "1px solid rgba(255,255,255,.07)", backdropFilter: "blur(14px)", overflow: "hidden" }}>
        <span className="lp-nav-logo" style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 17, color: "#fff", whiteSpace: "nowrap" }}>
          Orçamentos<GradText>PME</GradText>
        </span>
        <div className="lp-nav-inner" style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
          <button
            className="lp-nav-login"
            onClick={() => nav("/login")}
            style={{ background: "none", border: "none", color: "#9ca3af", fontSize: 13, cursor: "pointer", padding: "8px 12px", fontFamily: "inherit" }}
          >
            Entrar
          </button>
          <button
            className="lp-btn-glow lp-nav-cta"
            onClick={() => nav("/register")}
            style={{ background: G, border: "none", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", padding: "9px 18px", borderRadius: 7, fontFamily: "inherit", whiteSpace: "nowrap", transition: "transform .2s, box-shadow .2s" }}
          >
            Começar grátis
          </button>
        </div>
      </nav>

      {/* ── HERO ───────────────────────────────────────── */}
      {/*
        PROBLEMA MOBILE CORRIGIDO:
        - glow: width usa min(700px, 90vw) em vez de 700px fixo
        - padding ajustado por media query (.lp-hero)
        - hero-actions: flex-direction via media query (.lp-hero-actions)
      */}
      <section className="lp-hero" style={{ position: "relative", textAlign: "center", padding: "6rem 1.5rem 4.5rem", overflow: "hidden" }}>
        {/* Glow decorativo */}
        <div style={{ position: "absolute", top: -180, left: "50%", transform: "translateX(-50%)", width: "min(700px, 90vw)", height: 600, borderRadius: "50%", background: "radial-gradient(circle,rgba(168,85,247,.09) 0%,rgba(236,72,153,.04) 50%,transparent 70%)", pointerEvents: "none", animation: "glowPulse 6s ease-in-out infinite" }} />

        {/* Badge */}
        <div className="lp-f1" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(168,85,247,.08)", border: "1px solid rgba(168,85,247,.2)", color: "#c084fc", fontSize: 12, fontWeight: 500, padding: "6px 16px", borderRadius: 100, marginBottom: "1.75rem" }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#a855f7", animation: "blinkDot 2s infinite", display: "inline-block", flexShrink: 0 }} />
          Sistema de orçamentos para PMEs portuguesas
        </div>

        {/* Título */}
        <h1 className="lp-f2 lp-hero-h1" style={{ fontFamily: "'Syne',sans-serif", fontSize: "clamp(2.8rem,7vw,5rem)", fontWeight: 800, lineHeight: 1.03, letterSpacing: -3, color: "#fff", marginBottom: "1.25rem", position: "relative" }}>
          Chega de Word.<br />Chega de Excel.<br /><GradText>PDFs em 2 minutos.</GradText>
        </h1>

        {/* Subtítulo */}
        <p className="lp-f3 lp-hero-sub" style={{ fontSize: "clamp(0.95rem,2.5vw,1.1rem)", color: "#6b7280", lineHeight: 1.8, marginBottom: "2rem", maxWidth: 500, margin: "0 auto 2rem" }}>
          Sem cálculos manuais. Sem formatação.<br />
          O teu cliente recebe um orçamento profissional direto do telemóvel.
        </p>

        {/* CTAs */}
        <div className="lp-f4 lp-hero-actions" style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap", marginBottom: "1.75rem" }}>
          <button
            className="lp-btn-glow"
            onClick={() => nav("/register")}
            style={{ background: G, border: "none", color: "#fff", fontWeight: 700, fontSize: 15, padding: "14px 30px", borderRadius: 8, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 0 32px rgba(168,85,247,.25)", transition: "transform .2s, box-shadow .2s" }}
          >
            Criar conta gratuita →
          </button>
          <button
            className="lp-btn-ghost"
            onClick={() => nav("/login")}
            style={{ background: "transparent", border: "1px solid rgba(255,255,255,.14)", color: "#d1d5db", fontSize: 14, padding: "14px 24px", borderRadius: 8, cursor: "pointer", fontFamily: "inherit", transition: "border-color .2s" }}
          >
            Já tenho conta
          </button>
        </div>

        {/* Mini prova */}
        <div className="lp-f5" style={{ display: "flex", gap: "1.5rem", justifyContent: "center", flexWrap: "wrap" }}>
          {["Sem cartão de crédito", "3 orçamentos grátis", "Acesso imediato"].map(t => (
            <span key={t} style={{ fontSize: 12, color: "#4b5563", display: "flex", alignItems: "center", gap: 5 }}>
              <GradText>✓</GradText> {t}
            </span>
          ))}
        </div>
      </section>

      {/* ── PROVA SOCIAL ───────────────────────────────── */}
      {/*
        PROBLEMA MOBILE CORRIGIDO:
        - gap reduzido, items com flex: 1 1 50% para 2 colunas em mobile
        - padding horizontal reduzido
      */}
      <div className="lp-proof-bar" style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "1rem", padding: "1.75rem 1rem", background: "#08080b", borderTop: "1px solid rgba(255,255,255,.05)", borderBottom: "1px solid rgba(255,255,255,.05)" }}>
        {[["2 min", "por orçamento"], ["100%", "online, sem instalar"], ["IVA", "automático"], ["PDF", "profissional"]].map(([val, label]) => (
          <div key={label} className="lp-proof-item" style={{ textAlign: "center", flex: "1 1 120px", padding: "0.5rem" }}>
            <div style={{ fontFamily: "'Syne',sans-serif", fontSize: "1.5rem", fontWeight: 800, background: G, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{val}</div>
            <div style={{ fontSize: 11, color: "#555", marginTop: 3 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* ── PARA QUEM ──────────────────────────────────── */}
      <div className="lp-para-quem" style={{ display: "flex", justifyContent: "center", gap: "1.25rem", flexWrap: "wrap", padding: "0.9rem 1.5rem", borderBottom: "1px solid rgba(255,255,255,.04)" }}>
        {["Salões de beleza", "Barbearias", "Clínicas", "Consultores", "Spas", "Empresas de obras"].map(t => (
          <span key={t} style={{ fontSize: 12, color: "#333", fontWeight: 500 }}>{t}</span>
        ))}
      </div>

      <HR />

      {/* ── FEATURES ───────────────────────────────────── */}
      <section className="lp-section" style={{ maxWidth: 1060, margin: "0 auto", padding: "4.5rem 1.5rem" }}>
        <Tag>Funcionalidades</Tag>
        <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: "clamp(1.8rem,3.5vw,2.5rem)", fontWeight: 800, letterSpacing: -1, color: "#fff", marginBottom: "0.5rem", lineHeight: 1.1 }}>
          Tudo o que precisas<br /><GradText>para fechar negócio</GradText>
        </h2>
        <p style={{ color: "#6b7280", fontSize: 14, marginBottom: "2.5rem", lineHeight: 1.7, maxWidth: 480 }}>
          Para PMEs que emitem orçamentos de serviços, tratamentos ou obras.
        </p>

        {/*
          FEAT GRID — responsivo via classe CSS:
          mobile: 1 col | tablet: 2 col | desktop: 3 col
        */}
        <div className="lp-feat-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 1, background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.05)", borderRadius: 14, overflow: "hidden" }}>
          {FEATS.map(f => (
            <div key={f.t} className="lp-feat-card" style={{ background: "#0a0a0f", padding: "1.75rem 1.5rem", transition: "background .15s" }}>
              <div style={{ fontSize: 22, marginBottom: 10 }}>{f.e}</div>
              <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 6 }}>{f.t}</div>
              <div style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.65 }}>{f.d}</div>
            </div>
          ))}
        </div>
      </section>

      <HR />

      {/* ── PLANOS ─────────────────────────────────────── */}
      {/*
        PROBLEMA MOBILE CORRIGIDO:
        - Era repeat(4,1fr) fixo → agora repeat(3,1fr) no desktop
        - Media queries controlam: mobile=1col, tablet=1col ou 2col
        - 3 planos em vez de 4 (removido "Ilimitado" pack)
        - Preços actualizados: Starter €11,99/mês, Pro €17,99/mês
      */}
      <section className="lp-section" style={{ maxWidth: 1060, margin: "0 auto", padding: "4.5rem 1.5rem" }}>
        <Tag>Planos & Preços</Tag>
        <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: "clamp(1.8rem,3.5vw,2.5rem)", fontWeight: 800, letterSpacing: -1, color: "#fff", marginBottom: "0.5rem", lineHeight: 1.1 }}>
          Escolhe o teu plano
        </h2>
        <p style={{ color: "#6b7280", fontSize: 14, marginBottom: "2.5rem", lineHeight: 1.7 }}>
          Subscrição mensal. Sem contratos. MB WAY ou Multibanco. Activação imediata.
        </p>

        <div className="lp-plans-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
          {PLANS.map(p => (
            <div
              key={p.id}
              className="lp-plan-card"
              style={{
                background: p.destaque ? "#0f0a1a" : "#0d0d12",
                border: p.destaque ? "1px solid rgba(168,85,247,.45)" : "1px solid rgba(255,255,255,.07)",
                borderRadius: 14,
                padding: "1.6rem 1.35rem",
                position: "relative",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                transition: "transform .2s",
              }}
            >
              {/* Ribbon */}
              {p.ribbon && (
                <div style={{ position: "absolute", top: 13, right: -26, background: G, color: "#fff", fontSize: 9, fontWeight: 800, padding: "3px 36px", transform: "rotate(45deg)", letterSpacing: ".06em" }}>
                  {p.ribbon}
                </div>
              )}

              {/* Nome */}
              <div style={{ fontSize: 10, fontWeight: 700, color: "#555", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 8 }}>{p.n}</div>

              {/* Preço */}
              <div style={{ fontFamily: "'Syne',sans-serif", fontSize: "1.9rem", fontWeight: 800, color: "#fff", lineHeight: 1, marginBottom: 2 }}>
                {p.preco}
                {p.per && <span style={{ fontSize: 13, color: "#444", fontWeight: 400 }}>{p.per}</span>}
              </div>

              {/* Orçamentos */}
              <div style={{ fontSize: 12, fontWeight: 700, background: G, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", margin: "7px 0" }}>{p.orcs}</div>

              {/* Descrição */}
              <p style={{ fontSize: 12, color: "#555", lineHeight: 1.55, marginBottom: 14, flex: 1 }}>{p.desc}</p>

              {/* Features */}
              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 6px", display: "flex", flexDirection: "column", gap: 5 }}>
                {p.fs.map(f => (
                  <li key={f} style={{ fontSize: 11, color: "#888", display: "flex", gap: 7, alignItems: "flex-start", lineHeight: 1.4 }}>
                    <GradText>✓</GradText>{f}
                  </li>
                ))}
                {p.contra.map(f => (
                  <li key={f} style={{ fontSize: 11, color: "#3a3a3a", display: "flex", gap: 7, alignItems: "flex-start", lineHeight: 1.4 }}>
                    <span>✗</span>{f}
                  </li>
                ))}
              </ul>

              {/* Botão */}
              <div style={{ marginTop: "auto", paddingTop: 14 }}>
                <button
                  onClick={() => nav(p.id === "free" ? "/register" : "/register")}
                  style={{
                    padding: "11px 0",
                    background: p.destaque ? G : "rgba(255,255,255,.05)",
                    border: p.destaque ? "none" : "1px solid rgba(255,255,255,.1)",
                    borderRadius: 8,
                    color: p.destaque ? "#fff" : "#ccc",
                    fontWeight: 600,
                    fontSize: 13,
                    cursor: "pointer",
                    width: "100%",
                    fontFamily: "inherit",
                  }}
                >
                  {p.cta}
                </button>
                {p.id !== "free" && (
                  <p style={{ fontSize: 10, color: "#333", textAlign: "center", marginTop: 7 }}>Cancela a qualquer momento</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Nota watermark */}
        <div style={{ marginTop: "1.5rem", textAlign: "center" }}>
          <span style={{ display: "inline-block", fontSize: 11, color: "#CA8A04", background: "rgba(234,179,8,.07)", border: "1px solid rgba(234,179,8,.18)", padding: "6px 14px", borderRadius: 6 }}>
            ⚠ No plano gratuito, os PDFs incluem "Gerado por OrcamentosPME" como rodapé. Remove com qualquer plano pago.
          </span>
        </div>
      </section>

      <HR />

      {/* ── FAQ ────────────────────────────────────────── */}
      <section className="lp-section" style={{ maxWidth: 1060, margin: "0 auto", padding: "4.5rem 1.5rem" }}>
        <Tag>Dúvidas Frequentes</Tag>
        <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: "clamp(1.8rem,3.5vw,2.5rem)", fontWeight: 800, letterSpacing: -1, color: "#fff", marginBottom: "0.5rem", lineHeight: 1.1 }}>
          Respostas <GradText>rápidas</GradText>
        </h2>
        <div style={{ border: "1px solid rgba(255,255,255,.07)", borderRadius: 14, overflow: "hidden", marginTop: 28 }}>
          {FAQS.map((f, i) => <FaqItem key={i} q={f.q} a={f.a} />)}
        </div>
      </section>

      {/* ── CTA FINAL ──────────────────────────────────── */}
      <section style={{ position: "relative", textAlign: "center", padding: "5rem 1.5rem", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: "min(600px, 90vw)", height: 350, background: "radial-gradient(ellipse,rgba(168,85,247,.09) 0%,transparent 70%)", pointerEvents: "none" }} />
        <Tag center>Começa hoje</Tag>
        <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: "clamp(1.8rem,4vw,2.6rem)", fontWeight: 800, letterSpacing: -1, color: "#fff", marginBottom: "0.75rem", position: "relative", lineHeight: 1.1 }}>
          Pronto para <GradText>profissionalizar</GradText><br />os teus orçamentos?
        </h2>
        <p style={{ color: "#6b7280", fontSize: 14, lineHeight: 1.75, marginBottom: "2rem", position: "relative" }}>
          Cria a tua conta e emite o primeiro PDF em menos de 5 minutos.<br />
          Sem cartão · 3 orçamentos grátis · Acesso imediato
        </p>
        <button
          className="lp-btn-glow"
          onClick={() => nav("/register")}
          style={{ background: G, border: "none", color: "#fff", fontWeight: 700, fontSize: 14, padding: "14px 32px", borderRadius: 8, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 0 36px rgba(168,85,247,.3)", transition: "transform .2s, box-shadow .2s", position: "relative" }}
        >
          Criar conta gratuita →
        </button>
      </section>

      {/* ── FOOTER ─────────────────────────────────────── */}
      <footer className="lp-footer" style={{ borderTop: "1px solid rgba(255,255,255,.06)", padding: "1.5rem 1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
        <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 14, color: "#fff" }}>Orçamentos<GradText>PME</GradText></span>
        <span style={{ fontSize: 12, color: "#333" }}>by Albiclick · contacto@albiclick.com</span>
        <span style={{ fontSize: 12, color: "#333" }}>© 2026</span>
      </footer>

    </div>
  );
}
