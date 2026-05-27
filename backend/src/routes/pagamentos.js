// ============================================================
// pagamentos.js — Rotas de pagamento
// POST /api/pagamentos/criar
// POST /api/pagamentos/webhook
// GET  /api/pagamentos/estado/:referencia
// GET  /api/pagamentos/subscription
// ============================================================

const express = require("express");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");
const auth = require("../middleware/auth");
const Subscription = require("../models/Subscription");
const { criarPagamento, PRECOS_PLANO } = require("../services/eupago");

// POST /api/pagamentos/criar
router.post("/criar", auth, async (req, res) => {
  try {
    const { plano, metodo, telefone } = req.body;

    if (!["starter", "pro", "ilimitado"].includes(plano)) {
      return res.status(400).json({ erro: "Plano inválido." });
    }
    if (!["mbway", "multibanco"].includes(metodo)) {
      return res.status(400).json({ erro: "Método de pagamento inválido." });
    }
    if (metodo === "mbway" && !telefone) {
      return res
        .status(400)
        .json({ erro: "Telefone obrigatório para MB WAY." });
    }

    const orderId = uuidv4();
    const resultado = await criarPagamento(plano, metodo, orderId, telefone);

    if (!resultado.sucesso) {
      return res
        .status(400)
        .json({ erro: "Falha ao criar pagamento na EuPago." });
    }

    let sub = await Subscription.findOne({ user: req.userId });
    if (!sub) sub = new Subscription({ user: req.userId });

    sub.pagamentos.push({
      referencia: resultado.referencia || orderId,
      valor: PRECOS_PLANO[plano],
      metodo,
      estado: "pendente",
      planoComprado: plano,
    });

    await sub.save();

    res.json({
      sucesso: true,
      entidade: resultado.entidade,
      referencia: resultado.referencia,
      valor: resultado.valor,
      metodo,
      plano,
      mensagem:
        metodo === "mbway"
          ? "Confirma o pagamento na app MB WAY."
          : "Usa a entidade e referência para pagar no Multibanco.",
    });
  } catch (err) {
    console.error("Erro ao criar pagamento:", err.message);
    res
      .status(500)
      .json({ erro: "Erro ao criar pagamento.", detalhe: err.message });
  }
});

// POST /api/pagamentos/webhook — chamado pela EuPago, sem auth
router.post("/webhook", async (req, res) => {
  try {
    const { referencia, estado } = req.body;
    console.log("📩 Webhook EuPago:", req.body);

    if (estado !== "pago") {
      return res.status(200).json({ recebido: true, acaoTomada: false });
    }

    const sub = await Subscription.findOne({
      "pagamentos.referencia": referencia,
    });

    if (!sub) {
      return res.status(200).json({ recebido: true, acaoTomada: false });
    }

    const pagamento = sub.pagamentos.find((p) => p.referencia === referencia);
    if (!pagamento || pagamento.estado === "pago") {
      return res.status(200).json({ recebido: true, acaoTomada: false });
    }

    pagamento.estado = "pago";
    const planoComprado = pagamento.planoComprado;

    if (planoComprado === "starter") {
      sub.orcamentosDisponiveis += 20;
      sub.plano = "starter";
    } else if (planoComprado === "pro") {
      sub.orcamentosDisponiveis += 60;
      sub.plano = "pro";
    } else if (planoComprado === "ilimitado") {
      sub.orcamentosDisponiveis = -1;
      sub.plano = "ilimitado";
      sub.dataFim = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    }

    sub.planoAtivo = true;
    await sub.save();

    console.log(`✅ Plano ${planoComprado} ativado para user ${sub.user}`);
    res.status(200).json({ recebido: true, acaoTomada: true });
  } catch (err) {
    console.error("Erro no webhook:", err.message);
    res.status(200).json({ recebido: true, erro: err.message });
  }
});

// GET /api/pagamentos/estado/:referencia — polling do frontend
router.get("/estado/:referencia", auth, async (req, res) => {
  try {
    const sub = await Subscription.findOne({
      user: req.userId,
      "pagamentos.referencia": req.params.referencia,
    });

    if (!sub)
      return res.status(404).json({ erro: "Referência não encontrada." });

    const pagamento = sub.pagamentos.find(
      (p) => p.referencia === req.params.referencia,
    );

    res.json({
      estado: pagamento.estado,
      plano: sub.plano,
      orcamentosDisponiveis: sub.orcamentosDisponiveis,
    });
  } catch (err) {
    res.status(500).json({ erro: "Erro ao verificar estado." });
  }
});

// GET /api/pagamentos/subscription — plano atual do utilizador
router.get("/subscription", auth, async (req, res) => {
  try {
    let sub = await Subscription.findOne({ user: req.userId });

    if (!sub) {
      sub = new Subscription({ user: req.userId });
      await sub.save();
    }

    res.json({
      plano: sub.plano,
      orcamentosDisponiveis: sub.orcamentosDisponiveis,
      orcamentosUsados: sub.orcamentosUsados,
      planoAtivo: sub.planoAtivo,
      dataFim: sub.dataFim,
    });
  } catch (err) {
    res.status(500).json({ erro: "Erro ao obter subscription." });
  }
});

module.exports = router;
