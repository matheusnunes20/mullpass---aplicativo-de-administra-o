import express from 'express';
import {
  meuFinanceiro,
  listarFinanceiroAlunos,
  pagarMensalidade,
  criarMensalidade,
  historicoAluno
} from '../controlleres/financeiroController.js';

import { authMiddleware } from '../middlewares/authMiddleware.js';
import { permit } from '../middlewares/roleMiddleware.js';

const router = express.Router();

// 📌 MEU FINANCEIRO
router.get('/me', authMiddleware, meuFinanceiro);

// 📌 LISTAR TODOS (admin/func)
router.get(
  '/alunos',
  authMiddleware,
  permit('admin', 'funcionario'),
  listarFinanceiroAlunos
);

// 📌 CRIAR MENSALIDADE
router.post(
  '/',
  authMiddleware,
  permit('admin', 'funcionario'),
  criarMensalidade
);

// 📌 PAGAR MENSALIDADE
router.put(
  '/:id/pagar',
  authMiddleware,
  permit('admin', 'funcionario'),
  pagarMensalidade
);

// 📌 HISTÓRICO DO ALUNO
router.get(
  '/historico/:id',
  authMiddleware,
  historicoAluno
);

export default router;