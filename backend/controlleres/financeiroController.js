import pool from '../src/db.js';

/**
 * 📌 MEU FINANCEIRO
 */
export const meuFinanceiro = async (req, res) => {
  try {
    const aluno = await pool.query(
      'SELECT id FROM alunos WHERE usuario_id = $1',
      [req.user.id]
    );

    if (aluno.rows.length === 0) {
      return res.status(404).json({ erro: 'Aluno não encontrado' });
    }

    const result = await pool.query(`
      SELECT 
        m.id,
        COALESCE(m.valor, 0) as valor,
        m.data_vencimento,
        p.name as plano,

        CASE
          WHEN m.id IS NULL THEN 'sem_mensalidade'
          WHEN EXISTS (
            SELECT 1 FROM pagamentos pg 
            WHERE pg.mensalidade_id = m.id
          ) THEN 'pago'
          WHEN m.data_vencimento < CURRENT_DATE THEN 'atrasado'
          ELSE 'pendente'
        END as status

      FROM alunos a
      JOIN planos p ON p.id = a.plano_id

      LEFT JOIN LATERAL (
        SELECT *
        FROM mensalidades m
        WHERE m.aluno_id = a.id
        ORDER BY m.data_vencimento DESC
        LIMIT 1
      ) m ON true

      WHERE a.id = $1
    `, [aluno.rows[0].id]);

    const r = result.rows[0];

    if (!r || !r.id) {
      return res.json({
        status: 'sem_mensalidade',
        valor: 0,
        plano: r?.plano || '-',
        data_vencimento: null
      });
    }

    res.json({
      id: r.id,
      valor: Number(r.valor),
      data_vencimento: r.data_vencimento,
      plano: r.plano,
      status: r.status
    });

  } catch (err) {
    console.error('💥 ERRO /me:', err);
    res.status(500).json({ erro: err.message });
  }
};

/**
 * 📌 LISTAR FINANCEIRO DE TODOS
 */
export const listarFinanceiroAlunos = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        a.id,
        a.nome,
        COALESCE(a.telefone, '') as telefone,
        p.name as plano,
        m.id as mensalidade_id,
        COALESCE(m.valor, 0) as valor,
        m.data_vencimento,

        CASE
          WHEN m.id IS NULL THEN 'sem_mensalidade'
          WHEN EXISTS (
            SELECT 1 FROM pagamentos pg 
            WHERE pg.mensalidade_id = m.id
          ) THEN 'pago'
          WHEN m.data_vencimento < CURRENT_DATE THEN 'atrasado'
          ELSE 'pendente'
        END as status

      FROM alunos a
      JOIN planos p ON p.id = a.plano_id

      LEFT JOIN LATERAL (
        SELECT *
        FROM mensalidades m
        WHERE m.aluno_id = a.id
        ORDER BY m.data_vencimento DESC
        LIMIT 1
      ) m ON true

      ORDER BY a.nome
    `);

    res.json(result.rows);

  } catch (err) {
    console.error('💥 ERRO /alunos:', err);
    res.status(500).json({ erro: err.message });
  }
};

/**
 * 📌 PAGAR MENSALIDADE
 */
export const pagarMensalidade = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);

    if (!id) {
      return res.status(400).json({ erro: 'ID inválido' });
    }

    const mensalidade = await pool.query(
      'SELECT * FROM mensalidades WHERE id = $1',
      [id]
    );

    if (mensalidade.rows.length === 0) {
      return res.status(404).json({ erro: 'Mensalidade não encontrada' });
    }

    const jaPago = await pool.query(
      'SELECT 1 FROM pagamentos WHERE mensalidade_id = $1',
      [id]
    );

    if (jaPago.rows.length > 0) {
      return res.status(400).json({ erro: 'Mensalidade já paga' });
    }

    await pool.query(`
      INSERT INTO pagamentos (mensalidade_id, valor_pago, data_pagamento)
      VALUES ($1, $2, NOW())
    `, [id, mensalidade.rows[0].valor]);

    res.json({ mensagem: 'Pagamento registrado com sucesso' });

  } catch (err) {
    console.error('💥 ERRO pagar:', err);
    res.status(500).json({ erro: err.message });
  }
};

/**
 * 📌 CRIAR MENSALIDADE
 */
export const criarMensalidade = async (req, res) => {
  try {
    const { aluno_id, data_vencimento } = req.body;

    if (!aluno_id || !data_vencimento) {
      return res.status(400).json({
        erro: 'aluno_id e data_vencimento são obrigatórios'
      });
    }

    const existe = await pool.query(`
      SELECT 1 FROM mensalidades
      WHERE aluno_id = $1
      AND DATE_TRUNC('month', data_vencimento) = DATE_TRUNC('month', $2::date)
    `, [aluno_id, data_vencimento]);

    if (existe.rows.length > 0) {
      return res.status(400).json({
        erro: 'Aluno já possui mensalidade neste mês'
      });
    }

    const plano = await pool.query(`
      SELECT p.preco
      FROM alunos a
      JOIN planos p ON p.id = a.plano_id
      WHERE a.id = $1
    `, [aluno_id]);

    if (plano.rows.length === 0) {
      return res.status(400).json({ erro: 'Aluno sem plano' });
    }

    const valor = plano.rows[0].preco;

    await pool.query(`
      INSERT INTO mensalidades (aluno_id, valor, data_vencimento)
      VALUES ($1, $2, $3)
    `, [aluno_id, valor, data_vencimento]);

    res.status(201).json({
      mensagem: 'Mensalidade criada com sucesso'
    });

  } catch (err) {
    console.error('💥 ERRO criar:', err);
    res.status(500).json({ erro: err.message });
  }
};

/**
 * 📌 HISTÓRICO DO ALUNO
 */
export const historicoAluno = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);

    if (!id) {
      return res.status(400).json({ erro: 'ID inválido' });
    }

    const result = await pool.query(`
      SELECT 
        m.*,
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
    `, [id]);

    res.json(result.rows);

  } catch (err) {
    console.error('💥 ERRO histórico:', err);
    res.status(500).json({ erro: err.message });
  }
};

/**
 * 📌 HISTÓRICO DO PRÓPRIO USUÁRIO
 */
export const meuHistoricoFinanceiro = async (req, res) => {
  try {
    const usuarioId = req.user.id;

    const aluno = await pool.query(
      `SELECT id FROM alunos WHERE usuario_id = $1`,
      [usuarioId]
    );

    if (aluno.rows.length === 0) {
      return res.status(404).json({ erro: 'Aluno não encontrado' });
    }

    const alunoId = aluno.rows[0].id;

    const result = await pool.query(`
      SELECT 
        m.id,
        m.valor,
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
    `, [alunoId]);

    res.json(result.rows);

  } catch (err) {
    console.error('ERRO HISTORICO FINANCEIRO:', err);
    res.status(500).json({ erro: err.message });
  }
};

/**
 * 📊 RELATÓRIO
 */
export const relatorioFinanceiro = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        CASE
          WHEN EXISTS (
            SELECT 1 FROM pagamentos pg 
            WHERE pg.mensalidade_id = m.id
          ) THEN 'pago'
          WHEN m.data_vencimento < CURRENT_DATE THEN 'atrasado'
          ELSE 'pendente'
        END as status,
        COUNT(*) as total,
        SUM(valor) as valor_total
      FROM mensalidades m
      GROUP BY status
    `);

    const totalMes = await pool.query(`
      SELECT SUM(valor) as total
      FROM pagamentos
      WHERE DATE_TRUNC('month', data_pagamento) = DATE_TRUNC('month', CURRENT_DATE)
    `);

    res.json({
      por_status: result.rows,
      faturamento_mes: totalMes.rows[0].total || 0
    });

  } catch (err) {
    console.error('ERRO RELATORIO:', err);
    res.status(500).json({ erro: err.message });
  }
};

/**
 * 🔴 INADIMPLENTES (COM TELEFONE)
 */
export const listarInadimplentes = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        a.id,
        a.nome,
        COALESCE(a.telefone, '') as telefone,
        m.data_vencimento,
        CURRENT_DATE - m.data_vencimento AS dias_atraso
      FROM mensalidades m
      JOIN alunos a ON a.id = m.aluno_id
      WHERE m.data_vencimento < CURRENT_DATE
      AND NOT EXISTS (
        SELECT 1 FROM pagamentos pg
        WHERE pg.mensalidade_id = m.id
      )
      ORDER BY dias_atraso DESC
    `);

    res.json(result.rows);

  } catch (err) {
    console.error('ERRO INADIMPLENTES:', err);
    res.status(500).json({ erro: err.message });
  }
};