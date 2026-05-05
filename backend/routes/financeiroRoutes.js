import express from 'express';

import {
  meuFinanceiro,
  listarFinanceiroAlunos,
  pagarMensalidade,
  criarMensalidade,
  historicoAluno,
  meuHistoricoFinanceiro,
  relatorioFinanceiro,
  listarInadimplentes // ✅ ADICIONADO
} from '../controlleres/financeiroController.js';

import { authMiddleware } from '../middlewares/authMiddleware.js';
import { permit } from '../middlewares/roleMiddleware.js';

const router = express.Router();

/**
 * 📌 MEU FINANCEIRO (ALUNO)
 */
router.get('/me', authMiddleware, meuFinanceiro);

/**
 * 📌 HISTÓRICO DO PRÓPRIO ALUNO
 */
router.get('/me/historico', authMiddleware, meuHistoricoFinanceiro);

/**
 * 📌 RELATÓRIO (ADMIN/FUNCIONÁRIO)
 */
router.get(
  '/relatorio',
  authMiddleware,
  permit('admin', 'funcionario'),
  relatorioFinanceiro
);

/**
 * 📌 🔴 INADIMPLENTES (ADMIN/FUNCIONÁRIO)
 */
router.get(
  '/inadimplentes',
  authMiddleware,
  permit('admin', 'funcionario'),
  listarInadimplentes
);

/**
 * 📌 LISTAR TODOS (ADMIN/FUNCIONÁRIO)
 */
router.get(
  '/alunos',
  authMiddleware,
  permit('admin', 'funcionario'),
  listarFinanceiroAlunos
);

/**
 * 📌 CRIAR MENSALIDADE
 */
router.post(
  '/',
  authMiddleware,
  permit('admin', 'funcionario'),
  criarMensalidade
);

/**
 * 📌 PAGAR MENSALIDADE
 */
router.put(
  '/:id/pagar',
  authMiddleware,
  permit('admin', 'funcionario'),
  pagarMensalidade
);

/**
 * 📌 HISTÓRICO DE UM ALUNO (ADMIN)
 */
router.get(
  '/historico/:id',
  authMiddleware,
  permit('admin', 'funcionario'),
  historicoAluno
);

export default router;