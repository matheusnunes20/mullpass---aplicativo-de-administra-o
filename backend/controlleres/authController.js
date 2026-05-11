import pool from '../src/db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { Resend } from 'resend';

const SECRET =
    process.env.JWT_SECRET;

/**
 * 📧 RESEND
 */
const resend =
    new Resend(
      process.env.RESEND_API_KEY
    );

/**
 * 📌 REGISTER
 */
export const register = async (req, res) => {

  try {

    let {
      email,
      senha,
      username,
      documento,
      tipo,
      codigo
    } = req.body;

    /**
     * 🔥 NORMALIZAÇÃO
     */
    email =
        String(email)
            .trim()
            .toLowerCase();

    username =
        String(username)
            .trim();

    documento =
        String(documento)
            .trim();

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

    let tipoFinal =
        tipo || 'aluno';

    const tiposValidos = [

      'admin',
      'funcionario',
      'aluno'
    ];

    if (
      !tiposValidos.includes(
        tipoFinal
      )
    ) {

      return res.status(400).json({

        erro:
            'Tipo de usuário inválido'
      });
    }

    /**
     * 🔥 FUNCIONÁRIO
     */
    if (
      tipoFinal === 'funcionario'
    ) {

      if (
        !codigo ||
        !process.env.CODIGO_FUNC_HASH
      ) {

        return res.status(403).json({

          erro:
              'Código inválido'
        });
      }

      const codigoValido =
          await bcrypt.compare(

        String(codigo),

        process.env.CODIGO_FUNC_HASH
      );

      if (!codigoValido) {

        return res.status(403).json({

          erro:
              'Código inválido'
        });
      }
    }

    /**
     * 🔍 DUPLICIDADE
     */
    const userExiste =
        await pool.query(

      `
      SELECT id
      FROM usuarios
      WHERE email = $1
      OR username = $2
      OR documento = $3
      `,

      [
        email,
        username,
        documento
      ]
    );

    if (
      userExiste.rows.length > 0
    ) {

      return res.status(400).json({

        erro:
            'Email, username ou CPF já cadastrados'
      });
    }

    /**
     * 🔐 SENHA
     */
    const senhaLimpa =
        String(senha).trim();

    if (
      senhaLimpa.length < 4
    ) {

      return res.status(400).json({

        erro:
            'Senha muito curta'
      });
    }

    const hash =
        await bcrypt.hash(
          senhaLimpa,
          10
        );

    /**
     * 👤 INSERT
     */
    const result =
        await pool.query(

      `
      INSERT INTO usuarios
      (
        email,
        senha,
        username,
        documento,
        tipo
      )
      VALUES
      (
        $1,
        $2,
        $3,
        $4,
        $5
      )
      RETURNING
      id,
      email,
      username,
      documento,
      tipo
      `,

      [
        email,
        hash,
        username,
        documento,
        tipoFinal
      ]
    );

    res.status(201).json(
      result.rows[0]
    );

  } catch (err) {

    console.error(
      'ERRO REGISTER:',
      err
    );

    res.status(500).json({

      erro:
          err.message
    });
  }
};

/**
 * 📌 LOGIN
 */
export const login = async (req, res) => {

  try {

    const loginInputRaw =
        req.body.login ||
        req.body.email;

    const senha =
        String(
          req.body.senha || ''
        );

    if (
      !loginInputRaw ||
      !senha
    ) {

      return res.status(400).json({

        erro:
            'Login/email e senha são obrigatórios'
      });
    }

    const loginInput =
        String(loginInputRaw)
            .trim()
            .toLowerCase();

    const result =
        await pool.query(

      `
      SELECT
        id,
        email,
        username,
        documento,
        senha,
        tipo
      FROM usuarios
      WHERE email = $1
      OR username = $1
      OR documento = $1
      `,

      [loginInput]
    );

    const user =
        result.rows[0];

    if (!user) {

      return res.status(401).json({

        erro:
            'Usuário não encontrado'
      });
    }

    const valid =
        await bcrypt.compare(
          senha,
          user.senha
        );

    if (!valid) {

      return res.status(401).json({

        erro:
            'Senha inválida'
      });
    }

    const token =
        jwt.sign(

      {
        id: user.id,
        tipo: user.tipo
      },

      SECRET,

      {
        expiresIn: '1d'
      }
    );

    res.json({

      token
    });

  } catch (err) {

    console.error(
      'ERRO LOGIN:',
      err
    );

    res.status(500).json({

      erro:
          err.message
    });
  }
};

/**
 * 🔑 ESQUECI SENHA
 */
export const esqueciSenha = async (req, res) => {

  try {

    const { email } = req.body;

    if (!email) {

      return res.status(400).json({

        erro:
            'Email obrigatório'
      });
    }

    const userResult =
        await pool.query(

      `
      SELECT
        id,
        email
      FROM usuarios
      WHERE email = $1
      `,

      [
        email
            .toLowerCase()
            .trim()
      ]
    );

    if (
      userResult.rows.length === 0
    ) {

      return res.status(404).json({

        erro:
            'Usuário não encontrado'
      });
    }

    const user =
        userResult.rows[0];

    /**
     * 🔥 TOKEN
     */
    const token =
        crypto
            .randomBytes(32)
            .toString('hex');

    /**
     * 🔒 HASH TOKEN
     */
    const tokenHash =
        crypto
            .createHash('sha256')
            .update(token)
            .digest('hex');

    /**
     * ⏰ EXPIRAÇÃO
     */
    const expira =
        new Date(
          Date.now() + 3600000
        );

    await pool.query(

      `
      UPDATE usuarios
      SET
        reset_token = $1,
        reset_token_expira = $2
      WHERE id = $3
      `,

      [
        tokenHash,
        expira,
        user.id
      ]
    );

    /**
     * 🔗 LINK
     */
    const link =

      `${process.env.FRONTEND_URL}/resetar-senha/${token}`;

    /**
     * 📧 EMAIL
     */
    await resend.emails.send({

      from:
          'onboarding@resend.dev',

      to:
          user.email,

      subject:
          'Recuperação de senha',

      html: `

        <h2>
          Recuperação de senha
        </h2>

        <p>
          Clique abaixo:
        </p>

        <a href="${link}">
          Redefinir senha
        </a>
      `,
    });

    res.json({

      mensagem:
          'Email enviado'
    });

  } catch (err) {

    console.error(
      'ERRO EMAIL:',
      err
    );

    res.status(500).json({

      erro:
          err.message
    });
  }
};

/**
 * 🔐 RESETAR SENHA
 */
export const resetarSenha = async (req, res) => {

  try {

    const {
      token,
      senha
    } = req.body;

    if (
      !token ||
      !senha
    ) {

      return res.status(400).json({

        erro:
            'Dados inválidos'
      });
    }

    /**
     * 🔒 HASH TOKEN
     */
    const tokenHash =
        crypto
            .createHash('sha256')
            .update(token)
            .digest('hex');

    /**
     * 🔐 VALIDA SENHA
     */
    if (senha.length < 4) {

      return res.status(400).json({

        erro:
            'Senha muito curta'
      });
    }

    const result =
        await pool.query(

      `
      SELECT id
      FROM usuarios
      WHERE reset_token = $1
      AND reset_token_expira > NOW()
      `,

      [tokenHash]
    );

    if (
      result.rows.length === 0
    ) {

      return res.status(400).json({

        erro:
            'Token inválido'
      });
    }

    const user =
        result.rows[0];

    const hash =
        await bcrypt.hash(
          senha,
          10
        );

    await pool.query(

      `
      UPDATE usuarios
      SET
        senha = $1,
        reset_token = NULL,
        reset_token_expira = NULL
      WHERE id = $2
      `,

      [
        hash,
        user.id
      ]
    );

    res.json({

      mensagem:
          'Senha alterada'
    });

  } catch (err) {

    console.error(
      'ERRO RESET:',
      err
    );

    res.status(500).json({

      erro:
          err.message
    });
  }
};