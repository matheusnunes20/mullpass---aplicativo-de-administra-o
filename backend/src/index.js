import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cron from 'node-cron';

import pool from './db.js'; // 👈 IMPORTANTE

import alunosRoutes from '../routes/alunosRoutes.js';
import authRoutes from '../routes/authRoutes.js';
import rachaRoutes from '../routes/rachaRoutes.js';
import aulasRoutes from '../routes/aulasRoutes.js';
import usuariosRoutes from '../routes/usuariosRoutes.js';
import presencasRoutes from '../routes/presencasRoutes.js';
import turmasRoutes from '../routes/turmasRoutes.js';
import inscricoesRoutes from '../routes/inscricoesRoutes.js';
import financeiroRoutes from '../routes/financeiroRoutes.js';

import { bloquearInadimplente } from '../middlewares/financeiroMiddleware.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { gerarMensalidades } from '../services/financeiroService.js';

dotenv.config();

const app = express();

cron.schedule('0 2 * * *', () => {
  gerarMensalidades();
});

app.use(cors({ origin: '*' }));
app.use(express.json());

/**
 * 🔥 TESTE DE CONEXÃO COM BANCO
 */
app.get('/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({
      success: true,
      time: result.rows[0]
    });
  } catch (err) {
    console.error('ERRO DB:', err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

/**
 * 🔥 ROTA ROOT
 */
app.get('/', (req, res) => {
  res.send('API OK 🚀');
});

app.get('/init-db', async (req, res) => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id SERIAL PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        senha TEXT NOT NULL,
        username TEXT UNIQUE NOT NULL,
        documento TEXT UNIQUE NOT NULL,
        tipo TEXT NOT NULL
      );
    `);

    res.send('Tabela criada com sucesso 🚀');
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});

app.use('/auth', authRoutes);
app.use('/alunos', alunosRoutes);
app.use('/usuarios', authMiddleware, usuariosRoutes);
app.use('/turmas', authMiddleware, turmasRoutes);
app.use('/inscricoes', authMiddleware, inscricoesRoutes);
app.use('/financeiro', authMiddleware, financeiroRoutes);
app.use('/presencas', authMiddleware, bloquearInadimplente, presencasRoutes);
app.use('/rachas', authMiddleware, bloquearInadimplente, rachaRoutes);
app.use('/aulas', authMiddleware, bloquearInadimplente, aulasRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});