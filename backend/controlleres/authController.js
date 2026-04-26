import pool from '../src/db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET;


// 🔥 REGISTER
export const register = async (req, res) => {
  try {

    const { email, senha, username, documento, tipo, codigo } = req.body;

    let tipoFinal = tipo || 'aluno';

    const tiposValidos = ['admin', 'funcionario', 'aluno'];

    if (!tiposValidos.includes(tipoFinal)) {
      return res.status(400).send('Tipo de usuário inválido');
    }

    // 🔐 VALIDAÇÃO FUNCIONÁRIO
    if (tipoFinal === 'funcionario') {
      if (codigo !== 'ARENAMULLBEACH') {
        return res.status(403).json({ erro: 'Código inválido' });
      }
    }

    const userExiste = await pool.query(
      `SELECT * FROM usuarios 
       WHERE email = $1 OR username = $2 OR documento = $3`,
      [email, username, documento]
    );

    if (userExiste.rows.length > 0) {
      return res.status(400).send('Email, username ou CPF já cadastrados');
    }

    const hash = await bcrypt.hash(senha, 10);

    const result = await pool.query(
      `INSERT INTO usuarios (email, senha, username, documento, tipo) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING id, email, username, documento, tipo`,
      [email, hash, username, documento, tipoFinal]
    );

    res.status(201).json(result.rows[0]);

  } catch (err) {
    console.error(err);
    res.status(500).send('Erro no cadastro');
  }
};

// 🔥 LOGIN
export const login = async (req, res) => {
  try {
    const loginInput = req.body.login || req.body.email;
    const { senha } = req.body;

    const result = await pool.query(
      `SELECT * FROM usuarios 
       WHERE email = $1 
       OR username = $1 
       OR documento = $1`,
      [loginInput]
    );

    const user = result.rows[0];

    if (!user) {
      return res.status(400).send('Usuário não encontrado');
    }

    const valid = await bcrypt.compare(senha, user.senha);

    if (!valid) {
      return res.status(400).send('Senha inválida');
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
    console.error(err);
    res.status(500).send('Erro no login');
  }
};