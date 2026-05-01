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


// 🔥 CRIAR RACHA (SÓ FUNCIONÁRIO/ADMIN)
router.post(
  '/',
  authMiddleware,
  permit('admin', 'funcionario'),
  criarRacha
);


// 🔥 LISTAR RACHAS
router.get(
  '/',
  authMiddleware,
  listarRachas
);


// 🔥 ENTRAR NO RACHA (ALUNO)
router.post(
  '/entrar',
  authMiddleware,
  entrarRacha
);


// 🔥 LISTAR JOGADORES DO RACHA (ESSA QUE FALTAVA)
router.get(
  '/:id/jogadores',
  authMiddleware,
  listarJogadoresRacha
);

// 🔥 DELETAR RACHA
router.delete(
  '/:id',
  authMiddleware,
  deletarRacha
);


export default router;