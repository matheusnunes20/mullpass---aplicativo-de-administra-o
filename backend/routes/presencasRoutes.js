import express from 'express';
import {
  confirmarPresenca,
  historicoPorAluno
} from '../controlleres/presencasController.js';

import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

/**
 * 📌 CONFIRMAR PRESENÇA
 */
router.post('/', authMiddleware, confirmarPresenca);

/**
 * 📌 HISTÓRICO POR ALUNO
 */
router.get('/aluno/:id/historico', authMiddleware, historicoPorAluno);

export default router;