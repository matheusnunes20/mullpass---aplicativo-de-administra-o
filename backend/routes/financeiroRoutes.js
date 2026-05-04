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
router.get('/me', authMiddleware, (req, res, next) => {
  next();
}, meuFinanceiro);
router.get(
  '/alunos',
  authMiddleware,
  permit('admin', 'funcionario'),
  (req, res, next) => {
    next();
  },
  listarFinanceiroAlunos
);

router.post(
  '/criar',
  authMiddleware,
  permit('admin', 'funcionario'),
  (req, res, next) => {
    next();
  },
  criarMensalidade
);

router.put(
  '/pagar/:id',
  authMiddleware,
  permit('admin', 'funcionario'),
  (req, res, next) => {
    next();
  },
  pagarMensalidade
);
router.get(
  '/historico/:id',
  authMiddleware,
  (req, res, next) => {
    next();
  },
  historicoAluno
);

export default router;