const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// MIDDLEWARE GLOBAL
app.use(cors());
app.use(express.json());

// LIGAÇÃO AO MONGODB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB conectado"))
  .catch((err) => console.error("❌ Erro MongoDB:", err));

// ROUTES
app.use("/api/auth", require("./routes/auth"));
app.use("/api/orcamentos", require("./routes/orcamentos"));
app.use("/api/clientes", require("./routes/clientes"));
app.use("/api/pagamentos", require("./routes/pagamentos"));

// HEALTH CHECK
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date() });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor a correr na porta ${PORT}`);
});
