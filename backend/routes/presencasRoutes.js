import express from 'express';
import {
  confirmarPresenca,
  listarPresencaPorTurma,
  listarTurmas,
  minhaTurma,
  minhaPresencaHoje,
  meuHistorico,
  historicoPorAluno,
  minhaFrequencia,
  cancelarPresenca
} from '../controlleres/presencasController.js';

import {
  authMiddleware
} from '../middlewares/authMiddleware.js';

const router = express.Router();

/**
 * ✅ CONFIRMAR PRESENÇA
 */
router.post(
  '/',
  authMiddleware,
  confirmarPresenca
);

/**
 * ❌ CANCELAR PRESENÇA
 */
router.delete(
  '/',
  authMiddleware,
  cancelarPresenca
);

/**
 * 📚 LISTAR TURMAS
 */
router.get(
  '/turmas',
  authMiddleware,
  listarTurmas
);

/**
 * 👤 MINHA TURMA
 */
router.get(
  '/minha-turma',
  authMiddleware,
  minhaTurma
);

/**
 * 📅 PRESENÇA HOJE
 */
router.get(
  '/hoje',
  authMiddleware,
  minhaPresencaHoje
);

/**
 * 📜 MEU HISTÓRICO
 */
router.get(
  '/historico',
  authMiddleware,
  meuHistorico
);

/**
 * 📊 MINHA FREQUÊNCIA
 */
router.get(
  '/me/frequencia',
  authMiddleware,
  minhaFrequencia
);

/**
 * 👨‍💼 HISTÓRICO POR ALUNO
 */
router.get(
  '/aluno/:id/historico',
  authMiddleware,
  historicoPorAluno
);

/**
 * 📋 LISTAR PRESENÇAS POR TURMA
 */
router.get(
  '/turma/:turma_id',
  authMiddleware,
  listarPresencaPorTurma
);

export default router;