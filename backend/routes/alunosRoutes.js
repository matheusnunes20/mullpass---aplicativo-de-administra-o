import express from 'express';
import {
  listarAlunos,
  criarAluno,
  atualizarAluno,
  deletarAluno,
  buscarAlunoPorId
} from '../controlleres/alunosController.js';

import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/public', criarAluno);
router.get('/', authMiddleware, listarAlunos);
router.get('/turmas', authMiddleware, async (req, res) => {
  const result = await pool.query('SELECT * FROM turmas ORDER BY horario');
  res.json(result.rows);
});

// 🔥 ESSA LINHA FALTAVA
router.get('/:id', authMiddleware, buscarAlunoPorId);

router.put('/:id', authMiddleware, atualizarAluno);
router.delete('/:id', authMiddleware, deletarAluno);

export default router;