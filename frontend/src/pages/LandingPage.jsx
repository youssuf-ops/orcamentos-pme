// ============================================================
// frontend/src/pages/LandingPage.jsx
// Design: roxo/rosa/laranja — consistente com Pricing.jsx
// Hero com mockups de telemóvel a mostrar screenshots reais
// ============================================================

import { useState } from "react";
import { useNavigate } from "react-router-dom";

// ── Injectar fonte e animações ────────────────────────────
const _font = document.createElement("link");
_font.rel = "stylesheet";
_font.href = "https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap";
document.head.appendChild(_font);

const _style = document.createElement("style");
_style.textContent = `
  @keyframes fadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
  @keyframes floatA { 0%,100%{transform:translateY(-50%) rotate(-4deg)} 50%{transform:translateY(calc(-50% - 14px)) rotate(-4deg)} }
  @keyframes floatB { 0%,100%{transform:translateY(-50%) rotate(4deg)} 50%{transform:translateY(calc(-50% - 10px)) rotate(4deg)} }
  @keyframes glowAnim { 0%,100%{opacity:.4} 50%{opacity:.85} }
  @keyframes blink { 0%,100%{opacity:1} 50%{opacity:.3} }
  .f1{animation:fadeUp .7s .05s ease both}
  .f2{animation:fadeUp .7s .2s ease both}
  .f3{animation:fadeUp .7s .35s ease both}
  .f4{animation:fadeUp .7s .5s ease both}
  .f5{animation:fadeUp .7s .65s ease both}
  .mock-a{position:absolute;left:5%;top:50%;animation:floatA 5s ease-in-out infinite;z-index:2}
  .mock-b{position:absolute;right:5%;top:50%;animation:floatB 6s 1s ease-in-out infinite;z-index:1}
  .land-primary:hover{transform:translateY(-2px);box-shadow:0 0 52px rgba(168,85,247,.5)!important}
  .land-sec:hover{border-color:#555!important}
  .feat-c:hover{background:#0d0d12!important}
  .plano-c:hover{transform:translateY(-4px);border-color:rgba(168,85,247,.4)!important}
  .faq-b:hover{background:#0d0d12!important}
  @media(max-width:768px){
    .hero-layout{flex-direction:column!important}
    .hero-right{display:none!important}
    .feat-grid-3{grid-template-columns:1fr!important}
  }
`;
document.head.appendChild(_style);

const GRAD = "linear-gradient(135deg,#a855f7,#ec4899,#f97316)";

const FEATURES = [
  { icon:"📄", t:"PDF em 1 clique", d:"Orçamento com o teu nome, serviços e IVA. Pronto a enviar por WhatsApp ou email." },
  { icon:"👥", t:"Base de clientes", d:"Cria e gere os teus clientes. Histórico completo de orçamentos por cliente." },
  { icon:"📊", t:"Dashboard em tempo real", d:"Aprovados, pendentes e valor em aberto. Sabes sempre o estado do negócio." },
  { icon:"🔐", t:"Dados isolados", d:"Autenticação JWT. A tua conta é privada — nenhum outro utilizador vê os teus dados." },
  { icon:"⚡", t:"2 minutos por orçamento", d:"Do zero ao PDF em menos de 2 minutos. Funciona em telemóvel, tablet e PC." },
  { icon:"🧮", t:"IVA automático", d:"O sistema calcula subtotal, IVA e total sem erros. Zero cálculos manuais." },
];

const PLANOS = [
  { id:"free",     nome:"Gratuito",     preco:"€0",  per:"",            orcs:"3 orçamentos",         desc:"Para experimentar.",          destaque:false, feats:["3 orçamentos","PDF profissional","Gestão de clientes","Dashboard"] },
  { id:"starter",  nome:"Pack Starter", preco:"€20", per:"compra única", orcs:"20 orçamentos",        desc:"Para começar a sério.",        destaque:false, feats:["20 orçamentos","Não expira","PDF profissional","Suporte email"] },
  { id:"pro",      nome:"Pack Pro",     preco:"€45", per:"compra única", orcs:"60 orçamentos",        desc:"Para negócios em crescimento.", destaque:true,  feats:["60 orçamentos","Não expira","PDF profissional","Suporte prioritário"] },
  { id:"ilimitado",nome:"Ilimitado",    preco:"€19", per:"/mês",         orcs:"Orçamentos ilimitados", desc:"Para quem emite muito.",       destaque:false, feats:["Sem limite","Renovação mensal","Suporte prioritário","Funcionalidades primeiro"] },
];

const FAQ = [
  { q:"Os meus dados ficam seguros?",       a:"Sim. JWT e isolamento total — nenhum utilizador vê os teus orçamentos ou clientes." },
  { q:"Os packs expiram?",                  a:"Starter (20) e Pro (60) não expiram. Usas ao teu ritmo. O plano Ilimitado é mensal." },
  { q:"Como funciona o pagamento?",         a:"MB WAY ou Multibanco via EuPago, supervisionada pelo Banco de Portugal. Ativação imediata." },
  { q:"Posso cancelar quando quiser?",      a:"Sim. Sem contratos mínimos. Os packs são compra única — pagas uma vez, usas sem prazo." },
  { q:"Preciso de instalar alguma coisa?",  a:"Não. 100% no browser — Chrome, Safari, Firefox. Telemóvel, tablet ou computador." },
];

// ── Helpers ───────────────────────────────────────────────
function GradText({ children }) {
  return <span style={{ background:GRAD, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>{children}</span>;
}

function SectionTag({ children }) {
  return <span style={{ fontSize:11, fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", background:GRAD, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", display:"block", marginBottom:10 }}>{children}</span>;
}

function PhoneMock({ img }) {
  return (
    <div style={{ width:200, height:400, borderRadius:30, border:"2px solid rgba(168,85,247,.25)", background:"#0a0a0f", boxShadow:"0 28px 70px rgba(0,0,0,.75), 0 0 0 1px rgba(255,255,255,.04)", overflow:"hidden", position:"relative" }}>
      <div style={{ position:"absolute", top:10, left:"50%", transform:"translateX(-50%)", width:50, height:5, borderRadius:3, background:"rgba(255,255,255,.1)", zIndex:2 }} />
      <img src={img} alt="App" style={{ width:"100%", height:"100%", objectFit:"cover", objectPosition:"top", borderRadius:28 }} />
      <div style={{ position:"absolute", bottom:0, left:0, right:0, height:60, background:"linear-gradient(transparent,rgba(10,10,15,.9))" }} />
    </div>
  );
}

function FaqList({ items }) {
  const [open, setOpen] = useState(null);
  return (
    <div style={{ border:"1px solid rgba(255,255,255,.07)", borderRadius:14, overflow:"hidden", marginTop:32 }}>
      {items.map((item, i) => (
        <div key={i} style={{ borderBottom: i < items.length-1 ? "1px solid rgba(255,255,255,.07)" : "none" }}>
          <button className="faq-b" onClick={() => setOpen(open===i?null:i)} style={{ width:"100%", background:"#0a0a0f", border:"none", color:"#e5e7eb", fontFamily:"'DM Sans',sans-serif", fontSize:13, fontWeight:500, padding:"16px 22px", textAlign:"left", cursor:"pointer", display:"flex", justifyContent:"space-between", alignItems:"center", gap:16 }}>
            <span>{item.q}</span>
            <span style={{ background:GRAD, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", fontSize:20, transform:open===i?"rotate(45deg)":"rotate(0deg)", transition:"transform .25s", flexShrink:0, display:"inline-block", lineHeight:1 }}>+</span>
          </button>
          {open===i && <div style={{ background:"#0a0a0f", padding:"0 22px 16px", fontSize:12, color:"#6b7280", lineHeight:1.75 }}>{item.a}</div>}
        </div>
      ))}
    </div>
  );
}

// ── Componente principal ──────────────────────────────────
export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div style={{ background:"#050508", color:"#f0f0f0", fontFamily:"'DM Sans',sans-serif", minHeight:"100vh", overflowX:"hidden" }}>

      {/* NAV */}
      <nav style={{ position:"sticky", top:0, zIndex:50, display:"flex", justifyContent:"space-between", alignItems:"center", padding:"0 2rem", height:60, background:"rgba(5,5,8,.97)", borderBottom:"1px solid rgba(255,255,255,.07)", backdropFilter:"blur(12px)" }}>
        <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:17, color:"#fff" }}>Orçamentos<GradText>PME</GradText></span>
        <div style={{ display:"flex", gap:10, alignItems:"center" }}>
          <button onClick={() => navigate("/login")} style={{ background:"none", border:"none", color:"#9ca3af", fontSize:13, cursor:"pointer", padding:"8px 14px", fontFamily:"'DM Sans',sans-serif" }}>Entrar</button>
          <button onClick={() => navigate("/register")} style={{ background:GRAD, border:"none", color:"#fff", fontSize:13, fontWeight:700, cursor:"pointer", padding:"8px 18px", borderRadius:6, fontFamily:"'DM Sans',sans-serif" }}>Começar grátis</button>
        </div>
      </nav>

      {/* HERO */}
      <div style={{ maxWidth:1100, margin:"0 auto", padding:"0 2rem" }}>
        <div className="hero-layout" style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:"3rem", minHeight:"90vh", position:"relative" }}>

          {/* Glow */}
          <div style={{ position:"absolute", top:-200, left:"15%", width:600, height:600, borderRadius:"50%", background:"radial-gradient(circle,rgba(168,85,247,.1) 0%,rgba(236,72,153,.05) 50%,transparent 70%)", pointerEvents:"none", animation:"glowAnim 6s ease-in-out infinite" }} />

          {/* Texto esquerda */}
          <div style={{ flex:1, maxWidth:520, position:"relative" }}>
            <div className="f1" style={{ display:"inline-flex", alignItems:"center", gap:8, background:"rgba(168,85,247,.08)", border:"1px solid rgba(168,85,247,.2)", color:"#c084fc", fontSize:12, fontWeight:500, padding:"6px 16px", borderRadius:100, marginBottom:"1.5rem" }}>
              <span style={{ width:6, height:6, borderRadius:"50%", background:"#a855f7", animation:"blink 2s infinite", flexShrink:0, display:"inline-block" }} />
              Sistema de orçamentos para PMEs portuguesas
            </div>

            <h1 className="f2" style={{ fontFamily:"'Syne',sans-serif", fontSize:"clamp(2.6rem,5vw,4rem)", fontWeight:800, lineHeight:1.05, letterSpacing:-2, marginBottom:"1.5rem", color:"#fff" }}>
              Orçamentos<br />profissionais<br /><GradText>em 2 minutos</GradText>
            </h1>

            <p className="f3" style={{ fontSize:15, color:"#6b7280", lineHeight:1.75, marginBottom:"2rem" }}>
              Sem Word. Sem Excel. Sem cálculos manuais.<br />
              O teu cliente recebe um PDF com o teu nome — direto do telemóvel.
            </p>

            <div className="f4" style={{ display:"flex", gap:12, flexWrap:"wrap", marginBottom:"1.5rem" }}>
              <button className="land-primary" onClick={() => navigate("/register")} style={{ background:GRAD, border:"none", color:"#fff", fontWeight:700, fontSize:14, padding:"14px 28px", borderRadius:8, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", boxShadow:"0 0 32px rgba(168,85,247,.25)", transition:"transform .2s, box-shadow .2s" }}>
                Criar conta gratuita →
              </button>
              <button className="land-sec" onClick={() => navigate("/login")} style={{ background:"transparent", border:"1px solid rgba(255,255,255,.12)", color:"#d1d5db", fontWeight:500, fontSize:14, padding:"14px 28px", borderRadius:8, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", transition:"border-color .2s" }}>
                Já tenho conta
              </button>
            </div>

            <div className="f5" style={{ display:"flex", gap:"1.2rem", flexWrap:"wrap" }}>
              {["Sem cartão","3 orçamentos grátis","Acesso imediato"].map(t => (
                <span key={t} style={{ fontSize:12, color:"#4b5563" }}><GradText>✓</GradText> {t}</span>
              ))}
            </div>
          </div>

          {/* Mockups direita */}
          <div className="hero-right" style={{ flex:1, position:"relative", height:500 }}>
            <div className="mock-a"><PhoneMock img="/dashboardin.png" /></div>
            <div className="mock-b"><PhoneMock img="/orcamentoin.png" /></div>
          </div>

        </div>
      </div>

      {/* PARA QUEM */}
      <div style={{ display:"flex", justifyContent:"center", gap:"1.5rem", flexWrap:"wrap", padding:"1.2rem 2rem", background:"#08080b", borderTop:"1px solid rgba(255,255,255,.05)", borderBottom:"1px solid rgba(255,255,255,.05)" }}>
        {["Salões de beleza","Barbearias","Clínicas","Consultores","Spas","Empresas de serviços","Obras"].map(t => (
          <span key={t} style={{ fontSize:12, color:"#374151", fontWeight:500 }}>{t}</span>
        ))}
      </div>

      <hr style={{ border:"none", borderTop:"1px solid rgba(255,255,255,.06)" }} />

      {/* FEATURES */}
      <section style={{ maxWidth:1060, margin:"0 auto", padding:"5rem 1.5rem" }}>
        <SectionTag>Funcionalidades</SectionTag>
        <h2 style={{ fontFamily:"'Syne',sans-serif", fontSize:"clamp(1.8rem,3.5vw,2.6rem)", fontWeight:800, letterSpacing:-1, lineHeight:1.1, color:"#fff", marginBottom:"0.75rem" }}>
          Tudo o que precisas<br /><GradText>para fechar negócio</GradText>
        </h2>
        <p style={{ color:"#6b7280", fontSize:14, lineHeight:1.7, marginBottom:"2.5rem" }}>Desenvolvido para PMEs que emitem orçamentos para serviços, tratamentos ou obras.</p>
        <div className="feat-grid-3" style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:1, background:"rgba(255,255,255,.05)", border:"1px solid rgba(255,255,255,.05)", borderRadius:14, overflow:"hidden" }}>
          {FEATURES.map(f => (
            <div key={f.t} className="feat-c" style={{ background:"#0a0a0f", padding:"1.75rem", transition:"background .2s" }}>
              <div style={{ fontSize:26, marginBottom:10 }}>{f.icon}</div>
              <div style={{ fontFamily:"'Syne',sans-serif", fontSize:14, fontWeight:700, color:"#fff", marginBottom:6 }}>{f.t}</div>
              <div style={{ fontSize:12, color:"#6b7280", lineHeight:1.65 }}>{f.d}</div>
            </div>
          ))}
        </div>
      </section>

      <hr style={{ border:"none", borderTop:"1px solid rgba(255,255,255,.06)" }} />

      {/* PLANOS */}
      <section style={{ maxWidth:1060, margin:"0 auto", padding:"5rem 1.5rem" }}>
        <SectionTag>Planos & Preços</SectionTag>
        <h2 style={{ fontFamily:"'Syne',sans-serif", fontSize:"clamp(1.8rem,3.5vw,2.6rem)", fontWeight:800, letterSpacing:-1, lineHeight:1.1, color:"#fff", marginBottom:"0.75rem" }}>Escolhe o teu plano</h2>
        <p style={{ color:"#6b7280", fontSize:14, lineHeight:1.7, marginBottom:"2.5rem" }}>Sem contratos. Pagamento por MB WAY ou Multibanco. Ativação imediata.</p>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))", gap:14 }}>
          {PLANOS.map(p => (
            <div key={p.id} className="plano-c" style={{ background: p.destaque?"#0f0a1a":"#0d0d12", border: p.destaque?"1px solid rgba(168,85,247,.45)":"1px solid rgba(255,255,255,.07)", borderRadius:14, padding:"1.75rem 1.25rem", position:"relative", overflow:"hidden", display:"flex", flexDirection:"column", transition:"transform .2s, border-color .2s" }}>
              {p.destaque && <div style={{ position:"absolute", top:14, right:-26, background:GRAD, color:"#fff", fontSize:9, fontWeight:800, padding:"3px 38px", transform:"rotate(45deg)", letterSpacing:"0.06em" }}>MELHOR VALOR</div>}
              <div style={{ fontSize:10, fontWeight:700, color:"#6b7280", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:8 }}>{p.nome}</div>
              <div style={{ fontFamily:"'Syne',sans-serif", fontSize:"2rem", fontWeight:800, color:"#fff", lineHeight:1, marginBottom:2 }}>
                {p.preco}{p.per && <span style={{ fontSize:12, color:"#4b5563", fontWeight:400 }}> {p.per}</span>}
              </div>
              <div style={{ fontSize:12, fontWeight:700, background:GRAD, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", margin:"6px 0" }}>{p.orcs}</div>
              <p style={{ fontSize:12, color:"#6b7280", lineHeight:1.6, marginBottom:16, flex:1 }}>{p.desc}</p>
              <ul style={{ listStyle:"none", padding:0, margin:"0 0 20px", display:"flex", flexDirection:"column", gap:6 }}>
                {p.feats.map(f => (
                  <li key={f} style={{ fontSize:12, color:"#9ca3af", display:"flex", gap:8, alignItems:"flex-start" }}>
                    <GradText>✓</GradText> {f}
                  </li>
                ))}
              </ul>
              <button onClick={() => navigate("/register")} style={{ padding:"11px 0", background: p.destaque?GRAD:"rgba(255,255,255,.05)", border: p.destaque?"none":"1px solid rgba(255,255,255,.1)", borderRadius:8, color: p.destaque?"#fff":"#e5e7eb", fontWeight:600, fontSize:13, cursor:"pointer", width:"100%", fontFamily:"'DM Sans',sans-serif" }}>
                {p.id==="free"?"Começar grátis":p.id==="ilimitado"?"Subscrever":"Comprar Agora"}
              </button>
            </div>
          ))}
        </div>
      </section>

      <hr style={{ border:"none", borderTop:"1px solid rgba(255,255,255,.06)" }} />

      {/* FAQ */}
      <section style={{ maxWidth:1060, margin:"0 auto", padding:"5rem 1.5rem" }}>
        <SectionTag>Dúvidas Frequentes</SectionTag>
        <h2 style={{ fontFamily:"'Syne',sans-serif", fontSize:"clamp(1.8rem,3.5vw,2.6rem)", fontWeight:800, letterSpacing:-1, lineHeight:1.1, color:"#fff", marginBottom:"0.75rem" }}>
          Respostas <GradText>rápidas</GradText>
        </h2>
        <FaqList items={FAQ} />
      </section>

      {/* CTA */}
      <section style={{ position:"relative", textAlign:"center", padding:"6rem 1.5rem", overflow:"hidden" }}>
        <div style={{ position:"absolute", top:0, left:"50%", transform:"translateX(-50%)", width:600, height:400, background:"radial-gradient(ellipse,rgba(168,85,247,.1) 0%,transparent 70%)", pointerEvents:"none" }} />
        <SectionTag>Começa hoje</SectionTag>
        <h2 style={{ fontFamily:"'Syne',sans-serif", fontSize:"clamp(1.8rem,3.5vw,2.6rem)", fontWeight:800, letterSpacing:-1, lineHeight:1.1, color:"#fff", marginBottom:"0.75rem", position:"relative" }}>
          Pronto para <GradText>profissionalizar</GradText><br />os teus orçamentos?
        </h2>
        <p style={{ color:"#6b7280", fontSize:14, lineHeight:1.7, marginBottom:"2rem", position:"relative" }}>
          Cria a tua conta e emite o primeiro PDF em menos de 5 minutos.<br />
          Sem cartão · 3 orçamentos grátis · Acesso imediato
        </p>
        <button className="land-primary" onClick={() => navigate("/register")} style={{ background:GRAD, border:"none", color:"#fff", fontWeight:700, fontSize:14, padding:"14px 32px", borderRadius:8, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", boxShadow:"0 0 40px rgba(168,85,247,.3)", transition:"transform .2s, box-shadow .2s", position:"relative" }}>
          Criar conta gratuita →
        </button>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop:"1px solid rgba(255,255,255,.06)", padding:"1.5rem 2rem", display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:12 }}>
        <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:14, color:"#fff" }}>Orçamentos<GradText>PME</GradText></span>
        <span style={{ fontSize:12, color:"#374151" }}>by Albiclick · contacto@albiclick.com</span>
        <span style={{ fontSize:12, color:"#374151" }}>© 2026</span>
      </footer>

    </div>
  );
}
