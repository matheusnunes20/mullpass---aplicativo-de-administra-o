import pool from '../src/db.js';

/**
 * 📌 LISTAR TURMAS
 */
export const listarTurmas = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, horario, limite
      FROM turmas
      ORDER BY horario
    `);

    res.json(result.rows);

  } catch (err) {
    console.error('ERRO LISTAR TURMAS:', err);
    res.status(500).json({ erro: err.message });
  }
};

/**
 * 📌 MINHA TURMA (CORRIGIDO)
 */
export const minhaTurma = async (req, res) => {
  try {
    const usuarioId = parseInt(req.user.id, 10);

    const result = await pool.query(`
      SELECT t.*
      FROM inscricoes i
      JOIN alunos a ON a.id = i.aluno_id
      JOIN turmas t ON t.id = i.turma_id
      WHERE a.usuario_id = $1
      LIMIT 1
    `, [usuarioId]);

    if (result.rows.length === 0) {
      return res.json(null);
    }

    res.json(result.rows[0]);

  } catch (err) {
    console.error('ERRO MINHA TURMA:', err);
    res.status(500).json({ erro: err.message });
  }
};

/**
 * 📌 CONFIRMAR PRESENÇA
 */
export const confirmarPresenca = async (req, res) => {
  try {
    const usuarioId = parseInt(req.user.id, 10);
    const turma_id = parseInt(req.body.turma_id, 10);

    if (!turma_id) {
      return res.status(400).json({ erro: 'turma_id inválido' });
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

    // remove presença anterior hoje
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

    const total = parseInt(count.rows[0].count, 10);

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
    console.error('ERRO CONFIRMAR PRESENÇA:', err);
    res.status(500).json({ erro: err.message });
  }
};

/**
 * 📌 REMOVER PRESENÇA
 */
export const removerPresenca = async (req, res) => {
  try {
    const usuarioId = parseInt(req.user.id, 10);

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
    console.error('ERRO REMOVER PRESENÇA:', err);
    res.status(500).json({ erro: err.message });
  }
};

/**
 * 📌 LISTAR PRESENÇA POR TURMA
 */
export const listarPresencaPorTurma = async (req, res) => {
  try {
    const turma_id = parseInt(req.params.turma_id, 10);

    if (!turma_id) {
      return res.status(400).json({ erro: 'ID inválido' });
    }

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
    console.error('ERRO LISTAR PRESENÇA:', err);
    res.status(500).json({ erro: err.message });
  }
};

/**
 * 📌 MINHA PRESENÇA HOJE
 */
export const minhaPresencaHoje = async (req, res) => {
  try {
    const usuarioId = parseInt(req.user.id, 10);

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
    console.error('ERRO PRESENÇA HOJE:', err);
    res.status(500).json({ erro: err.message });
  }
};

/**
 * 📌 MEU HISTÓRICO
 */
export const meuHistorico = async (req, res) => {
  try {
    const usuarioId = parseInt(req.user.id, 10);

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
    console.error('ERRO HISTÓRICO:', err);
    res.status(500).json({ erro: err.message });
  }
};

/**
 * 📌 HISTÓRICO POR ALUNO
 */
export const historicoPorAluno = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);

    if (!id) {
      return res.status(400).json({ erro: 'ID inválido' });
    }

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
    console.error('ERRO HISTÓRICO ALUNO:', err);
    res.status(500).json({ erro: err.message });
  }
};