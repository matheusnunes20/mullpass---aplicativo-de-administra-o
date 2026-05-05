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

// 🔥 IMPORTA AS DUAS FUNÇÕES
import {
  gerarMensalidades,
  atualizarStatusMensalidades
} from '../services/financeiroService.js';

dotenv.config();

const app = express();

/**
 * 🔥 DEBUG ENV
 */
console.log('JWT_SECRET:', process.env.JWT_SECRET);

/**
 * 🔥 CRON JOBS (AUTOMAÇÃO)
 */

// 💰 GERA MENSALIDADE TODO DIA 1
cron.schedule('0 2 1 * *', () => {
  console.log('🔥 Gerando mensalidades do mês...');
  gerarMensalidades();
});

// 🔔 ATUALIZA ATRASOS TODO DIA
cron.schedule('0 3 * * *', () => {
  console.log('🔔 Atualizando status de atraso...');
  atualizarStatusMensalidades();
});

/**
 * 🔥 MIDDLEWARES
 */
app.use(cors({ origin: '*' }));
app.use(express.json());

/**
 * 🔥 DEBUG AUTH
 */
app.use((req, res, next) => {
  if (req.headers.authorization) {
    console.log('REQ AUTH HEADER:', req.headers.authorization);
  }
  next();
});

/**
 * 🔥 ROOT (IMPORTANTE)
 */
app.get('/', (req, res) => {
  res.send('API OK 🚀 LOCAL');
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
  console.error(`
🔥 ERRO GLOBAL:
URL: ${req.originalUrl}
METHOD: ${req.method}
BODY: ${JSON.stringify(req.body)}
ERROR: ${err.message}
  `);

  res.status(500).json({
    erro: 'Erro interno do servidor'
  });
});

/**
 * 🚀 START SERVER
 */
const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});