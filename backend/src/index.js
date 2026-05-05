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

cron.schedule('0 2 * * *', () => {
  gerarMensalidades();
});

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
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * 🔥 INIT COMPLETO DO BANCO
 */
app.get('/init-full-db', async (req, res) => {
  try {

    await pool.query(`

    CREATE TABLE IF NOT EXISTS usuarios (
      id SERIAL PRIMARY KEY,
      email TEXT UNIQUE,
      senha TEXT,
      username TEXT UNIQUE,
      documento TEXT UNIQUE,
      tipo TEXT
    );

    CREATE TABLE IF NOT EXISTS planos (
      id SERIAL PRIMARY KEY,
      name TEXT UNIQUE,
      preco NUMERIC
    );

    CREATE TABLE IF NOT EXISTS turmas (
      id SERIAL PRIMARY KEY,
      horario VARCHAR(20) UNIQUE, -- 🔥 EVITA DUPLICAÇÃO
      limite INT,
      tipo VARCHAR(20),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS alunos (
      id SERIAL PRIMARY KEY,
      nome TEXT,
      telefone TEXT,
      status TEXT DEFAULT 'ativo',
      criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      email TEXT,
      documento TEXT,
      endereco TEXT,
      modalidade TEXT,
      dia_semana VARCHAR(50),
      horario VARCHAR(20),
      professor VARCHAR(50),
      sexo VARCHAR(20),
      usuario_id INT,
      tipo TEXT,
      plano_id INT
    );

    CREATE TABLE IF NOT EXISTS aulas (
      id SERIAL PRIMARY KEY,
      data DATE,
      horario VARCHAR(20),
      professor VARCHAR(100),
      modalidade VARCHAR(50)
    );

    CREATE TABLE IF NOT EXISTS inscricoes (
      id SERIAL PRIMARY KEY,
      aluno_id INT,
      turma_id INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS mensalidades (
      id SERIAL PRIMARY KEY,
      aluno_id INT,
      valor NUMERIC,
      data_vencimento DATE,
      data_pagamento TIMESTAMP,
      status VARCHAR(20),
      metodo_pagamento VARCHAR(20),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS pagamentos (
      id SERIAL PRIMARY KEY,
      aluno_id INT,
      valor NUMERIC,
      data_vencimento DATE,
      status TEXT,
      pago_em TIMESTAMP,
      mensalidade_id INT,
      valor_pago NUMERIC,
      data_pagamento TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS presencas (
      id SERIAL PRIMARY KEY,
      aluno_id INT,
      data DATE,
      turma_id INT
    );

    CREATE TABLE IF NOT EXISTS rachas (
      id SERIAL PRIMARY KEY,
      data DATE,
      hora VARCHAR(20),
      local VARCHAR(100),
      quadra VARCHAR(50),
      limite INT,
      tipo VARCHAR(20),
      criado_por INT
    );

    CREATE TABLE IF NOT EXISTS racha_jogadores (
      id SERIAL PRIMARY KEY,
      racha_id INT,
      aluno_id INT
    );

    CREATE TABLE IF NOT EXISTS notificacoes (
      id SERIAL PRIMARY KEY,
      aluno_id INT,
      mensagem TEXT,
      tipo TEXT,
      enviado_em TIMESTAMP
    );

    `);

    /**
     * 🔥 DADOS FIXOS (SEM DUPLICAR)
     */
    await pool.query(`
      INSERT INTO planos (name, preco) VALUES
      ('Futevôlei 2x semana', 150),
      ('Beach Tennis ilimitado', 200),
      ('Vôlei básico', 120)
      ON CONFLICT (name) DO NOTHING;
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

    res.send('🔥 BANCO CRIADO SEM DUPLICAÇÃO');

  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});

/**
 * 🔥 CORRIGIR DUPLICAÇÃO (RODAR 1 VEZ)
 */
app.get('/fix-turmas', async (req, res) => {
  try {
    await pool.query(`
      DELETE FROM turmas
      WHERE id NOT IN (
        SELECT MIN(id)
        FROM turmas
        GROUP BY horario
      );
    `);

    res.send('🔥 Turmas duplicadas removidas');
  } catch (err) {
    console.error(err);
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

const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});