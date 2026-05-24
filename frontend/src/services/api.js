import axios from "axios";

//const API_URL = "http://localhost:5000/api";
const API_URL = "https://orcamentos-pme-api.onrender.com/api";

// Instância do axios com URL base
const api = axios.create({
  baseURL: API_URL,
});

// Interceptor — adiciona o token automaticamente em todos os pedidos
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// AUTH
export const register = (dados) => api.post("/auth/register", dados);
export const login = (dados) => api.post("/auth/login", dados);

// CLIENTES
export const getClientes = () => api.get("/clientes");
export const criarCliente = (dados) => api.post("/clientes", dados);
export const editarCliente = (id, dados) => api.put(`/clientes/${id}`, dados);
export const apagarCliente = (id) => api.delete(`/clientes/${id}`);

// ORÇAMENTOS
export const getOrcamentos = () => api.get("/orcamentos");
export const getOrcamento = (id) => api.get(`/orcamentos/${id}`);
export const criarOrcamento = (dados) => api.post("/orcamentos", dados);
export const atualizarStatus = (id, status) =>
  api.put(`/orcamentos/${id}/status`, { status });
export const apagarOrcamento = (id) => api.delete(`/orcamentos/${id}`);

export default api;
