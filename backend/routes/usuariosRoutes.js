import express from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import pool from '../src/db.js';

const router = express.Router();

/**
 * 📌 USUÁRIO LOGADO
 */
router.get('/me', authMiddleware, async (req, res) => {
  try {

    const result = await pool.query(
      'SELECT id, email, username, tipo FROM usuarios WHERE id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        erro: 'Usuário não encontrado'
      });
    }

    res.json(result.rows[0]);

  } catch (err) {
    console.error('ERRO USUARIO /me:', err);

    res.status(500).json({
      erro: err.message
    });
  }
});

export default router;