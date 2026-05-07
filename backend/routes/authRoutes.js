import express from 'express';

import {
  register,
  login,
  esqueciSenha,
  resetarSenha
} from '../controlleres/authController.js';

const router = express.Router();

/**
 * 📌 REGISTRO
 */
router.post(

  '/register',

  async (req, res, next) => {

    try {

      const {
        email,
        senha,
        username,
        documento
      } = req.body;

      if (
        !email ||
        !senha ||
        !username ||
        !documento
      ) {

        return res.status(400).json({

          erro:
              'Preencha todos os campos obrigatórios'
        });
      }

      next();

    } catch (err) {

      console.error(
        'ERRO ROUTE REGISTER:',
        err
      );

      res.status(500).json({

        erro:
            'Erro interno'
      });
    }
  },

  register
);

/**
 * 📌 LOGIN
 */
router.post(

  '/login',

  async (req, res, next) => {

    try {

      const {
        login,
        email,
        senha
      } = req.body;

      if (
        (!login && !email) ||
        !senha
      ) {

        return res.status(400).json({

          erro:
              'Informe login/email e senha'
        });
      }

      next();

    } catch (err) {

      console.error(
        'ERRO ROUTE LOGIN:',
        err
      );

      res.status(500).json({

        erro:
            'Erro interno'
      });
    }
  },

  login
);

/**
 * 🔑 ESQUECI SENHA
 */
router.post(

  '/esqueci-senha',

  async (req, res, next) => {

    try {

      const { email } =
          req.body;

      if (!email) {

        return res.status(400).json({

          erro:
              'Informe o email'
        });
      }

      next();

    } catch (err) {

      console.error(
        'ERRO ROUTE ESQUECI SENHA:',
        err
      );

      res.status(500).json({

        erro:
            'Erro interno'
      });
    }
  },

  esqueciSenha
);

/**
 * 🔐 RESETAR SENHA
 */
router.post(

  '/resetar-senha',

  async (req, res, next) => {

    try {

      const {
        token,
        senha
      } = req.body;

      if (!token || !senha) {

        return res.status(400).json({

          erro:
              'Token e senha obrigatórios'
        });
      }

      next();

    } catch (err) {

      console.error(
        'ERRO ROUTE RESETAR SENHA:',
        err
      );

      res.status(500).json({

        erro:
            'Erro interno'
      });
    }
  },

  resetarSenha
);

export default router;