// ============================================================
// eupago.js — Service de integração EuPago
// REGRA CRÍTICA:
//   Multibanco → API Legacy  → chave no BODY
//   MB WAY     → API Nova    → chave no HEADER
// ============================================================

const fetch = require("node-fetch");

const PRECOS_PLANO = {
  starter: 20,
  pro: 45,
  ilimitado: 19,
};

function getBaseUrls() {
  const isSandbox = process.env.EUPAGO_SANDBOX === "true";
  return {
    legacy: isSandbox
      ? "https://sandbox.eupago.pt/clientes/rest_api"
      : "https://clientes.eupago.pt/clientes/rest_api",
    nova: isSandbox
      ? "https://sandbox.eupago.pt/api"
      : "https://clientes.eupago.pt/api",
  };
}

async function criarMultibanco(plano, orderId) {
  const valor = PRECOS_PLANO[plano];
  if (!valor) throw new Error(`Plano inválido: ${plano}`);

  const { legacy } = getBaseUrls();
  const dataFim = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  const res = await fetch(`${legacy}/multibanco/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chave: process.env.EUPAGO_API_KEY,
      valor,
      id: orderId,
      data_fim: dataFim,
    }),
  });

  if (!res.ok) throw new Error(`EuPago Multibanco HTTP ${res.status}`);
  const data = await res.json();

  return {
    sucesso: data.sucesso,
    entidade: data.entidade ?? null,
    referencia: data.referencia ?? null,
    valor,
    metodo: "multibanco",
  };
}

async function criarMBWay(plano, orderId, telefone) {
  const valor = PRECOS_PLANO[plano];
  if (!valor) throw new Error(`Plano inválido: ${plano}`);
  if (!telefone) throw new Error("Telefone obrigatório para MB WAY");

  const { nova } = getBaseUrls();

  const res = await fetch(`${nova}/v1.02/mbway/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `ApiKey ${process.env.EUPAGO_API_KEY}`,
    },
    body: JSON.stringify({
      payment: {
        identifier: orderId,
        amount: { value: valor, currency: "EUR" },
        customerPhone: telefone,
        countryCode: "+351",
      },
    }),
  });

  if (!res.ok) throw new Error(`EuPago MB WAY HTTP ${res.status}`);
  const data = await res.json();

  return {
    sucesso: data.transactionStatus === "Success",
    entidade: data.entity ?? null,
    referencia: data.reference ?? null,
    valor,
    metodo: "mbway",
  };
}

async function criarPagamento(plano, metodo, orderId, telefone = null) {
  if (metodo === "multibanco") return await criarMultibanco(plano, orderId);
  if (metodo === "mbway") return await criarMBWay(plano, orderId, telefone);
  throw new Error(`Método inválido: ${metodo}`);
}

module.exports = { criarPagamento, PRECOS_PLANO };
