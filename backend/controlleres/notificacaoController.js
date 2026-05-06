import pool from '../src/db.js';

export const minhasNotificacoes = async (req, res) => {

  try {

    const aluno = await pool.query(
      `SELECT id FROM alunos WHERE usuario_id = $1`,
      [req.user.id]
    );

    if (aluno.rows.length === 0) {
      return res.status(404).json({
        erro: 'Aluno não encontrado'
      });
    }

    const result = await pool.query(`
      SELECT *
      FROM notificacoes
      WHERE aluno_id = $1
      ORDER BY created_at DESC
    `, [aluno.rows[0].id]);

    res.json(result.rows);

  } catch (err) {
    console.error(err);

    res.status(500).json({
      erro: err.message
    });
  }
};

/**
 * 🔔 CONTADOR DE NÃO LIDAS
 */
export const contarNotificacoes = async (req, res) => {

  try {

    const aluno = await pool.query(
      `SELECT id FROM alunos WHERE usuario_id = $1`,
      [req.user.id]
    );

    if (aluno.rows.length === 0) {
      return res.status(404).json({
        erro: 'Aluno não encontrado'
      });
    }

    const result = await pool.query(`
      SELECT COUNT(*) as total
      FROM notificacoes
      WHERE aluno_id = $1
      AND lida = false
    `, [aluno.rows[0].id]);

    res.json({
      total: Number(result.rows[0].total)
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      erro: err.message
    });
  }
};


/**
 * ✅ MARCAR TODAS COMO LIDAS
 */
export const marcarComoLida = async (req, res) => {

  try {

    const aluno = await pool.query(
      `SELECT id FROM alunos WHERE usuario_id = $1`,
      [req.user.id]
    );

    if (aluno.rows.length === 0) {
      return res.status(404).json({
        erro: 'Aluno não encontrado'
      });
    }

    await pool.query(`
      UPDATE notificacoes
      SET lida = true
      WHERE aluno_id = $1
    `, [aluno.rows[0].id]);

    res.json({
      mensagem: 'Notificações marcadas como lidas'
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      erro: err.message
    });
  }
};