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

router.get('/turmas', authMiddleware, listarTurmas);
router.get('/me/turma', authMiddleware, minhaTurma);

router.post('/', authMiddleware, confirmarPresenca); // ✅ correto
router.delete('/', authMiddleware, removerPresenca); // ✅ correto

router.get('/turma/:turma_id', authMiddleware, listarPresencaPorTurma);
router.get('/me/hoje', authMiddleware, minhaPresencaHoje);
router.get('/me/historico', authMiddleware, meuHistorico);
router.get('/aluno/:id/historico', authMiddleware, historicoPorAluno);

export default router;