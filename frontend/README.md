# OrcamentosPME

Sistema de gestão de orçamentos para PMEs desenvolvido com React, Node.js, Express e MongoDB.

## Funcionalidades

- Autenticação segura com JWT
- Gestão de clientes (criar, listar, apagar)
- Criação de orçamentos com múltiplos itens
- Cálculo automático de IVA em tempo real
- Gestão de status (pendente, aprovado, rejeitado)
- Geração de PDF profissional
- Dashboard com métricas em tempo real

## Stack

- **Frontend:** React, Vite, Axios, React Router, jsPDF
- **Backend:** Node.js, Express, MongoDB, Mongoose, JWT, bcryptjs
- **Base de dados:** MongoDB Atlas

## Instalação

### Backend
```bash
cd backend
npm install
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Variáveis de Ambiente

Cria `.env` na pasta `backend`:

```env
PORT=5000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=o_teu_secret
```

## Autor

Youssuf Abdula — Albiclick