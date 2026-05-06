import express from 'express';

import {
  authMiddleware
} from '../middlewares/authMiddleware.js';

import {
  minhasNotificacoes,
  contarNotificacoes,
  marcarComoLida
} from '../controlleres/notificacaoController.js';

const router = express.Router();

/**
 * 🔔 LISTAR NOTIFICAÇÕES
 */
router.get(
  '/me',
  authMiddleware,
  minhasNotificacoes
);

/**
 * 🔔 CONTADOR BADGE
 */
router.get(
  '/contador',
  authMiddleware,
  contarNotificacoes
);

/**
 * ✅ MARCAR COMO LIDA
 */
router.put(
  '/lida',
  authMiddleware,
  marcarComoLida
);

export default router;