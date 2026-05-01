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

// 👤 ALUNO
router.get('/me', authMiddleware, (req, res, next) => {
  console.log('🔥 ROTA /me chamada');
  next();
}, meuFinanceiro);


// 👨‍💼 ADMIN / FUNCIONÁRIO
router.get(
  '/alunos',
  authMiddleware,
  permit('admin', 'funcionario'),
  (req, res, next) => {
    console.log('🔥 ROTA /alunos chamada');
    console.log('👤 USER:', req.user);
    next();
  },
  listarFinanceiroAlunos
);

router.post(
  '/criar',
  authMiddleware,
  permit('admin', 'funcionario'),
  (req, res, next) => {
    console.log('🔥 ROTA /criar chamada');
    next();
  },
  criarMensalidade
);

router.put(
  '/pagar/:id',
  authMiddleware,
  permit('admin', 'funcionario'),
  (req, res, next) => {
    console.log('🔥 ROTA /pagar chamada');
    console.log('📌 ID:', req.params.id);
    next();
  },
  pagarMensalidade
);


// 📊 HISTÓRICO
router.get(
  '/historico/:id',
  authMiddleware,
  (req, res, next) => {
    console.log('🔥 ROTA /historico chamada');
    next();
  },
  historicoAluno
);

export default router;