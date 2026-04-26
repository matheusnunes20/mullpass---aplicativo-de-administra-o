import express from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import pool from '../src/db.js';

const router = express.Router();

// 🔥 ROTA /ME
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await pool.query(
      'SELECT id, email, username, tipo FROM usuarios WHERE id = $1',
      [req.user.id]
    );

    res.json(user.rows[0]);

  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao buscar usuário');
  }
});

// 🔥 EXPORT PADRÃO (OBRIGATÓRIO)
export default router;