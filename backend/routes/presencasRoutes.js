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
router.get('/minha-turma', authMiddleware, minhaTurma);

router.post('/confirmar', authMiddleware, confirmarPresenca);
router.delete('/remover', authMiddleware, removerPresenca);


router.get('/turma/:turma_id', authMiddleware, listarPresencaPorTurma);
router.get('/hoje', authMiddleware, minhaPresencaHoje);
router.get('/historico', authMiddleware, meuHistorico);
router.get('/aluno/:id/historico', authMiddleware, historicoPorAluno);

export default router;