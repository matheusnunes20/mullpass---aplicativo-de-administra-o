import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cron from 'node-cron';
import pool from './db.js';

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

/**
 * 🔥 CRON
 */
cron.schedule('0 2 * * *', () => {
  console.log('Executando geração de mensalidades...');
  gerarMensalidades();
});

/**
 * 🔥 MIDDLEWARES
 */
app.use(cors({ origin: '*' }));
app.use(express.json());

/**
 * 🔥 DEBUG USER (MUITO IMPORTANTE)
 */
app.use((req, res, next) => {
  if (req.headers.authorization) {
    console.log('REQ AUTH HEADER:', req.headers.authorization);
  }
  next();
});

/**
 * 🔥 TESTE DB
 */
app.get('/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ success: true, time: result.rows[0] });
  } catch (err) {
    console.error('ERRO DB:', err.message);
    res.status(500).json({ error: err.message });
  }
});

/**
 * 🔐 ROTAS
 */
app.use('/auth', authRoutes);
app.use('/alunos', alunosRoutes);
app.use('/usuarios', authMiddleware, usuariosRoutes);
app.use('/turmas', authMiddleware, turmasRoutes);
app.use('/inscricoes', authMiddleware, inscricoesRoutes);
app.use('/financeiro', authMiddleware, financeiroRoutes);
app.use('/presencas', authMiddleware, bloquearInadimplente, presencasRoutes);
app.use('/rachas', authMiddleware, bloquearInadimplente, rachaRoutes);
app.use('/aulas', authMiddleware, bloquearInadimplente, aulasRoutes);

/**
 * 🔥 ERRO GLOBAL
 */
app.use((err, req, res, next) => {
  console.error('ERRO GLOBAL:', err.message);
  res.status(500).json({ erro: 'Erro interno do servidor' });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});