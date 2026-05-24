const mongoose = require("mongoose");

const ItemSchema = new mongoose.Schema({
  descricao: { type: String, required: true },
  quantidade: { type: Number, required: true, min: 1 },
  precoUnitario: { type: Number, required: true, min: 0 },
  total: { type: Number, required: true },
});

const OrcamentoSchema = new mongoose.Schema(
  {
    numero: { type: String, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    cliente: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Cliente",
      required: true,
    },
    itens: [ItemSchema],
    subtotal: { type: Number, default: 0 },
    iva: { type: Number, default: 23 },
    total: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["pendente", "aprovado", "rejeitado", "expirado"],
      default: "pendente",
    },
    validade: { type: Date },
    notas: { type: String },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Orcamento", OrcamentoSchema);
