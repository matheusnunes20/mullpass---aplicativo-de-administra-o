import pool from '../src/db.js';

export const bloquearInadimplente = async (req, res, next) => {
  try {
    if (req.user.tipo !== 'aluno') return next();

    const aluno = await pool.query(
      'SELECT id FROM alunos WHERE usuario_id = $1',
      [req.user.id]
    );

    if (aluno.rows.length === 0) return next();

    const mensalidade = await pool.query(`
      SELECT 
        CASE
          WHEN data_pagamento IS NOT NULL THEN 'pago'
          WHEN data_vencimento < CURRENT_DATE THEN 'atrasado'
          ELSE 'pendente'
        END as status
      FROM mensalidades
      WHERE aluno_id = $1
      ORDER BY data_vencimento DESC
      LIMIT 1
    `, [aluno.rows[0].id]);

    const status = mensalidade.rows[0]?.status;

    if (status === 'atrasado') {
      return res.status(402).json({
        bloqueado: true,
        mensagem: 'Vá até a recepção e renove sua mensalidade'
      });
    }

    next();

  } catch (err) {
    console.error(err);
    res.status(500).send('Erro financeiro');
  }
};