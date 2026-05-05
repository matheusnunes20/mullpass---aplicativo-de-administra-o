import express from 'express';
import {
  confirmarPresenca,
  removerPresenca,
  listarPresencaPorTurma,
  listarTurmas,
  minhaTurma,
  minhaPresencaHoje,
  meuHistorico,
  historicoPorAluno
} from '../controlleres/presencasController.js';

import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

// 📌 TURMAS DISPONÍVEIS
router.get('/turmas', authMiddleware, listarTurmas);

// 📌 MINHA TURMA
router.get('/me/turma', authMiddleware, minhaTurma);

// 📌 CONFIRMAR PRESENÇA
router.post('/', authMiddleware, confirmarPresenca);

// 📌 REMOVER PRESENÇA
router.delete('/', authMiddleware, removerPresenca);

// 📌 PRESENÇAS POR TURMA
router.get('/turma/:turma_id', authMiddleware, listarPresencaPorTurma);

// 📌 MINHA PRESENÇA HOJE
router.get('/me/hoje', authMiddleware, minhaPresencaHoje);

// 📌 MEU HISTÓRICO
router.get('/me/historico', authMiddleware, meuHistorico);

// 📌 HISTÓRICO POR ALUNO
router.get('/aluno/:id/historico', authMiddleware, historicoPorAluno);

export default router;