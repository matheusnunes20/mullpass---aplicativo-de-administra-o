import pool from '../src/db.js';


// 🔥 CONFIRMAR PRESENÇA
export const confirmarPresenca = async (req, res) => {
  try {
    const { aluno_id } = req.body;

    if (!aluno_id) {
      return res.status(400).send('aluno_id obrigatório');
    }

    // 🔥 EVITA DUPLICAR NO MESMO DIA
    const existe = await pool.query(
      `SELECT * FROM presencas 
       WHERE aluno_id = $1 
       AND DATE(data) = CURRENT_DATE`,
      [aluno_id]
    );

    if (existe.rows.length > 0) {
      return res.status(400).send('Presença já confirmada hoje');
    }

    const result = await pool.query(
      `INSERT INTO presencas (aluno_id, data)
       VALUES ($1, NOW())
       RETURNING *`,
      [aluno_id]
    );

    res.status(201).json(result.rows[0]);

  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao registrar presença');
  }
};


// 🔥 REMOVER PRESENÇA (SÓ DO DIA ATUAL)
export const removerPresenca = async (req, res) => {
  try {
    const { aluno_id } = req.params;

    const result = await pool.query(
      `DELETE FROM presencas
       WHERE aluno_id = $1
       AND DATE(data) = CURRENT_DATE
       RETURNING *`,
      [aluno_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).send('Nenhuma presença hoje para remover');
    }

    res.status(200).send('Presença removida');

  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao remover presença');
  }
};


// 🔥 VERIFICAR SE JÁ CONFIRMOU HOJE
export const verificarPresencaHoje = async (req, res) => {
  try {

    const result = await pool.query(
      `SELECT p.* FROM presencas p
       JOIN alunos a ON a.id = p.aluno_id
       WHERE a.usuario_id = $1
       AND DATE(p.data) = CURRENT_DATE`,
      [req.user.id]
    );

    res.json({
      confirmou: result.rows.length > 0
    });

  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao verificar presença');
  }
};


// 🔥 STATUS DE FREQUÊNCIA (O MAIS IMPORTANTE)
export const statusFrequencia = async (req, res) => {
  try {

    // 🔥 pega aluno
    const alunoResult = await pool.query(
      `SELECT * FROM alunos WHERE usuario_id = $1`,
      [req.user.id]
    );

    if (alunoResult.rows.length === 0) {
      return res.status(404).send('Aluno não encontrado');
    }

    const aluno = alunoResult.rows[0];

    // 🔥 presenças últimos 30 dias
    const presencasResult = await pool.query(
      `SELECT COUNT(*) FROM presencas
       WHERE aluno_id = $1
       AND data >= NOW() - INTERVAL '30 days'`,
      [aluno.id]
    );

    const totalPresencas = parseInt(presencasResult.rows[0].count);

    // 🔥 SIMPLES (depois melhoramos com dias reais)
    const totalAulas = 8;

    const percentual = totalPresencas / totalAulas;

    let status = 'ausente';

    if (percentual >= 0.8) {
      status = 'frequente';
    } else if (percentual >= 0.5) {
      status = 'irregular';
    }

    res.json({
      presencas: totalPresencas,
      percentual,
      status
    });

  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao calcular status');
  }
};


export const statusPorAluno = async (req, res) => {
  try {
    const { id } = req.params;

    const presencasResult = await pool.query(
      `SELECT COUNT(*) FROM presencas
       WHERE aluno_id = $1
       AND data >= NOW() - INTERVAL '30 days'`,
      [id]
    );

    const totalPresencas = parseInt(presencasResult.rows[0].count);

    // simples por enquanto
    const totalAulas = 8;
    const percentual = totalPresencas / totalAulas;

    let status = 'ausente';

    if (percentual >= 0.8) status = 'frequente';
    else if (percentual >= 0.5) status = 'irregular';

    res.json({ status, percentual, presencas: totalPresencas });

  } catch (err) {
    res.status(500).send('Erro ao calcular status');
  }
};