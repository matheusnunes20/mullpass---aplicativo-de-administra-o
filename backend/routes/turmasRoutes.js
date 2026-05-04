import express from 'express';
import pool from '../src/db.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

// LISTAR TODAS AS TURMAS
router.get('/', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        t.id,
        t.horario,
        t.limite,
        t.tipo,
        COALESCE(COUNT(DISTINCT p.aluno_id), 0) as ocupadas
      FROM turmas t
      LEFT JOIN presencas p 
        ON p.turma_id = t.id
        AND DATE(p.data) = CURRENT_DATE
      GROUP BY t.id
      ORDER BY t.horario
    `);

    const turmasFormatadas = result.rows.map(t => {
      const ocupadas = parseInt(t.ocupadas);

      return {
        id: t.id,
        horario: t.horario,
        tipo: t.tipo,
        limite: t.limite,
        ocupadas,
        vagas: t.limite - ocupadas,
        lotada: ocupadas >= t.limite
      };
    });

    const manha = [];
    const noite = [];

    turmasFormatadas.forEach(t => {
      const hora = parseInt(t.horario.split(':')[0]);

      if (!isNaN(hora) && hora < 12) {
        manha.push(t);
      } else {
        noite.push(t);
      }
    });

    res.json({
      manha,
      noite
    });

  } catch (err) {
    console.error('ERRO LISTAR TURMAS:', err);
    res.status(500).json({ erro: 'Erro ao buscar turmas' });
  }
});

// BUSCAR TURMA POR ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(`
      SELECT 
        t.id,
        t.horario,
        t.limite,
        t.tipo,
        COALESCE(COUNT(DISTINCT p.aluno_id), 0) as ocupadas
      FROM turmas t
      LEFT JOIN presencas p 
        ON p.turma_id = t.id
        AND DATE(p.data) = CURRENT_DATE
      WHERE t.id = $1
      GROUP BY t.id
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ erro: 'Turma não encontrada' });
    }

    const t = result.rows[0];
    const ocupadas = parseInt(t.ocupadas);

    res.json({
      id: t.id,
      horario: t.horario,
      tipo: t.tipo,
      limite: t.limite,
      ocupadas,
      vagas: t.limite - ocupadas,
      lotada: ocupadas >= t.limite
    });

  } catch (err) {
    console.error('ERRO TURMA ID:', err);
    res.status(500).json({ erro: 'Erro ao buscar turma' });
  }
});

// LISTAR ALUNOS DA TURMA
router.get('/:id/alunos', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(`
      SELECT 
        a.id,
        a.nome,
        a.telefone
      FROM presencas p
      JOIN alunos a ON a.id = p.aluno_id
      WHERE p.turma_id = $1
      AND DATE(p.data) = CURRENT_DATE
      ORDER BY a.nome
    `, [id]);

    res.json(result.rows);

  } catch (err) {
    console.error('ERRO ALUNOS TURMA:', err);
    res.status(500).json({ erro: 'Erro ao buscar alunos da turma' });
  }
});

export default router;