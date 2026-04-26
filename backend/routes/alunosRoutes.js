import express from 'express';
import {
  listarAlunos,
  criarAluno,
  atualizarAluno,
  deletarAluno
} from '../controlleres/alunosController.js';

import { authMiddleware } from '../middlewares/authMiddleware.js';
import { permit } from '../middlewares/roleMiddleware.js';
import pool from '../src/db.js';

const router = express.Router();


// 🔓 CADASTRO PÚBLICO
router.post('/public', criarAluno);


// 🔐 LISTAR TODOS
router.get('/', authMiddleware, listarAlunos);


// 🔐 BUSCAR ALUNO DO USUÁRIO LOGADO (IMPORTANTE VIR ANTES)
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM alunos WHERE usuario_id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ erro: 'Aluno não encontrado' });
    }

    res.json(result.rows[0]);

  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao buscar aluno' });
  }
});


// 🔥 NOVO: BUSCAR POR ID (AGORA SIM)
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'SELECT * FROM alunos WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ erro: 'Aluno não encontrado' });
    }

    res.json(result.rows[0]);

  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao buscar aluno' });
  }
});


// 🔐 CRIAR
router.post('/', authMiddleware, permit('admin', 'funcionario'), criarAluno);


// 🔐 ATUALIZAR
router.put('/:id', authMiddleware, atualizarAluno);


// 🔐 DELETAR
router.delete('/:id', authMiddleware, permit('admin'), deletarAluno);


export default router;