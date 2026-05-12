import express from 'express';

import {
  listarTurmas,
  buscarTurmaPorId,
  listarAlunosTurma
} from '../controlleres/turmasController.js';

import {
  authMiddleware
} from '../middlewares/authMiddleware.js';

const router =
    express.Router();

/**
 * 📌 LISTAR TODAS AS TURMAS
 */
router.get(
  '/',
  authMiddleware,
  listarTurmas
);

/**
 * 📌 BUSCAR TURMA POR ID
 */
router.get(
  '/:id',
  authMiddleware,
  buscarTurmaPorId
);

/**
 * 📌 LISTAR ALUNOS DA TURMA
 */
router.get(
  '/:id/alunos',
  authMiddleware,
  listarAlunosTurma
);

export default router;