import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cron from 'node-cron';

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


// 🔥 CRON (financeiro automático)
cron.schedule('0 2 * * *', () => {
  console.log('⏰ Rodando rotina financeira...');
  gerarMensalidades();
});


// middlewares
app.use(cors({ origin: '*' }));
app.use(express.json());


// 🔓 ROTAS LIVRES
app.use('/auth', authRoutes);

// 🔥 MUITO IMPORTANTE → alunos tem rota pública
app.use('/alunos', alunosRoutes);


// 🔐 ROTAS PROTEGIDAS (SEM BLOQUEIO)
app.use('/usuarios', authMiddleware, usuariosRoutes);
app.use('/turmas', authMiddleware, turmasRoutes);
app.use('/inscricoes', authMiddleware, inscricoesRoutes);
app.use('/financeiro', authMiddleware, financeiroRoutes);


// 🔒 ROTAS COM BLOQUEIO FINANCEIRO
app.use('/presencas', authMiddleware, bloquearInadimplente, presencasRoutes);
app.use('/rachas', authMiddleware, bloquearInadimplente, rachaRoutes);
app.use('/aulas', authMiddleware, bloquearInadimplente, aulasRoutes);


const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor rodando na porta ${PORT} 🚀`);
});