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
 * 🔥 CRON JOB
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
 * 🔥 TESTE DE BANCO
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
 * 🔥 INIT DB
 */
app.get('/init-full-db', async (req, res) => {
  try {
    await pool.query(`
    CREATE TABLE IF NOT EXISTS turmas (
      id SERIAL PRIMARY KEY,
      horario VARCHAR(20) UNIQUE,
      limite INT,
      tipo VARCHAR(20),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    `);

    await pool.query(`
      INSERT INTO turmas (horario, limite, tipo) VALUES
      ('06:00-07:00', 7, 'mista'),
      ('07:00-08:00', 3, 'mista'),
      ('18:00-19:00', 6, 'feminina'),
      ('19:00-20:00', 10, 'mista'),
      ('20:00-21:00', 8, 'mista'),
      ('21:00-22:00', 6, 'mista')
      ON CONFLICT (horario) DO NOTHING;
    `);

    console.log('Banco inicializado com sucesso');

    res.send('🔥 BANCO OK');
  } catch (err) {
    console.error('ERRO INIT:', err.message);
    res.status(500).send(err.message);
  }
});

/**
 * 🔥 ROOT
 */
app.get('/', (req, res) => {
  res.send('API OK 🚀');
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
  console.log(`Servidor rodando na porta ${PORT}`);
});