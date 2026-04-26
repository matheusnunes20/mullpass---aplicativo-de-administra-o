import express from 'express';
import pool from '../src/db.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();


// 🔥 CONFIRMAR PRESENÇA
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { aluno_id } = req.body;

    if (!aluno_id) {
      return res.status(400).send('aluno_id obrigatório');
    }

    const existe = await pool.query(
      `SELECT 1 FROM presencas 
       WHERE aluno_id = $1 
       AND DATE(data) = CURRENT_DATE`,
      [aluno_id]
    );

    if (existe.rows.length > 0) {
      return res.status(400).send('Presença já confirmada hoje');
    }

    const result = await pool.query(
      `INSERT INTO presencas (aluno_id, data)
       VALUES ($1, NOW())
       RETURNING *`,
      [aluno_id]
    );

    res.status(201).json(result.rows[0]);

  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao registrar presença');
  }
});


// 🔥 REMOVER PRESENÇA
router.delete('/:aluno_id', authMiddleware, async (req, res) => {
  try {
    const { aluno_id } = req.params;

    const result = await pool.query(
      `DELETE FROM presencas
       WHERE aluno_id = $1
       AND DATE(data) = CURRENT_DATE
       RETURNING *`,
      [aluno_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).send('Nenhuma presença hoje para remover');
    }

    res.status(200).send('Presença removida');

  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao remover presença');
  }
});


// 🔥 PRESENÇA DO USUÁRIO LOGADO
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 1 FROM presencas p
       JOIN alunos a ON a.id = p.aluno_id
       WHERE a.usuario_id = $1
       AND DATE(p.data) = CURRENT_DATE`,
      [req.user.id]
    );

    res.json({
      confirmou: result.rows.length > 0
    });

  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao verificar presença');
  }
});


// 🔥 STATUS DO USUÁRIO LOGADO
router.get('/status', authMiddleware, async (req, res) => {
  try {

    const alunoResult = await pool.query(
      `SELECT id, dia_semana FROM alunos WHERE usuario_id = $1`,
      [req.user.id]
    );

    if (alunoResult.rows.length === 0) {
      return res.status(404).send('Aluno não encontrado');
    }

    const aluno = alunoResult.rows[0];

    const presencasResult = await pool.query(
      `SELECT COUNT(*) FROM presencas
       WHERE aluno_id = $1
       AND data >= NOW() - INTERVAL '30 days'`,
      [aluno.id]
    );

    const totalPresencas = parseInt(presencasResult.rows[0].count);

    const dias = aluno.dia_semana.toLowerCase();

    let aulasPorSemana = 0;

    if (dias.includes('segunda')) aulasPorSemana++;
    if (dias.includes('terça') || dias.includes('terca')) aulasPorSemana++;
    if (dias.includes('quarta')) aulasPorSemana++;
    if (dias.includes('quinta')) aulasPorSemana++;
    if (dias.includes('sexta')) aulasPorSemana++;

    const totalAulas = aulasPorSemana * 4 || 1;
    const percentual = totalPresencas / totalAulas;

    let status = 'ausente';

    if (percentual >= 0.8) status = 'frequente';
    else if (percentual >= 0.5) status = 'irregular';

    res.json({ presencas: totalPresencas, totalAulas, percentual, status });

  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao calcular status');
  }
});


// 🔥 NOVO: STATUS POR ALUNO (ADMIN/FUNCIONÁRIO)
router.get('/status/:aluno_id', authMiddleware, async (req, res) => {
  try {

    const { aluno_id } = req.params;

    const alunoResult = await pool.query(
      `SELECT dia_semana FROM alunos WHERE id = $1`,
      [aluno_id]
    );

    if (alunoResult.rows.length === 0) {
      return res.status(404).send('Aluno não encontrado');
    }

    const dias = alunoResult.rows[0].dia_semana.toLowerCase();

    const presencasResult = await pool.query(
      `SELECT COUNT(*) FROM presencas
       WHERE aluno_id = $1
       AND data >= NOW() - INTERVAL '30 days'`,
      [aluno_id]
    );

    const totalPresencas = parseInt(presencasResult.rows[0].count);

    let aulasPorSemana = 0;

    if (dias.includes('segunda')) aulasPorSemana++;
    if (dias.includes('terça') || dias.includes('terca')) aulasPorSemana++;
    if (dias.includes('quarta')) aulasPorSemana++;
    if (dias.includes('quinta')) aulasPorSemana++;
    if (dias.includes('sexta')) aulasPorSemana++;

    const totalAulas = aulasPorSemana * 4 || 1;
    const percentual = totalPresencas / totalAulas;

    let status = 'ausente';

    if (percentual >= 0.8) status = 'frequente';
    else if (percentual >= 0.5) status = 'irregular';

    res.json({
      presencas: totalPresencas,
      totalAulas,
      percentual,
      status
    });

  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao calcular status do aluno');
  }
});


export default router;