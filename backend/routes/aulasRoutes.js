import express from 'express';
import {
  criarAula,
  listarAulas,
  deletarAula
} from '../controlleres/aulasController.js';

import { authMiddleware } from '../middlewares/authMiddleware.js';
import { permit } from '../middlewares/roleMiddleware.js';

const router = express.Router();

// 🔥 LISTAR (todos logados podem ver)
router.get('/', authMiddleware, listarAulas);

// 🔥 CRIAR (funcionario + admin)
router.post('/', authMiddleware, permit('funcionario', 'admin'), criarAula);

// 🔥 DELETAR (só admin)
router.delete('/:id', authMiddleware, permit('admin'), deletarAula);

export default router;