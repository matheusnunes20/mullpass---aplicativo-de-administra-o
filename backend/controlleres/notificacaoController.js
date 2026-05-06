import pool from '../src/db.js';

/**
 * 🔔 MINHAS NOTIFICAÇÕES
 */
export const minhasNotificacoes = async (req, res) => {

  try {

    const result = await pool.query(`

      SELECT *

      FROM notificacoes

      WHERE usuario_id = $1

      ORDER BY created_at DESC

    `, [req.user.id]);

    res.json(result.rows);

  } catch (err) {

    console.error(err);

    res.status(500).json({
      erro: err.message
    });
  }
};

/**
 * 🔔 CONTADOR NÃO LIDAS
 */
export const contarNotificacoes = async (req, res) => {

  try {

    const result = await pool.query(`

      SELECT COUNT(*) as total

      FROM notificacoes

      WHERE usuario_id = $1

      AND lida = false

    `, [req.user.id]);

    res.json({

      total:
          Number(
            result.rows[0].total
          )
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      erro: err.message
    });
  }
};

/**
 * ✅ MARCAR COMO LIDA
 */
export const marcarComoLida = async (req, res) => {

  try {

    await pool.query(`

      UPDATE notificacoes

      SET lida = true

      WHERE usuario_id = $1

    `, [req.user.id]);

    res.json({

      mensagem:
          'Notificações marcadas como lidas'
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      erro: err.message
    });
  }
};

