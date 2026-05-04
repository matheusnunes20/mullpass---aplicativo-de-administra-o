import express from 'express';
import {
  criarAula,
  listarAulas,
  deletarAula
} from '../controlleres/aulasController.js';

import { authMiddleware } from '../middlewares/authMiddleware.js';
import { permit } from '../middlewares/roleMiddleware.js';

const router = express.Router();
router.get('/', authMiddleware, listarAulas);
router.post('/', authMiddleware, permit('funcionario', 'admin'), criarAula);
router.delete('/:id', authMiddleware, permit('admin'), deletarAula);

export default router;