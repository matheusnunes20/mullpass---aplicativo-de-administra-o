import {
  criarRacha,
  listarRachas,
  entrarRacha,
  listarJogadoresRacha // 🔥 ADICIONA AQUI
} from '../controlleres/rachaController.js';

import { authMiddleware } from '../middlewares/authMiddleware.js';
import { permit } from '../middlewares/roleMiddleware.js';
import express from 'express';


const router = express.Router();

// 🔥 LISTAR (qualquer logado)
router.get('/', authMiddleware, listarRachas);

// 🔥 CRIAR (só funcionário)
router.post('/', authMiddleware, permit('funcionario', 'admin'), criarRacha);

// 🔥 ENTRAR (só aluno)
router.post('/entrar', authMiddleware, permit('aluno'), entrarRacha);

// 🔥 LISTAR (só jogadores)
router.get('/:id/jogadores', authMiddleware, listarJogadoresRacha);

export default router;