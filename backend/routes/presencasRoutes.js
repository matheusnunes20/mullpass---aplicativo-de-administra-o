import express from 'express';
import {
  confirmarPresenca,
  removerPresenca,
  listarPresencaPorTurma,
  minhaTurma
} from '../controlleres/presencasController.js';

import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

// 🔥 ESSENCIAL PRA TELA
router.get('/minha-turma', authMiddleware, minhaTurma);

// 🔥 PRESENÇA
router.post('/confirmar', authMiddleware, confirmarPresenca);
router.delete('/remover', authMiddleware, removerPresenca);

// 🔥 ADMIN
router.get('/turma/:turma_id', authMiddleware, listarPresencaPorTurma);

export default router;