const mongoose = require("mongoose");

const ClienteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    nome: { type: String, required: true, trim: true },
    email: { type: String, lowercase: true },
    telefone: { type: String },
    nif: { type: String },
    morada: { type: String },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Cliente", ClienteSchema);
