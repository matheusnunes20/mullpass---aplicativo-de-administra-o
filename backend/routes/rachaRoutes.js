import express from 'express';
import {
  criarRacha,
  listarRachas,
  entrarRacha,
  listarJogadoresRacha
} from '../controlleres/rachaController.js';

import { authMiddleware } from '../middlewares/authMiddleware.js';
import { permit } from '../middlewares/roleMiddleware.js';
import { deletarRacha } from '../controlleres/rachaController.js';

const router = express.Router();
router.post(
  '/',
  authMiddleware,
  permit('admin', 'funcionario'),
  criarRacha
);
router.get(
  '/',
  authMiddleware,
  listarRachas
);
router.post(
  '/entrar',
  authMiddleware,
  entrarRacha
);
router.get(
  '/:id/jogadores',
  authMiddleware,
  listarJogadoresRacha
);
router.delete(
  '/:id',
  authMiddleware,
  deletarRacha
);

export default router;