import pool from '../src/db.js';

export const bloquearInadimplente = async (req, res, next) => {
  try {
    // 🔥 só bloqueia aluno
    if (req.user.tipo !== 'aluno') return next();

    const usuarioId = parseInt(req.user.id, 10);

    if (!usuarioId) return next();

    // 🔍 pega aluno
    const aluno = await pool.query(
      'SELECT id FROM alunos WHERE usuario_id = $1',
      [usuarioId]
    );

    if (aluno.rows.length === 0) return next();

    const alunoId = aluno.rows[0].id;

    // 🔍 pega última mensalidade + status REAL
    const mensalidade = await pool.query(`
      SELECT 
        m.id,
        m.data_vencimento,

        CASE
          WHEN EXISTS (
            SELECT 1 FROM pagamentos pg
            WHERE pg.mensalidade_id = m.id
          ) THEN 'pago'
          WHEN m.data_vencimento < CURRENT_DATE THEN 'atrasado'
          ELSE 'pendente'
        END as status

      FROM mensalidades m
      WHERE m.aluno_id = $1
      ORDER BY m.data_vencimento DESC
      LIMIT 1
    `, [alunoId]);

    // 🔥 se não tem mensalidade → bloqueia
    if (mensalidade.rows.length === 0) {
      return res.status(402).json({
        bloqueado: true,
        mensagem: 'Sem mensalidade ativa'
      });
    }

    const status = mensalidade.rows[0].status;

    if (status === 'atrasado') {
      return res.status(402).json({
        bloqueado: true,
        mensagem: 'Vá até a recepção e renove sua mensalidade'
      });
    }

    next();

  } catch (err) {
    console.error('ERRO FINANCEIRO:', err);

    res.status(500).json({
      erro: err.message
    });
  }
};