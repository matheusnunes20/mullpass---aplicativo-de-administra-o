import pool from '../src/db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET;

/**
 * 📌 REGISTER
 */
export const register = async (req, res) => {
  try {

    let { email, senha, username, documento, tipo, codigo } = req.body;

    // 🔥 NORMALIZAÇÃO
    email = String(email).trim().toLowerCase();
    username = String(username).trim();
    documento = String(documento).trim();

    if (!email || !senha || !username || !documento) {
      return res.status(400).json({
        erro: 'Preencha todos os campos obrigatórios'
      });
    }

    let tipoFinal = tipo || 'aluno';

    const tiposValidos = ['admin', 'funcionario', 'aluno'];

    if (!tiposValidos.includes(tipoFinal)) {
      return res.status(400).json({
        erro: 'Tipo de usuário inválido'
      });
    }

    // 🔥 VALIDAÇÃO FUNCIONÁRIO
    if (tipoFinal === 'funcionario') {
      const codigoValido =
    await bcrypt.compare(
      codigo,
      process.env.CODIGO_FUNC_HASH
    );

      if (!codigoValido) {

        return res.status(403).json({
          erro: 'Código inválido'
        });
      } {
        return res.status(403).json({
          erro: 'Código inválido'
        });
      }
    }

    // 🔍 VERIFICA DUPLICIDADE
    const userExiste = await pool.query(
      `SELECT id FROM usuarios 
       WHERE email = $1 OR username = $2 OR documento = $3`,
      [email, username, documento]
    );

    if (userExiste.rows.length > 0) {
      return res.status(400).json({
        erro: 'Email, username ou CPF já cadastrados'
      });
    }

    // 🔐 SENHA
    const senhaLimpa = String(senha).trim();

    if (senhaLimpa.length < 4) {
      return res.status(400).json({
        erro: 'Senha muito curta'
      });
    }

    const hash = await bcrypt.hash(senhaLimpa, 10);

    const result = await pool.query(
      `INSERT INTO usuarios (email, senha, username, documento, tipo) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING id, email, username, documento, tipo`,
      [email, hash, username, documento, tipoFinal]
    );

    res.status(201).json(result.rows[0]);

  } catch (err) {
    console.error('ERRO REGISTER:', err);

    res.status(500).json({
      erro: err.message
    });
  }
};

/**
 * 📌 LOGIN
 */
export const login = async (req, res) => {
  try {

    const SECRET = process.env.JWT_SECRET || '123456'; // 🔥 CORREÇÃO

    const loginInputRaw = req.body.login || req.body.email;
    const senha = String(req.body.senha || '');

    if (!loginInputRaw || !senha) {
      return res.status(400).json({
        erro: 'Login/email e senha são obrigatórios'
      });
    }

    const loginInput = String(loginInputRaw).trim().toLowerCase();

    const result = await pool.query(
      `SELECT id, email, username, documento, senha, tipo 
       FROM usuarios 
       WHERE email = $1 
       OR username = $1 
       OR documento = $1`,
      [loginInput]
    );

    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({
        erro: 'Usuário não encontrado'
      });
    }

    const valid = await bcrypt.compare(senha, user.senha);

    if (!valid) {
      return res.status(401).json({
        erro: 'Senha inválida'
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        tipo: user.tipo
      },
      SECRET,
      { expiresIn: '1d' }
    );

    res.json({ token });

  } catch (err) {
    console.error('ERRO LOGIN:', err);

    res.status(500).json({
      erro: err.message
    });
  }
};