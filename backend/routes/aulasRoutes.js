import express from 'express';
import {
  criarAula,
  listarAulas,
  deletarAula
} from '../controlleres/aulasController.js';

import { authMiddleware } from '../middlewares/authMiddleware.js';
import { permit } from '../middlewares/roleMiddleware.js';

const router = express.Router();

// 📌 LISTAR AULAS
router.get('/', authMiddleware, listarAulas);

// 📌 CRIAR AULA
router.post(
  '/',
  authMiddleware,
  permit('funcionario', 'admin'),
  async (req, res, next) => {
    try {
      const { data, horario, professor, modalidade } = req.body;

      if (!data || !horario || !professor) {
        return res.status(400).json({
          erro: 'Campos obrigatórios: data, horario, professor'
        });
      }

      next(); // passa para o controller
    } catch (err) {
      console.error('ERRO ROUTE AULA:', err);
      res.status(500).json({ erro: 'Erro interno' });
    }
  },
  criarAula
);

// 📌 DELETAR AULA
router.delete(
  '/:id',
  authMiddleware,
  permit('admin'),
  async (req, res, next) => {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ erro: 'ID obrigatório' });
      }

      next();
    } catch (err) {
      console.error('ERRO DELETE AULA:', err);
      res.status(500).json({ erro: 'Erro interno' });
    }
  },
  deletarAula
);

export default router;