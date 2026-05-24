const express = require("express");
const router = express.Router();
const Cliente = require("../models/Cliente");
const auth = require("../middleware/auth");

// Todas as rotas exigem autenticação
router.use(auth);

// GET /api/clientes — listar todos os clientes do utilizador
router.get("/", async (req, res) => {
  try {
    const clientes = await Cliente.find({ user: req.userId }).sort({ nome: 1 });
    res.json(clientes);
  } catch (err) {
    res.status(500).json({ erro: "Erro ao listar clientes." });
  }
});

// POST /api/clientes — criar cliente
router.post("/", async (req, res) => {
  try {
    const { nome, email, telefone, nif, morada } = req.body;

    const cliente = new Cliente({
      user: req.userId,
      nome,
      email,
      telefone,
      nif,
      morada,
    });

    await cliente.save();
    res.status(201).json(cliente);
  } catch (err) {
    res
      .status(500)
      .json({ erro: "Erro ao criar cliente.", detalhe: err.message });
  }
});

// PUT /api/clientes/:id — editar cliente
router.put("/:id", async (req, res) => {
  try {
    const cliente = await Cliente.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      req.body,
      { new: true },
    );

    if (!cliente)
      return res.status(404).json({ erro: "Cliente não encontrado." });
    res.json(cliente);
  } catch (err) {
    res.status(500).json({ erro: "Erro ao editar cliente." });
  }
});

// DELETE /api/clientes/:id — apagar cliente
router.delete("/:id", async (req, res) => {
  try {
    const cliente = await Cliente.findOneAndDelete({
      _id: req.params.id,
      user: req.userId,
    });

    if (!cliente)
      return res.status(404).json({ erro: "Cliente não encontrado." });
    res.json({ mensagem: "Cliente apagado com sucesso." });
  } catch (err) {
    res.status(500).json({ erro: "Erro ao apagar cliente." });
  }
});

module.exports = router;
