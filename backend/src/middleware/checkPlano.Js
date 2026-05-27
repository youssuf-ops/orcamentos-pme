// ============================================================
// checkPlano.js — Middleware de controlo de plano
// Posição na cadeia: DEPOIS do auth (req.userId já existe)
// ============================================================

const Subscription = require("../models/Subscription");

module.exports = async (req, res, next) => {
  try {
    let sub = await Subscription.findOne({ user: req.userId });

    // Utilizador antigo sem subscription — criar automaticamente
    if (!sub) {
      sub = new Subscription({ user: req.userId });
      await sub.save();
      req.subscription = sub;
      return next();
    }

    // Plano ilimitado — passa sempre
    if (sub.orcamentosDisponiveis === -1) {
      req.subscription = sub;
      return next();
    }

    // Limite atingido — bloquear
    if (sub.orcamentosUsados >= sub.orcamentosDisponiveis) {
      return res.status(403).json({
        bloqueado: true,
        motivo: "limite_atingido",
        plano: sub.plano,
        orcamentosUsados: sub.orcamentosUsados,
        orcamentosDisponiveis: sub.orcamentosDisponiveis,
        mensagem: `Atingiste o limite do plano ${sub.plano}. Faz upgrade para continuar.`,
      });
    }

    req.subscription = sub;
    next();
  } catch (err) {
    console.error("Erro no checkPlano:", err.message);
    res.status(500).json({ erro: "Erro ao verificar plano." });
  }
};
