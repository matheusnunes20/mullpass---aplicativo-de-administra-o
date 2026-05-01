import pool from '../src/db.js';

// 🔥 BUSCAR ALUNO LOGADO (ESSENCIAL PRA TELA)
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

    const alunoResult = await pool.query(
      `SELECT id FROM alunos WHERE usuario_id = $1`,
      [usuarioId]
    );

    if (alunoResult.rows.length === 0) {
      return res.status(404).json({ erro: 'Aluno não encontrado' });
    }

    const alunoId = alunoResult.rows[0].id;

    const turmaResult = await pool.query(`
      SELECT t.id, t.limite
      FROM inscricoes i
      JOIN turmas t ON t.id = i.turma_id
      WHERE i.aluno_id = $1
      LIMIT 1
    `, [alunoId]);

    if (turmaResult.rows.length === 0) {
      return res.status(400).json({ erro: 'Aluno não está em nenhuma turma' });
    }

    const turma = turmaResult.rows[0];

    const existe = await pool.query(
      `SELECT 1 FROM presencas 
       WHERE aluno_id = $1 
       AND DATE(data) = CURRENT_DATE`,
      [alunoId]
    );

    if (existe.rows.length > 0) {
      return res.status(400).json({ erro: 'Já confirmou hoje' });
    }

    const count = await pool.query(`
      SELECT COUNT(*) 
      FROM presencas p
      JOIN inscricoes i ON i.aluno_id = p.aluno_id
      WHERE i.turma_id = $1
      AND DATE(p.data) = CURRENT_DATE
    `, [turma.id]);

    const total = parseInt(count.rows[0].count);

    if (total >= turma.limite) {
      return res.status(400).json({ erro: 'Turma completa' });
    }

    const result = await pool.query(
      `INSERT INTO presencas (aluno_id, data)
       VALUES ($1, NOW())
       RETURNING *`,
      [alunoId]
    );

    res.status(201).json(result.rows[0]);

  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao confirmar presença' });
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

    await pool.query(
      `DELETE FROM presencas
       WHERE aluno_id = $1
       AND DATE(data) = CURRENT_DATE`,
      [alunoId]
    );

    res.json({ ok: true });

  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao remover presença' });
  }
};


// 🔥 LISTAR POR TURMA (ADMIN)
export const listarPresencaPorTurma = async (req, res) => {
  try {
    const { turma_id } = req.params;

    const result = await pool.query(`
      SELECT a.nome, p.data
      FROM presencas p
      JOIN alunos a ON a.id = p.aluno_id
      JOIN inscricoes i ON i.aluno_id = a.id
      WHERE i.turma_id = $1
      AND DATE(p.data) = CURRENT_DATE
    `, [turma_id]);

    res.json(result.rows);

  } catch (err) {
    res.status(500).json({ erro: 'Erro ao listar presença' });
  }
};