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
import notificacaoRoutes from '../routes/notificacaoRoutes.js';

import {
  bloquearInadimplente
} from '../middlewares/financeiroMiddleware.js';

import {
  authMiddleware
} from '../middlewares/authMiddleware.js';

import {
  gerarMensalidades,
  atualizarStatusMensalidades
} from '../services/financeiroService.js';

import {
  gerarNotificacoesAutomaticas
} from '../services/notificacaoService.js';

dotenv.config();

const app = express();

/**
 * 🚀 DEBUG ENV
 */
console.log(
  'NODE_ENV:',
  process.env.NODE_ENV
);

console.log(
  'DATABASE_URL:',
  process.env.DATABASE_URL
      ? 'OK'
      : 'NÃO CONFIGURADA'
);

console.log(
  'JWT_SECRET:',
  process.env.JWT_SECRET
      ? 'OK'
      : 'NÃO CONFIGURADO'
);

/**
 * 🚀 MIDDLEWARES
 */
app.use(cors({
  origin: '*'
}));

app.use(express.json());

/**
 * 🚀 DEBUG AUTH
 */
app.use((req, res, next) => {

  if (req.headers.authorization) {

    console.log(
      'REQ AUTH HEADER:',
      req.headers.authorization
    );
  }

  next();
});

/**
 * 🚀 ROOT
 */
app.get('/', (req, res) => {

  res.send(
    '🚀 API ARENA MULL ONLINE'
  );
});

/**
 * 🚀 TESTE DB
 */
app.get('/test-db', async (req, res) => {

  try {

    const result =
        await pool.query(
          'SELECT NOW()'
        );

    res.json({

      success: true,

      time:
          result.rows[0],
    });

  } catch (err) {

    console.error(
      'ERRO DB:',
      err.message
    );

    res.status(500).json({

      erro:
          err.message,
    });
  }
});

/**
 * 🔐 ROTAS
 */
app.use(
  '/auth',
  authRoutes
);

app.use(
  '/alunos',
  alunosRoutes
);

app.use(
  '/usuarios',
  authMiddleware,
  usuariosRoutes
);

app.use(
  '/turmas',
  authMiddleware,
  turmasRoutes
);

app.use(
  '/inscricoes',
  authMiddleware,
  inscricoesRoutes
);

app.use(
  '/financeiro',
  authMiddleware,
  financeiroRoutes
);

app.use(
  '/notificacoes',
  authMiddleware,
  notificacaoRoutes
);

app.use(
  '/presencas',
  authMiddleware,
  bloquearInadimplente,
  presencasRoutes
);

app.use(
  '/rachas',
  authMiddleware,
  bloquearInadimplente,
  rachaRoutes
);

app.use(
  '/aulas',
  authMiddleware,
  bloquearInadimplente,
  aulasRoutes
);

/**
 * 🚀 CRON JOBS
 */

/**
 * 💰 GERA MENSALIDADES
 * TODO DIA 1 ÀS 02:00
 */
cron.schedule(
  '0 2 1 * *',
  async () => {

    console.log(
      '💰 Gerando mensalidades...'
    );

    try {

      await gerarMensalidades();

      console.log(
        '✅ Mensalidades geradas'
      );

    } catch (err) {

      console.error(
        'ERRO CRON MENSALIDADES:',
        err.message
      );
    }
  }
);

/**
 * 🔴 ATUALIZA ATRASOS
 * TODO DIA ÀS 03:00
 */
cron.schedule(
  '0 3 * * *',
  async () => {

    console.log(
      '🔴 Atualizando atrasos...'
    );

    try {

      await atualizarStatusMensalidades();

      console.log(
        '✅ Status atualizados'
      );

    } catch (err) {

      console.error(
        'ERRO CRON ATRASOS:',
        err.message
      );
    }
  }
);

/**
 * 🔔 NOTIFICAÇÕES AUTOMÁTICAS
 * TODO DIA ÀS 09:00
 */
cron.schedule(
  '0 9 * * *',
  async () => {

    console.log(
      '🔔 Gerando notificações...'
    );

    try {

      await gerarNotificacoesAutomaticas();

      console.log(
        '✅ Notificações geradas'
      );

    } catch (err) {

      console.error(
        'ERRO CRON NOTIFICAÇÕES:',
        err.message
      );
    }
  }
);

/**
 * 🚨 ERRO GLOBAL
 */
app.use((err, req, res, next) => {

  console.error(`

🚨 ERRO GLOBAL
URL: ${req.originalUrl}
METHOD: ${req.method}
BODY: ${JSON.stringify(req.body)}
ERROR: ${err.message}

`);

  res.status(500).json({

    erro:
        'Erro interno do servidor',
  });
});

/**
 * 🚀 START SERVER
 */
const PORT =
    process.env.PORT || 3000;

app.listen(
  PORT,
  '0.0.0.0',
  () => {

    console.log(`
🚀 SERVIDOR ONLINE
PORTA: ${PORT}
`);
  }
);

app.get('/debug-colunas', async (req, res) => {

  try {

    const result = await pool.query(`

      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'notificacoes'

    `);

    res.json(result.rows);

  } catch (err) {

    res.status(500).json({
      erro: err.message
    });
  }
});