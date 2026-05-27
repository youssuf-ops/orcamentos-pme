// frontend/src/pages/LandingPage.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const _font = document.createElement("link");
_font.rel = "stylesheet";
_font.href = "https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap";
document.head.appendChild(_font);

const _style = document.createElement("style");
_style.textContent = `
  @keyframes fadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
  @keyframes floatA{0%,100%{transform:translateY(0) rotate(-3deg)}50%{transform:translateY(-12px) rotate(-3deg)}}
  @keyframes floatB{0%,100%{transform:translateY(0) rotate(3deg)}50%{transform:translateY(-8px) rotate(3deg)}}
  @keyframes glowP{0%,100%{opacity:.4}50%{opacity:.8}}
  @keyframes blinkD{0%,100%{opacity:1}50%{opacity:.3}}
  .f1{animation:fadeUp .65s .05s ease both}
  .f2{animation:fadeUp .65s .18s ease both}
  .f3{animation:fadeUp .65s .3s ease both}
  .f4{animation:fadeUp .65s .42s ease both}
  .f5{animation:fadeUp .65s .54s ease both}
  .mock-float-a{animation:floatA 5s ease-in-out infinite}
  .mock-float-b{animation:floatB 6s 1s ease-in-out infinite}
  .btn-glow:hover{transform:translateY(-2px);box-shadow:0 0 48px rgba(168,85,247,.55)!important}
  .btn-ghost:hover{border-color:#666!important}
  .feat-hover:hover{background:#0e0e14!important}
  .plan-hover:hover{transform:translateY(-3px);border-color:rgba(168,85,247,.5)!important}
  .faq-hover:hover{background:#0e0e14!important}
  @media(max-width:900px){
    .hero-wrap{flex-direction:column!important;min-height:auto!important;padding:4rem 1.5rem 2rem!important}
    .hero-phones{display:none!important}
    .feat-grid{grid-template-columns:1fr 1fr!important}
  }
  @media(max-width:600px){
    .feat-grid{grid-template-columns:1fr!important}
    .plans-grid{grid-template-columns:1fr 1fr!important}
  }
`;
document.head.appendChild(_style);

const G = "linear-gradient(135deg,#a855f7,#ec4899,#f97316)";

const GradText = ({ children }) => (
  <span style={{ background:G, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>
    {children}
  </span>
);

const Tag = ({ children }) => (
  <p style={{ fontSize:11, fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", background:G, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", marginBottom:12 }}>
    {children}
  </p>
);

const HR = () => <hr style={{ border:"none", borderTop:"1px solid rgba(255,255,255,.06)", margin:0 }} />;

function Phone({ img, rotate, delay }) {
  return (
    <div className={rotate < 0 ? "mock-float-a" : "mock-float-b"} style={{ animationDelay:`${delay}s` }}>
      <div style={{
        width:190, height:380, borderRadius:28,
        border:"2px solid rgba(168,85,247,.3)",
        background:"#0c0c14",
        boxShadow:"0 24px 60px rgba(0,0,0,.8), 0 0 0 1px rgba(255,255,255,.04)",
        overflow:"hidden", position:"relative",
        transform:`rotate(${rotate}deg)`,
      }}>
        <div style={{ position:"absolute", top:9, left:"50%", transform:"translateX(-50%)", width:44, height:5, borderRadius:3, background:"rgba(255,255,255,.1)", zIndex:3 }} />
        <img src={img} alt="app" style={{ width:"100%", height:"100%", objectFit:"cover", objectPosition:"top", display:"block" }} />
        <div style={{ position:"absolute", bottom:0, left:0, right:0, height:50, background:"linear-gradient(transparent,rgba(12,12,20,.95))" }} />
      </div>
    </div>
  );
}

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom:"1px solid rgba(255,255,255,.07)" }}>
      <button className="faq-hover" onClick={() => setOpen(!open)} style={{ width:"100%", background:"#0a0a0f", border:"none", color:"#e5e7eb", fontFamily:"'DM Sans',sans-serif", fontSize:13, fontWeight:500, padding:"16px 22px", textAlign:"left", cursor:"pointer", display:"flex", justifyContent:"space-between", alignItems:"center", gap:16, transition:"background .15s" }}>
        <span>{q}</span>
        <span style={{ background:G, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", fontSize:20, transform:open?"rotate(45deg)":"none", transition:"transform .25s", display:"inline-block", flexShrink:0, lineHeight:1 }}>+</span>
      </button>
      {open && <p style={{ background:"#0a0a0f", margin:0, padding:"0 22px 16px", fontSize:12, color:"#6b7280", lineHeight:1.8 }}>{a}</p>}
    </div>
  );
}

const FEATS = [
  { e:"📄", t:"PDF em 1 clique",          d:"Orçamento com o teu nome, serviços e IVA. Pronto a enviar por WhatsApp." },
  { e:"👥", t:"Base de clientes",          d:"Cria clientes e acede ao histórico completo de orçamentos em segundos." },
  { e:"📊", t:"Dashboard em tempo real",   d:"Aprovados, pendentes e valor em aberto. Sabes sempre o estado do negócio." },
  { e:"🔐", t:"Dados isolados",            d:"JWT em cada request. A tua conta é 100% privada — zero partilha de dados." },
  { e:"⚡", t:"2 minutos por orçamento",   d:"Do zero ao PDF em menos de 2 minutos. Funciona em qualquer dispositivo." },
  { e:"🧮", t:"IVA automático",            d:"Subtotal, IVA e total calculados sem erros. Zero cálculos manuais." },
];

const PLANS = [
  { id:"free",      n:"Gratuito",     p:"€0",  per:"",            o:"3 orçamentos",         d:"Para experimentar.",            h:false, fs:["3 orçamentos","PDF profissional","Gestão de clientes","Dashboard"] },
  { id:"starter",   n:"Pack Starter", p:"€20", per:"compra única", o:"20 orçamentos",        d:"Para começar a sério.",          h:false, fs:["20 orçamentos","Não expira","PDF profissional","Suporte email"] },
  { id:"pro",       n:"Pack Pro",     p:"€45", per:"compra única", o:"60 orçamentos",        d:"Para negócios em crescimento.",  h:true,  fs:["60 orçamentos","Não expira","PDF profissional","Suporte prioritário"] },
  { id:"ilimitado", n:"Ilimitado",    p:"€19", per:"/mês",         o:"Orçamentos ilimitados", d:"Para quem emite muito.",        h:false, fs:["Sem limite","Renovação mensal","Suporte prioritário","Funcionalidades primeiro"] },
];

const FAQS = [
  { q:"Os meus dados ficam seguros?",      a:"Sim. JWT e isolamento total — nenhum utilizador vê os teus orçamentos ou clientes." },
  { q:"Os packs expiram?",                 a:"Starter (20) e Pro (60) não expiram. Usas ao teu ritmo. O plano Ilimitado é mensal." },
  { q:"Como funciona o pagamento?",        a:"MB WAY ou Multibanco via EuPago, supervisionada pelo Banco de Portugal. Ativação imediata." },
  { q:"Posso cancelar quando quiser?",     a:"Sim. Sem contratos mínimos. Os packs são compra única — pagas uma vez, usas sem prazo." },
  { q:"Preciso de instalar alguma coisa?", a:"Não. 100% no browser — Chrome, Safari, Firefox. Telemóvel, tablet ou computador." },
];

export default function LandingPage() {
  const nav = useNavigate();

  return (
    <div style={{ background:"#050508", color:"#f0f0f0", fontFamily:"'DM Sans',sans-serif", minHeight:"100vh", overflowX:"hidden" }}>

      {/* NAV */}
      <nav style={{ position:"sticky", top:0, zIndex:100, display:"flex", justifyContent:"space-between", alignItems:"center", padding:"0 2rem", height:60, background:"rgba(5,5,8,.97)", borderBottom:"1px solid rgba(255,255,255,.07)", backdropFilter:"blur(14px)" }}>
        <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:17, color:"#fff" }}>Orçamentos<GradText>PME</GradText></span>
        <div style={{ display:"flex", gap:10, alignItems:"center" }}>
          <button onClick={() => nav("/login")} style={{ background:"none", border:"none", color:"#9ca3af", fontSize:13, cursor:"pointer", padding:"8px 14px", fontFamily:"inherit" }}>Entrar</button>
          <button onClick={() => nav("/register")} style={{ background:G, border:"none", color:"#fff", fontSize:13, fontWeight:700, cursor:"pointer", padding:"8px 20px", borderRadius:6, fontFamily:"inherit" }}>Começar grátis</button>
        </div>
      </nav>

      {/* HERO */}
      <div style={{ maxWidth:1180, margin:"0 auto" }}>
        <div className="hero-wrap" style={{ display:"flex", alignItems:"center", gap:"4rem", minHeight:"88vh", padding:"5rem 2rem 3rem" }}>

          {/* Coluna texto */}
          <div style={{ flex:"0 0 480px", maxWidth:480 }}>
            <div className="f1" style={{ display:"inline-flex", alignItems:"center", gap:8, background:"rgba(168,85,247,.08)", border:"1px solid rgba(168,85,247,.2)", color:"#c084fc", fontSize:12, fontWeight:500, padding:"6px 16px", borderRadius:100, marginBottom:"1.75rem" }}>
              <span style={{ width:6, height:6, borderRadius:"50%", background:"#a855f7", animation:"blinkD 2s infinite", flexShrink:0, display:"inline-block" }} />
              Sistema de orçamentos para PMEs portuguesas
            </div>

            <h1 className="f2" style={{ fontFamily:"'Syne',sans-serif", fontSize:"clamp(2.8rem,4.5vw,4.2rem)", fontWeight:800, lineHeight:1.04, letterSpacing:-2, color:"#fff", marginBottom:"1.25rem" }}>
              Orçamentos<br />profissionais<br /><GradText>em 2 minutos</GradText>
            </h1>

            <p className="f3" style={{ fontSize:15, color:"#6b7280", lineHeight:1.8, marginBottom:"2rem", maxWidth:420 }}>
              Sem Word. Sem Excel. Sem cálculos manuais.<br />
              O teu cliente recebe um PDF com o teu nome — direto do telemóvel.
            </p>

            <div className="f4" style={{ display:"flex", gap:12, flexWrap:"wrap", marginBottom:"1.5rem" }}>
              <button className="btn-glow" onClick={() => nav("/register")} style={{ background:G, border:"none", color:"#fff", fontWeight:700, fontSize:14, padding:"13px 28px", borderRadius:8, cursor:"pointer", fontFamily:"inherit", boxShadow:"0 0 28px rgba(168,85,247,.25)", transition:"transform .2s, box-shadow .2s" }}>
                Criar conta gratuita →
              </button>
              <button className="btn-ghost" onClick={() => nav("/login")} style={{ background:"transparent", border:"1px solid rgba(255,255,255,.14)", color:"#d1d5db", fontSize:14, padding:"13px 24px", borderRadius:8, cursor:"pointer", fontFamily:"inherit", transition:"border-color .2s" }}>
                Já tenho conta
              </button>
            </div>

            <div className="f5" style={{ display:"flex", gap:"1.4rem", flexWrap:"wrap" }}>
              {["Sem cartão","3 orçamentos grátis","Acesso imediato"].map(t => (
                <span key={t} style={{ fontSize:12, color:"#4b5563", display:"flex", alignItems:"center", gap:5 }}>
                  <GradText>✓</GradText> {t}
                </span>
              ))}
            </div>
          </div>

          {/* Coluna mockups */}
          <div className="hero-phones" style={{ flex:1, position:"relative", height:480, display:"flex", alignItems:"center", justifyContent:"center" }}>
            {/* Glow de fundo */}
            <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse at center, rgba(168,85,247,.12) 0%, transparent 70%)", animation:"glowP 5s ease-in-out infinite", pointerEvents:"none" }} />
            {/* Telemóvel esquerda */}
            <div style={{ position:"absolute", left:"8%", top:"50%", transform:"translateY(-50%)" }}>
              <Phone img="/dashboardin.png" rotate={-5} delay={0} />
            </div>
            {/* Telemóvel direita */}
            <div style={{ position:"absolute", right:"8%", top:"50%", transform:"translateY(-50%)" }}>
              <Phone img="/orcamentoin.png" rotate={5} delay={0.8} />
            </div>
          </div>

        </div>
      </div>

      {/* PARA QUEM */}
      <div style={{ display:"flex", justifyContent:"center", gap:"2rem", flexWrap:"wrap", padding:"1rem 2rem", background:"#080808", borderTop:"1px solid rgba(255,255,255,.05)", borderBottom:"1px solid rgba(255,255,255,.05)" }}>
        {["Salões de beleza","Barbearias","Clínicas","Consultores","Spas","Empresas de obras"].map(t => (
          <span key={t} style={{ fontSize:12, color:"#333", fontWeight:500 }}>{t}</span>
        ))}
      </div>

      <HR />

      {/* FEATURES */}
      <section style={{ maxWidth:1060, margin:"0 auto", padding:"5rem 2rem" }}>
        <Tag>Funcionalidades</Tag>
        <h2 style={{ fontFamily:"'Syne',sans-serif", fontSize:"clamp(1.8rem,3vw,2.5rem)", fontWeight:800, letterSpacing:-1, color:"#fff", marginBottom:"0.5rem", lineHeight:1.1 }}>
          Tudo o que precisas<br /><GradText>para fechar negócio</GradText>
        </h2>
        <p style={{ color:"#6b7280", fontSize:14, marginBottom:"2.5rem", lineHeight:1.7 }}>Para PMEs que emitem orçamentos para serviços, tratamentos ou obras.</p>
        <div className="feat-grid" style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:1, background:"rgba(255,255,255,.05)", border:"1px solid rgba(255,255,255,.05)", borderRadius:14, overflow:"hidden" }}>
          {FEATS.map(f => (
            <div key={f.t} className="feat-hover" style={{ background:"#0a0a0f", padding:"1.75rem", transition:"background .15s" }}>
              <div style={{ fontSize:24, marginBottom:10 }}>{f.e}</div>
              <div style={{ fontFamily:"'Syne',sans-serif", fontSize:14, fontWeight:700, color:"#fff", marginBottom:6 }}>{f.t}</div>
              <div style={{ fontSize:12, color:"#6b7280", lineHeight:1.65 }}>{f.d}</div>
            </div>
          ))}
        </div>
      </section>

      <HR />

      {/* PLANOS */}
      <section style={{ maxWidth:1060, margin:"0 auto", padding:"5rem 2rem" }}>
        <Tag>Planos & Preços</Tag>
        <h2 style={{ fontFamily:"'Syne',sans-serif", fontSize:"clamp(1.8rem,3vw,2.5rem)", fontWeight:800, letterSpacing:-1, color:"#fff", marginBottom:"0.5rem", lineHeight:1.1 }}>Escolhe o teu plano</h2>
        <p style={{ color:"#6b7280", fontSize:14, marginBottom:"2.5rem", lineHeight:1.7 }}>Sem contratos. MB WAY ou Multibanco. Ativação imediata.</p>
        <div className="plans-grid" style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12 }}>
          {PLANS.map(p => (
            <div key={p.id} className="plan-hover" style={{ background:p.h?"#0f0a1a":"#0d0d12", border:p.h?"1px solid rgba(168,85,247,.4)":"1px solid rgba(255,255,255,.07)", borderRadius:14, padding:"1.5rem 1.1rem", position:"relative", overflow:"hidden", display:"flex", flexDirection:"column", transition:"transform .2s, border-color .2s" }}>
              {p.h && <div style={{ position:"absolute", top:13, right:-26, background:G, color:"#fff", fontSize:9, fontWeight:800, padding:"3px 36px", transform:"rotate(45deg)", letterSpacing:".06em" }}>MELHOR VALOR</div>}
              <div style={{ fontSize:10, fontWeight:700, color:"#555", textTransform:"uppercase", letterSpacing:".08em", marginBottom:8 }}>{p.n}</div>
              <div style={{ fontFamily:"'Syne',sans-serif", fontSize:"1.9rem", fontWeight:800, color:"#fff", lineHeight:1, marginBottom:2 }}>
                {p.p}{p.per && <span style={{ fontSize:11, color:"#444", fontWeight:400 }}> {p.per}</span>}
              </div>
              <div style={{ fontSize:11, fontWeight:700, background:G, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", margin:"6px 0" }}>{p.o}</div>
              <p style={{ fontSize:11, color:"#555", lineHeight:1.5, marginBottom:14, flex:1 }}>{p.d}</p>
              <ul style={{ listStyle:"none", padding:0, margin:"0 0 16px", display:"flex", flexDirection:"column", gap:5 }}>
                {p.fs.map(f => (
                  <li key={f} style={{ fontSize:11, color:"#888", display:"flex", gap:7, alignItems:"flex-start" }}>
                    <GradText>✓</GradText>{f}
                  </li>
                ))}
              </ul>
              <button onClick={() => nav("/register")} style={{ padding:"10px 0", background:p.h?G:"rgba(255,255,255,.05)", border:p.h?"none":"1px solid rgba(255,255,255,.1)", borderRadius:7, color:p.h?"#fff":"#ccc", fontWeight:600, fontSize:12, cursor:"pointer", width:"100%", fontFamily:"inherit" }}>
                {p.id==="free"?"Começar grátis":p.id==="ilimitado"?"Subscrever":"Comprar Agora"}
              </button>
            </div>
          ))}
        </div>
      </section>

      <HR />

      {/* FAQ */}
      <section style={{ maxWidth:1060, margin:"0 auto", padding:"5rem 2rem" }}>
        <Tag>Dúvidas Frequentes</Tag>
        <h2 style={{ fontFamily:"'Syne',sans-serif", fontSize:"clamp(1.8rem,3vw,2.5rem)", fontWeight:800, letterSpacing:-1, color:"#fff", marginBottom:"0.5rem", lineHeight:1.1 }}>
          Respostas <GradText>rápidas</GradText>
        </h2>
        <div style={{ border:"1px solid rgba(255,255,255,.07)", borderRadius:14, overflow:"hidden", marginTop:32 }}>
          {FAQS.map((f,i) => <FaqItem key={i} q={f.q} a={f.a} />)}
        </div>
      </section>

      {/* CTA */}
      <section style={{ position:"relative", textAlign:"center", padding:"6rem 2rem", overflow:"hidden" }}>
        <div style={{ position:"absolute", top:0, left:"50%", transform:"translateX(-50%)", width:600, height:400, background:"radial-gradient(ellipse,rgba(168,85,247,.1) 0%,transparent 70%)", pointerEvents:"none" }} />
        <Tag>Começa hoje</Tag>
        <h2 style={{ fontFamily:"'Syne',sans-serif", fontSize:"clamp(1.8rem,3vw,2.5rem)", fontWeight:800, letterSpacing:-1, color:"#fff", marginBottom:"0.75rem", position:"relative", lineHeight:1.1 }}>
          Pronto para <GradText>profissionalizar</GradText><br />os teus orçamentos?
        </h2>
        <p style={{ color:"#6b7280", fontSize:14, lineHeight:1.7, marginBottom:"2rem", position:"relative" }}>
          Cria a tua conta e emite o primeiro PDF em menos de 5 minutos.<br />
          Sem cartão · 3 orçamentos grátis · Acesso imediato
        </p>
        <button className="btn-glow" onClick={() => nav("/register")} style={{ background:G, border:"none", color:"#fff", fontWeight:700, fontSize:14, padding:"14px 32px", borderRadius:8, cursor:"pointer", fontFamily:"inherit", boxShadow:"0 0 36px rgba(168,85,247,.3)", transition:"transform .2s, box-shadow .2s", position:"relative" }}>
          Criar conta gratuita →
        </button>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop:"1px solid rgba(255,255,255,.06)", padding:"1.5rem 2rem", display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:12 }}>
        <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:14, color:"#fff" }}>Orçamentos<GradText>PME</GradText></span>
        <span style={{ fontSize:12, color:"#333" }}>by Albiclick · contacto@albiclick.com</span>
        <span style={{ fontSize:12, color:"#333" }}>© 2026</span>
      </footer>

    </div>
  );
}
