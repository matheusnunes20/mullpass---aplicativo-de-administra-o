import express from 'express';
import pool from '../src/db.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();


// 🔥 ENTRAR NA TURMA
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { turma_id } = req.body;

    if (!turma_id) {
      return res.status(400).json({ erro: 'turma_id obrigatório' });
    }

    // 🔥 pega aluno pelo usuário logado
    const alunoResult = await pool.query(
      `SELECT id FROM alunos WHERE usuario_id = $1`,
      [req.user.id]
    );

    if (alunoResult.rows.length === 0) {
      return res.status(404).json({ erro: 'Aluno não encontrado' });
    }

    const aluno_id = alunoResult.rows[0].id;

    // 🔥 verifica se turma existe
    const turmaResult = await pool.query(
      `SELECT limite FROM turmas WHERE id = $1`,
      [turma_id]
    );

    if (turmaResult.rows.length === 0) {
      return res.status(404).json({ erro: 'Turma não encontrada' });
    }

    const limite = turmaResult.rows[0].limite;

    // 🔥 conta inscritos
    const count = await pool.query(
      `SELECT COUNT(*) FROM inscricoes WHERE turma_id = $1`,
      [turma_id]
    );

    const total = parseInt(count.rows[0].count);

    if (total >= limite) {
      return res.status(400).json({ erro: 'Turma lotada' });
    }

    // 🔥 remove turma anterior
    await pool.query(
      `DELETE FROM inscricoes WHERE aluno_id = $1`,
      [aluno_id]
    );

    // 🔥 entra na nova turma
    const result = await pool.query(
      `INSERT INTO inscricoes (aluno_id, turma_id)
       VALUES ($1, $2)
       RETURNING *`,
      [aluno_id, turma_id]
    );

    res.json(result.rows[0]);

  } catch (err) {
    console.error('ERRO ENTRAR TURMA:', err);
    res.status(500).json({ erro: 'Erro ao entrar na turma' });
  }
});


// 🔥 MINHA TURMA
router.get('/me', authMiddleware, async (req, res) => {
  try {

    const result = await pool.query(`
      SELECT 
        t.id,
        t.horario,
        t.limite,
        t.tipo,
        COALESCE(COUNT(i2.id), 0) as ocupadas
      FROM inscricoes i
      JOIN alunos a ON a.id = i.aluno_id
      JOIN turmas t ON t.id = i.turma_id
      LEFT JOIN inscricoes i2 ON i2.turma_id = t.id
      WHERE a.usuario_id = $1
      GROUP BY t.id
    `, [req.user.id]);

    if (result.rows.length === 0) {
      return res.json(null);
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
    console.error('ERRO MINHA TURMA:', err);
    res.status(500).json({ erro: 'Erro ao buscar turma' });
  }
});


// 🔥 SAIR DA TURMA
router.delete('/me', authMiddleware, async (req, res) => {
  try {

    const alunoResult = await pool.query(
      `SELECT id FROM alunos WHERE usuario_id = $1`,
      [req.user.id]
    );

    if (alunoResult.rows.length === 0) {
      return res.status(404).json({ erro: 'Aluno não encontrado' });
    }

    const aluno_id = alunoResult.rows[0].id;

    await pool.query(
      `DELETE FROM inscricoes WHERE aluno_id = $1`,
      [aluno_id]
    );

    res.json({ mensagem: 'Saiu da turma' });

  } catch (err) {
    console.error('ERRO SAIR TURMA:', err);
    res.status(500).json({ erro: 'Erro ao sair da turma' });
  }
});


export default router;