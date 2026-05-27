const express = require("express");
const router = express.Router();
const Orcamento = require("../models/Orcamento");
const auth = require("../middleware/auth");
const checkPlano = require("../middleware/checkPlano");
router.use(auth);

// GET /api/orcamentos — listar todos
router.get("/", async (req, res) => {
  try {
    const orcamentos = await Orcamento.find({ user: req.userId })
      .populate("cliente", "nome email")
      .sort({ createdAt: -1 });
    res.json(orcamentos);
  } catch (err) {
    res.status(500).json({ erro: "Erro ao listar orçamentos." });
  }
});

// GET /api/orcamentos/:id — detalhes de um orçamento
router.get("/:id", async (req, res) => {
  try {
    const orcamento = await Orcamento.findOne({
      _id: req.params.id,
      user: req.userId,
    }).populate("cliente");
    if (!orcamento)
      return res.status(404).json({ erro: "Orçamento não encontrado." });
    res.json(orcamento);
  } catch (err) {
    res.status(500).json({ erro: "Erro ao buscar orçamento." });
  }
});

// POST /api/orcamentos — criar orçamento
router.post("/", checkPlano, async (req, res) => {
  try {
    const { cliente, itens, iva, validade, notas } = req.body;

    const itensCalculados = itens.map((item) => ({
      ...item,
      total: item.quantidade * item.precoUnitario,
    }));

    const subtotal = itensCalculados.reduce((acc, item) => acc + item.total, 0);
    const ivaNum = Number(iva) || 23;
    const total = subtotal * (1 + ivaNum / 100);

    const count = await Orcamento.countDocuments();
    const ano = new Date().getFullYear();
    const numero = `ORC-${ano}-${String(count + 1).padStart(3, "0")}`;

    const orcamento = new Orcamento({
      numero,
      user: req.userId,
      cliente,
      itens: itensCalculados,
      subtotal,
      iva: ivaNum,
      total,
      validade: validade || undefined,
      notas,
    });

    await orcamento.save();

    // Incrementar contador de orçamentos usados
    if (req.subscription && req.subscription.orcamentosDisponiveis !== -1) {
      req.subscription.orcamentosUsados += 1;
      await req.subscription.save();
    }

    const resultado = await Orcamento.findById(orcamento._id).populate(
      "cliente",
      "nome email",
    );
    res.status(201).json(resultado);
  } catch (err) {
    console.error("ERRO ORCAMENTO:", err.message);
    res
      .status(500)
      .json({ erro: "Erro ao criar orçamento.", detalhe: err.message });
  }
});
// PUT /api/orcamentos/:id/status — atualizar status
router.put("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    const orcamento = await Orcamento.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      { status },
      { new: true },
    ).populate("cliente", "nome email");

    if (!orcamento)
      return res.status(404).json({ erro: "Orçamento não encontrado." });
    res.json(orcamento);
  } catch (err) {
    res.status(500).json({ erro: "Erro ao atualizar status." });
  }
});

// DELETE /api/orcamentos/:id — apagar orçamento
router.delete("/:id", async (req, res) => {
  try {
    const orcamento = await Orcamento.findOneAndDelete({
      _id: req.params.id,
      user: req.userId,
    });
    if (!orcamento)
      return res.status(404).json({ erro: "Orçamento não encontrado." });
    res.json({ mensagem: "Orçamento apagado com sucesso." });
  } catch (err) {
    res.status(500).json({ erro: "Erro ao apagar orçamento." });
  }
});

module.exports = router;
