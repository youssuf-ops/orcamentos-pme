// backend/src/models/User.js
// Alterações: adicionados campos nif e morada para o PDF do emitente
const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    nome: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    empresa: { type: String, default: "" },
    nif: { type: String, default: "" },
    morada: { type: String, default: "" },
    telefone: { type: String, default: "" },
  },
  { timestamps: true },
);

module.exports = mongoose.model("User", UserSchema);
