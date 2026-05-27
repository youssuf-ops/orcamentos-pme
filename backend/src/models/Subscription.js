// ============================================================
// Subscription.js — Model do plano de subscrição de cada tenant
// Propósito: guardar plano atual, orçamentos disponíveis/usados,
//            e histórico de todos os pagamentos desse utilizador.
// ============================================================

const mongoose = require("mongoose");

// Subdocumento: cada pagamento individual
// Não é uma coleção separada — viaja sempre com o Subscription
const pagamentoSchema = new mongoose.Schema({
  referencia: { type: String },
  valor: { type: Number, required: true },
  metodo: {
    type: String,
    enum: ["mbway", "multibanco"],
    required: true,
  },
  estado: {
    type: String,
    enum: ["pendente", "pago", "falhado"],
    default: "pendente",
  },
  planoComprado: { type: String },
  data: { type: Date, default: Date.now },
});

const subscriptionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    plano: {
      type: String,
      enum: ["free", "starter", "pro", "ilimitado"],
      default: "free",
    },
    // -1 = ilimitado
    orcamentosDisponiveis: {
      type: Number,
      default: 3,
    },
    orcamentosUsados: {
      type: Number,
      default: 0,
    },
    pagamentos: [pagamentoSchema],
    planoAtivo: {
      type: Boolean,
      default: true,
    },
    dataInicio: { type: Date, default: Date.now },
    dataFim: { type: Date, default: null },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Subscription", subscriptionSchema);
