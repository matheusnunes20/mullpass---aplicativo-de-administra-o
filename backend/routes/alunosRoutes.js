import express from 'express';
import {
  listarAlunos,
  criarAluno,
  atualizarAluno,
  deletarAluno
} from '../controlleres/alunosController.js';

import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

// 🔓 PUBLICO (cadastro)
router.post('/public', criarAluno);

// 🔐 PROTEGIDO
router.get('/', authMiddleware, listarAlunos);
router.put('/:id', authMiddleware, atualizarAluno);
router.delete('/:id', authMiddleware, deletarAluno);

export default router;