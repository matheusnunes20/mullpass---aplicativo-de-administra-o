import express from 'express';

import {
  entrarNaTurma,
  minhaTurma,
  sairDaTurma
} from '../controlleres/inscricoesController.js';

import {
  authMiddleware
} from '../middlewares/authMiddleware.js';

const router =
    express.Router();

/**
 * 📌 ENTRAR NA TURMA
 */
router.post(
  '/',
  authMiddleware,
  entrarNaTurma
);

/**
 * 📌 MINHA TURMA
 */
router.get(
  '/me',
  authMiddleware,
  minhaTurma
);

/**
 * 📌 SAIR DA TURMA
 */
router.delete(
  '/me',
  authMiddleware,
  sairDaTurma
);

export default router;