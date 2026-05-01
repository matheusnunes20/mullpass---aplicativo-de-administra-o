import pool from '../src/db.js';


// 🔥 FINANCEIRO DO ALUNO LOGADO
export const meuFinanceiro = async (req, res) => {
  try {
    const aluno = await pool.query(
      'SELECT id FROM alunos WHERE usuario_id = $1',
      [req.user.id]
    );

    if (aluno.rows.length === 0) {
      return res.status(404).send('Aluno não encontrado');
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
    res.status(500).send('Erro ao buscar financeiro');
  }
};



// 🔥 LISTAR FINANCEIRO (ADMIN) — CORRIGIDO
export const listarFinanceiroAlunos = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        a.id,
        a.nome,
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
    res.status(500).send('Erro ao listar financeiro');
  }
};



// 🔥 PAGAR MENSALIDADE
export const pagarMensalidade = async (req, res) => {
  try {
    const { id } = req.params;

    const mensalidade = await pool.query(
      'SELECT * FROM mensalidades WHERE id = $1',
      [id]
    );

    if (mensalidade.rows.length === 0) {
      return res.status(404).send('Mensalidade não encontrada');
    }

    const jaPago = await pool.query(
      'SELECT 1 FROM pagamentos WHERE mensalidade_id = $1',
      [id]
    );

    if (jaPago.rows.length > 0) {
      return res.status(400).send('Mensalidade já paga');
    }

    await pool.query(`
      INSERT INTO pagamentos (mensalidade_id, valor_pago, data_pagamento)
      VALUES ($1, $2, NOW())
    `, [id, mensalidade.rows[0].valor]);

    res.send('Pagamento registrado');

  } catch (err) {
    console.error('💥 ERRO pagar:', err);
    res.status(500).send('Erro ao pagar mensalidade');
  }
};



// 🔥 CRIAR MENSALIDADE (SEM DUPLICAR)
export const criarMensalidade = async (req, res) => {
  try {
    const { aluno_id, data_vencimento } = req.body;

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
      return res.status(400).send('Aluno sem plano');
    }

    const valor = plano.rows[0].preco;

    await pool.query(`
      INSERT INTO mensalidades (aluno_id, valor, data_vencimento)
      VALUES ($1, $2, $3)
    `, [aluno_id, valor, data_vencimento]);

    res.status(201).send('Mensalidade criada');

  } catch (err) {
    console.error('💥 ERRO criar:', err);
    res.status(500).send('Erro ao criar mensalidade');
  }
};



// 🔥 HISTÓRICO
export const historicoAluno = async (req, res) => {
  try {
    const { id } = req.params;

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
    res.status(500).send('Erro ao buscar histórico');
  }
};