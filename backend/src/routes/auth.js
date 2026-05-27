const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

router.post("/register", async (req, res) => {
  try {
    const { nome, email, password, empresa } = req.body;

    const userExiste = await User.findOne({ email });
    if (userExiste) {
      return res.status(400).json({ erro: "Email já registado." });
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const user = new User({ nome, email, password: hash, empresa });
    await user.save();

    // Criar Subscription com plano free para o novo utilizador
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
      },
    });
  } catch (err) {
    res.status(500).json({ erro: "Erro no servidor.", detalhe: err.message });
  }
});

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
      },
    });
  } catch (err) {
    res.status(500).json({ erro: "Erro no servidor.", detalhe: err.message });
  }
});

module.exports = router;
