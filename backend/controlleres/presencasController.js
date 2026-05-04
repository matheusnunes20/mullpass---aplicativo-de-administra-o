import pool from '../src/db.js';

// 🔥 LISTAR TODAS TURMAS
export const listarTurmas = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, horario, limite
      FROM turmas
      ORDER BY horario
    `);

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao buscar turmas' });
  }
};

// 🔥 MINHA TURMA
export const minhaTurma = async (req, res) => {
  try {
    const usuarioId = parseInt(req.user.id);

    const result = await pool.query(
      `SELECT * FROM alunos WHERE usuario_id = $1`,
      [usuarioId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ erro: 'Aluno não encontrado' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao buscar aluno' });
  }
};

// 🔥 CONFIRMAR PRESENÇA
export const confirmarPresenca = async (req, res) => {
  try {
    const usuarioId = parseInt(req.user.id);
    const { turma_id } = req.body;

    if (!turma_id) {
      return res.status(400).json({ erro: 'Turma obrigatória' });
    }

    const alunoResult = await pool.query(
      `SELECT id FROM alunos WHERE usuario_id = $1`,
      [usuarioId]
    );

    if (alunoResult.rows.length === 0) {
      return res.status(404).json({ erro: 'Aluno não encontrado' });
    }

    const alunoId = alunoResult.rows[0].id;

    const turmaResult = await pool.query(
      `SELECT id, limite FROM turmas WHERE id = $1`,
      [turma_id]
    );

    if (turmaResult.rows.length === 0) {
      return res.status(400).json({ erro: 'Turma inválida' });
    }

    const turma = turmaResult.rows[0];

    await pool.query(
      `DELETE FROM presencas
       WHERE aluno_id = $1
       AND DATE(data) = CURRENT_DATE`,
      [alunoId]
    );

    const count = await pool.query(
      `SELECT COUNT(DISTINCT aluno_id) FROM presencas
       WHERE turma_id = $1
       AND DATE(data) = CURRENT_DATE`,
      [turma_id]
    );

    const total = parseInt(count.rows[0].count);

    if (total >= turma.limite) {
      return res.status(400).json({ erro: 'Turma cheia' });
    }

    const result = await pool.query(
      `INSERT INTO presencas (aluno_id, turma_id, data)
       VALUES ($1, $2, NOW())
       RETURNING *`,
      [alunoId, turma_id]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('ERRO REAL:', err);
    res.status(500).json({ erro: err.message });
  }
};

// 🔥 REMOVER PRESENÇA
export const removerPresenca = async (req, res) => {
  try {
    const usuarioId = parseInt(req.user.id);

    const alunoResult = await pool.query(
      `SELECT id FROM alunos WHERE usuario_id = $1`,
      [usuarioId]
    );

    if (alunoResult.rows.length === 0) {
      return res.status(404).json({ erro: 'Aluno não encontrado' });
    }

    const alunoId = alunoResult.rows[0].id;

    const result = await pool.query(
      `DELETE FROM presencas
       WHERE aluno_id = $1
       AND DATE(data) = CURRENT_DATE
       RETURNING *`,
      [alunoId]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ erro: 'Nenhuma presença hoje' });
    }

    res.json({ mensagem: 'Presença removida com sucesso' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao remover presença' });
  }
};

// 🔥 LISTAR PRESENÇA POR TURMA
export const listarPresencaPorTurma = async (req, res) => {
  try {
    const { turma_id } = req.params;

    const result = await pool.query(`
      SELECT 
        a.id,
        a.nome,
        a.telefone,
        p.data
      FROM presencas p
      JOIN alunos a ON a.id = p.aluno_id
      WHERE p.turma_id = $1
      AND DATE(p.data) = CURRENT_DATE
      ORDER BY a.nome
    `, [turma_id]);

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao listar presença' });
  }
};

// 🔥 PRESENÇA DE HOJE
export const minhaPresencaHoje = async (req, res) => {
  try {
    const usuarioId = parseInt(req.user.id);

    const alunoResult = await pool.query(
      `SELECT id FROM alunos WHERE usuario_id = $1`,
      [usuarioId]
    );

    if (alunoResult.rows.length === 0) {
      return res.json(null);
    }

    const alunoId = alunoResult.rows[0].id;

    const result = await pool.query(`
      SELECT t.id, t.horario
      FROM presencas p
      JOIN turmas t ON t.id = p.turma_id
      WHERE p.aluno_id = $1
      AND DATE(p.data) = CURRENT_DATE
      LIMIT 1
    `, [alunoId]);

    if (result.rows.length === 0) {
      return res.json(null);
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao buscar presença' });
  }
};

// 🔥 HISTÓRICO DO PRÓPRIO ALUNO
export const meuHistorico = async (req, res) => {
  try {
    const usuarioId = parseInt(req.user.id);

    const alunoResult = await pool.query(
      `SELECT id FROM alunos WHERE usuario_id = $1`,
      [usuarioId]
    );

    if (alunoResult.rows.length === 0) {
      return res.json([]);
    }

    const alunoId = alunoResult.rows[0].id;

    const result = await pool.query(`
      SELECT 
        p.id,
        p.data,
        t.horario
      FROM presencas p
      JOIN turmas t ON t.id = p.turma_id
      WHERE p.aluno_id = $1
      ORDER BY p.data DESC
    `, [alunoId]);

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao buscar histórico' });
  }
};

// 🔥 HISTÓRICO DE QUALQUER ALUNO
export const historicoPorAluno = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(`
      SELECT 
        p.id,
        p.data,
        t.horario
      FROM presencas p
      JOIN turmas t ON t.id = p.turma_id
      WHERE p.aluno_id = $1
      ORDER BY p.data DESC
    `, [id]);

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao buscar histórico do aluno' });
  }
};