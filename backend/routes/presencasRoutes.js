import express from 'express';
import {
  confirmarPresenca,
  removerPresenca,
  historicoPorAluno
} from '../controlleres/presencasController.js';

import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

/**
 * 📌 CONFIRMAR PRESENÇA
 */
router.post('/', authMiddleware, confirmarPresenca);

/**
 * 📌 REMOVER PRESENÇA
 */
router.delete('/', authMiddleware, removerPresenca);

/**
 * 📌 HISTÓRICO POR ALUNO
 */
router.get('/aluno/:id/historico', authMiddleware, historicoPorAluno);

export default router;