// backend/src/routes/auth.js
// Alterações: adicionadas rotas GET e PUT /api/auth/perfil
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const auth = require("../middleware/auth");

// ── POST /api/auth/register ───────────────────────────────
router.post("/register", async (req, res) => {
  try {
    const { nome, email, password, empresa, nif, morada, telefone } = req.body;

    const userExiste = await User.findOne({ email });
    if (userExiste) {
      return res.status(400).json({ erro: "Email já registado." });
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const user = new User({
      nome,
      email,
      password: hash,
      empresa: empresa || "",
      nif: nif || "",
      morada: morada || "",
      telefone: telefone || "",
    });
    await user.save();

    // Criar Subscription com plano free
    const Subscription = require("../models/Subscription");
    const subscription = new Subscription({
      user: user._id,
      plano: "free",
      orcamentosDisponiveis: 3,
      orcamentosUsados: 0,
      planoAtivo: true,
    });
    await subscription.save();

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(201).json({
      token,
      user: {
        id: user._id,
        nome: user.nome,
        email: user.email,
        empresa: user.empresa,
        nif: user.nif,
        morada: user.morada,
        telefone: user.telefone,
      },
    });
  } catch (err) {
    res.status(500).json({ erro: "Erro no servidor.", detalhe: err.message });
  }
});

// ── POST /api/auth/login ──────────────────────────────────
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ erro: "Credenciais inválidas." });
    }

    const passwordCorreta = await bcrypt.compare(password, user.password);
    if (!passwordCorreta) {
      return res.status(400).json({ erro: "Credenciais inválidas." });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      token,
      user: {
        id: user._id,
        nome: user.nome,
        email: user.email,
        empresa: user.empresa,
        nif: user.nif,
        morada: user.morada,
        telefone: user.telefone,
      },
    });
  } catch (err) {
    res.status(500).json({ erro: "Erro no servidor.", detalhe: err.message });
  }
});

// ── GET /api/auth/perfil ──────────────────────────────────
// Devolve os dados do utilizador autenticado
router.get("/perfil", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user)
      return res.status(404).json({ erro: "Utilizador não encontrado." });
    res.json(user);
  } catch (err) {
    res.status(500).json({ erro: "Erro no servidor.", detalhe: err.message });
  }
});

// ── PUT /api/auth/perfil ──────────────────────────────────
// Actualiza os dados do utilizador autenticado
// Não permite alterar email nem password por aqui
router.put("/perfil", auth, async (req, res) => {
  try {
    const { nome, empresa, nif, morada, telefone } = req.body;

    const user = await User.findByIdAndUpdate(
      req.userId,
      { nome, empresa, nif, morada, telefone },
      { new: true, runValidators: true },
    ).select("-password");

    if (!user)
      return res.status(404).json({ erro: "Utilizador não encontrado." });

    res.json({
      id: user._id,
      nome: user.nome,
      email: user.email,
      empresa: user.empresa,
      nif: user.nif,
      morada: user.morada,
      telefone: user.telefone,
    });
  } catch (err) {
    res.status(500).json({ erro: "Erro no servidor.", detalhe: err.message });
  }
});

module.exports = router;
