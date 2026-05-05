import pool from '../src/db.js';

/**
 * 📌 CONFIRMAR PRESENÇA
 */
export const confirmarPresenca = async (req, res) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const usuarioId = parseInt(req.user.id, 10);
    const turma_id = parseInt(req.body.turma_id, 10);

    console.log('🔥 USUARIO LOGADO:', usuarioId);
    console.log('🔥 TURMA RECEBIDA:', turma_id);

    if (!usuarioId || !turma_id) {
      return res.status(400).json({ erro: 'Dados inválidos' });
    }

    /**
     * 🔥 BUSCAR ALUNO (FORÇANDO 1 SÓ)
     */
    const alunoResult = await client.query(
      `SELECT id FROM alunos WHERE usuario_id = $1 LIMIT 1`,
      [usuarioId]
    );

    if (alunoResult.rows.length === 0) {
      return res.status(404).json({ erro: 'Aluno não encontrado' });
    }

    const alunoId = alunoResult.rows[0].id;

    console.log('✅ ALUNO ENCONTRADO:', alunoId);

    /**
     * 🔥 VALIDAR TURMA
     */
    const turmaResult = await client.query(
      `SELECT id, limite FROM turmas WHERE id = $1`,
      [turma_id]
    );

    if (turmaResult.rows.length === 0) {
      return res.status(400).json({ erro: 'Turma inválida' });
    }

    const turma = turmaResult.rows[0];

    /**
     * 🔥 LOCK PARA EVITAR DUPLICAÇÃO
     */
    await client.query(`LOCK TABLE presencas IN SHARE ROW EXCLUSIVE MODE`);

    /**
     * 🔥 REMOVE PRESENÇA ANTERIOR HOJE
     */
    await client.query(
      `DELETE FROM presencas
       WHERE aluno_id = $1
       AND DATE(data) = CURRENT_DATE`,
      [alunoId]
    );

    /**
     * 🔥 CONTAR OCUPAÇÃO (COM LOCK)
     */
    const count = await client.query(
      `SELECT COUNT(DISTINCT aluno_id)
       FROM presencas
       WHERE turma_id = $1
       AND DATE(data) = CURRENT_DATE`,
      [turma_id]
    );

    const total = parseInt(count.rows[0].count, 10);

    console.log('📊 OCUPAÇÃO ATUAL:', total);

    if (total >= turma.limite) {
      await client.query('ROLLBACK');
      return res.status(400).json({ erro: 'Turma cheia' });
    }

    /**
     * 🔥 INSERIR PRESENÇA
     */
    const result = await client.query(
      `INSERT INTO presencas (aluno_id, turma_id, data)
       VALUES ($1, $2, NOW())
       RETURNING *`,
      [alunoId, turma_id]
    );

    await client.query('COMMIT');

    console.log('🎯 PRESENÇA REGISTRADA:', result.rows[0]);

    res.status(201).json(result.rows[0]);

  } catch (err) {
    await client.query('ROLLBACK');

    console.error('❌ ERRO CONFIRMAR PRESENÇA:', err);

    res.status(500).json({ erro: err.message });

  } finally {
    client.release();
  }
};


/**
 * 📌 HISTÓRICO POR ALUNO (ADMIN)
 */
export const historicoPorAluno = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ erro: 'ID inválido' });
    }

    const result = await pool.query(`
      SELECT p.*, t.horario
      FROM presencas p
      JOIN turmas t ON t.id = p.turma_id
      WHERE p.aluno_id = $1
      ORDER BY p.data DESC
    `, [id]);

    res.json(result.rows);

  } catch (err) {
    console.error('❌ ERRO HISTORICO ALUNO:', err);
    res.status(500).json({ erro: err.message });
  }
};