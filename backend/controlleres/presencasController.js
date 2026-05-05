import pool from '../src/db.js';

/**
 * 📌 CONFIRMAR PRESENÇA
 */
export const confirmarPresenca = async (req, res) => {
  try {
    const usuarioId = parseInt(req.user.id, 10);
    const turma_id = parseInt(req.body.turma_id, 10);

    if (!turma_id) {
      return res.status(400).json({ erro: 'turma_id inválido' });
    }

    const alunoResult = await pool.query(
      `SELECT id FROM alunos WHERE usuario_id = $1`,
      [usuarioId]
    );

    if (alunoResult.rows.length === 0) {
      return res.status(404).json({ erro: 'Aluno não encontrado' });
    }

    const alunoId = alunoResult.rows[0].id;

    const turmaResult = await pool.query(
      `SELECT id, limite FROM turmas WHERE id = $1`,
      [turma_id]
    );

    if (turmaResult.rows.length === 0) {
      return res.status(400).json({ erro: 'Turma inválida' });
    }

    const turma = turmaResult.rows[0];

    // remove presença anterior hoje
    await pool.query(
      `DELETE FROM presencas
       WHERE aluno_id = $1
       AND DATE(data) = CURRENT_DATE`,
      [alunoId]
    );

    const count = await pool.query(
      `SELECT COUNT(DISTINCT aluno_id) FROM presencas
       WHERE turma_id = $1
       AND DATE(data) = CURRENT_DATE`,
      [turma_id]
    );

    const total = parseInt(count.rows[0].count, 10);

    if (total >= turma.limite) {
      return res.status(400).json({ erro: 'Turma cheia' });
    }

    const result = await pool.query(
      `INSERT INTO presencas (aluno_id, turma_id, data)
       VALUES ($1, $2, NOW())
       RETURNING *`,
      [alunoId, turma_id]
    );

    res.status(201).json(result.rows[0]);

  } catch (err) {
    console.error('ERRO CONFIRMAR PRESENÇA:', err);
    res.status(500).json({ erro: err.message });
  }
};