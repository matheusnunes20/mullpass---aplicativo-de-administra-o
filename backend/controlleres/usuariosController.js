import pool from '../src/db.js';

export const me = async (req, res) => {
  try {
    const userId = parseInt(req.user.id, 10);

    if (!userId) {
      return res.status(400).json({
        erro: 'ID inválido'
      });
    }

    const result = await pool.query(
      'SELECT id, email, username, tipo FROM usuarios WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        erro: 'Usuário não encontrado'
      });
    }

    res.json(result.rows[0]);

  } catch (err) {
    console.error('ERRO /usuarios/me:', err);

    res.status(500).json({
      erro: err.message
    });
  }
};