import axios from "axios";

const API_URL = "https://orcamentos-pme-api.onrender.com/api";

const api = axios.create({
  baseURL: API_URL,
});

// Interceptor de request — JWT (já existe, não tocas)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── NOVO: Interceptor de response — logout automático no 401 ───
// Quando o token expira, o backend devolve 401.
// Sem isto: o utilizador fica com erros silenciosos por todo o lado.
// Com isto: sessão limpa + redirect para login automático.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

// AUTH (não tocas)
export const register = (dados) => api.post("/auth/register", dados);
export const login = (dados) => api.post("/auth/login", dados);

// CLIENTES (não tocas)
export const getClientes = () => api.get("/clientes");
export const criarCliente = (dados) => api.post("/clientes", dados);
export const editarCliente = (id, dados) => api.put(`/clientes/${id}`, dados);
export const apagarCliente = (id) => api.delete(`/clientes/${id}`);

// ORÇAMENTOS (não tocas)
export const getOrcamentos = () => api.get("/orcamentos");
export const getOrcamento = (id) => api.get(`/orcamentos/${id}`);
export const criarOrcamento = (dados) => api.post("/orcamentos", dados);
export const atualizarStatus = (id, status) =>
  api.put(`/orcamentos/${id}/status`, { status });
export const apagarOrcamento = (id) => api.delete(`/orcamentos/${id}`);

// ─── NOVO: SUBSCRIÇÃO ───────────────────────────────────────────
// Devolve o estado actual do plano do utilizador autenticado:
// { plano, orcamentosDisponiveis, orcamentosUsados, planoAtivo, dataFim }
export const getSubscricao = () => api.get("/subscricao/minha");

// ─── NOVO: PAGAMENTOS ───────────────────────────────────────────
// Cria referência de pagamento na EuPago.
// plano: 'starter' | 'pro' | 'ilimitado'
// metodo: 'mbway' | 'multibanco'
// telefone: obrigatório para MB WAY, null para Multibanco
export const criarPagamento = (plano, metodo, telefone = null) =>
  api.post("/pagamentos/criar", { plano, metodo, telefone });

// Polling — verifica se um pagamento foi confirmado pela EuPago.
// Chamado a cada 5 segundos depois de mostrar a referência ao utilizador.
// resposta: { estado: 'pendente' | 'pago' | 'falhado' }
export const verificarPagamento = (referencia) =>
  api.get(`/pagamentos/estado/${referencia}`);

export default api;
