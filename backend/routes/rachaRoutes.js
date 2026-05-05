import express from 'express';
import {
  criarRacha,
  listarRachas,
  entrarRacha,
  listarJogadoresRacha,
  deletarRacha
} from '../controlleres/rachaController.js';

import { authMiddleware } from '../middlewares/authMiddleware.js';
import { permit } from '../middlewares/roleMiddleware.js';

const router = express.Router();

// 📌 CRIAR RACHA
router.post(
  '/',
  authMiddleware,
  permit('admin', 'funcionario'),
  criarRacha
);

// 📌 LISTAR RACHAS
router.get(
  '/',
  authMiddleware,
  listarRachas
);

// 📌 ENTRAR NO RACHA
router.post(
  '/:id/jogadores',
  authMiddleware,
  entrarRacha
);

// 📌 LISTAR JOGADORES
router.get(
  '/:id/jogadores',
  authMiddleware,
  listarJogadoresRacha
);

// 📌 DELETAR RACHA
router.delete(
  '/:id',
  authMiddleware,
  permit('admin', 'funcionario'),
  deletarRacha
);

export default router;