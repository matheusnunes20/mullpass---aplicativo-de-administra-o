import pool from '../src/db.js';

/**
 * ✅ CONFIRMAR PRESENÇA
 */
export const confirmarPresenca = async (req, res) => {

  const client = await pool.connect();

  try {

    await client.query('BEGIN');

    const usuarioId =
        parseInt(req.user.id, 10);

    const turma_id =
        parseInt(req.body.turma_id, 10);

    if (!usuarioId || !turma_id) {

      return res.status(400).json({
        erro: 'Dados inválidos'
      });
    }

    /**
     * 👤 BUSCAR ALUNO
     */
    const alunoResult = await client.query(
      `SELECT id
       FROM alunos
       WHERE usuario_id = $1
       LIMIT 1`,
      [usuarioId]
    );

    if (alunoResult.rows.length === 0) {

      return res.status(404).json({
        erro: 'Aluno não encontrado'
      });
    }

    const alunoId =
        alunoResult.rows[0].id;

    /**
     * 📚 VALIDAR TURMA
     */
    const turmaResult = await client.query(
      `SELECT id, limite
       FROM turmas
       WHERE id = $1`,
      [turma_id]
    );

    if (turmaResult.rows.length === 0) {

      return res.status(400).json({
        erro: 'Turma inválida'
      });
    }

    const turma =
        turmaResult.rows[0];

    /**
     * 🔒 LOCK
     */
    await client.query(`
      LOCK TABLE presencas
      IN SHARE ROW EXCLUSIVE MODE
    `);

    /**
     * 🧹 REMOVE PRESENÇA ANTERIOR
     */
    await client.query(`
      DELETE FROM presencas
      WHERE aluno_id = $1
      AND DATE(data) = CURRENT_DATE
    `, [alunoId]);

    /**
     * 📊 OCUPAÇÃO
     */
    const count = await client.query(`
      SELECT COUNT(DISTINCT aluno_id)
      FROM presencas
      WHERE turma_id = $1
      AND DATE(data) = CURRENT_DATE
    `, [turma_id]);

    const total =
        parseInt(count.rows[0].count, 10);

    if (total >= turma.limite) {

      await client.query('ROLLBACK');

      return res.status(400).json({
        erro: 'Turma cheia'
      });
    }

    /**
     * ✅ INSERIR
     */
    const result = await client.query(`
      INSERT INTO presencas (
        aluno_id,
        turma_id,
        data
      )
      VALUES ($1, $2, NOW())
      RETURNING *
    `, [alunoId, turma_id]);

    await client.query('COMMIT');

    res.status(201).json(
      result.rows[0]
    );

  } catch (err) {

    await client.query('ROLLBACK');

    console.error(err);

    res.status(500).json({
      erro: err.message
    });

  } finally {

    client.release();
  }
};

/**
 * 📚 LISTAR TURMAS
 */
export const listarTurmas = async (req, res) => {

  try {

    const result = await pool.query(`
      SELECT *
      FROM turmas
      ORDER BY horario
    `);

    res.json(result.rows);

  } catch (err) {

    console.error(err);

    res.status(500).json({
      erro: err.message
    });
  }
};

/**
 * 👤 MINHA TURMA
 */
export const minhaTurma = async (req, res) => {

  try {

    const aluno = await pool.query(
      `SELECT id
       FROM alunos
       WHERE usuario_id = $1`,
      [req.user.id]
    );

    if (aluno.rows.length === 0) {

      return res.status(404).json({
        erro: 'Aluno não encontrado'
      });
    }

    const result = await pool.query(`
      SELECT t.*
      FROM inscricoes i
      JOIN turmas t
      ON t.id = i.turma_id
      WHERE i.aluno_id = $1
    `, [aluno.rows[0].id]);

    res.json(result.rows);

  } catch (err) {

    console.error(err);

    res.status(500).json({
      erro: err.message
    });
  }
};

/**
 * 📅 PRESENÇA HOJE
 */
export const minhaPresencaHoje = async (req, res) => {

  try {

    const aluno = await pool.query(
      `SELECT id
       FROM alunos
       WHERE usuario_id = $1`,
      [req.user.id]
    );

    if (aluno.rows.length === 0) {

      return res.status(404).json({
        erro: 'Aluno não encontrado'
      });
    }

    const result = await pool.query(`
      SELECT *
      FROM presencas
      WHERE aluno_id = $1
      AND DATE(data) = CURRENT_DATE
    `, [aluno.rows[0].id]);

    res.json(result.rows);

  } catch (err) {

    console.error(err);

    res.status(500).json({
      erro: err.message
    });
  }
};

/**
 * 📜 MEU HISTÓRICO
 */
export const meuHistorico = async (req, res) => {

  try {

    const aluno = await pool.query(
      `SELECT id
       FROM alunos
       WHERE usuario_id = $1`,
      [req.user.id]
    );

    if (aluno.rows.length === 0) {

      return res.status(404).json({
        erro: 'Aluno não encontrado'
      });
    }

    const result = await pool.query(`
      SELECT
        p.*,
        t.horario
      FROM presencas p
      JOIN turmas t
      ON t.id = p.turma_id
      WHERE p.aluno_id = $1
      ORDER BY p.data DESC
    `, [aluno.rows[0].id]);

    res.json(result.rows);

  } catch (err) {

    console.error(err);

    res.status(500).json({
      erro: err.message
    });
  }
};

/**
 * 📊 FREQUÊNCIA
 */
/**
 * 📊 FREQUÊNCIA
 */
export const minhaFrequencia = async (req, res) => {

  try {

    const aluno = await pool.query(
      `SELECT id
       FROM alunos
       WHERE usuario_id = $1`,
      [req.user.id]
    );

    if (aluno.rows.length === 0) {

      return res.status(404).json({
        erro: 'Aluno não encontrado'
      });
    }

    const alunoId =
      aluno.rows[0].id;

    /**
     * 📅 PRESENÇAS
     */
    const presencas = await pool.query(`
      SELECT COUNT(*) as total
      FROM presencas
      WHERE aluno_id = $1
      AND DATE_TRUNC('month', data)
      = DATE_TRUNC('month', CURRENT_DATE)
    `, [alunoId]);

    /**
     * 📚 AULAS
     */
    const aulas = await pool.query(`
      SELECT COUNT(*) as total
      FROM aulas
      WHERE DATE_TRUNC('month', data)
      = DATE_TRUNC('month', CURRENT_DATE)
    `);

    const totalPresencas =
      Number(presencas.rows[0].total);

    const totalAulas =
      Number(aulas.rows[0].total);

    let frequencia = 0;

    if (totalAulas > 0) {

      frequencia =
        (totalPresencas / totalAulas) * 100;

      // 🔥 LIMITA EM 100%
      if (frequencia > 100) {
        frequencia = 100;
      }
    }

    res.json({

      presencas:
        totalPresencas,

      aulas:
        totalAulas,

      frequencia:
        frequencia.toFixed(1)
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      erro: err.message
    });
  }
};
/**
 * 📋 LISTAR PRESENÇAS POR TURMA
 */
export const listarPresencaPorTurma = async (req, res) => {

  try {

    const { turma_id } =
        req.params;

    const result = await pool.query(`
      SELECT
        p.*,
        a.nome
      FROM presencas p
      JOIN alunos a
      ON a.id = p.aluno_id
      WHERE p.turma_id = $1
      ORDER BY p.data DESC
    `, [turma_id]);

    res.json(result.rows);

  } catch (err) {

    console.error(err);

    res.status(500).json({
      erro: err.message
    });
  }
};

/**
 * 📌 HISTÓRICO POR ALUNO
 */
export const historicoPorAluno = async (req, res) => {

  try {

    const { id } =
        req.params;

    if (!id) {

      return res.status(400).json({
        erro: 'ID inválido'
      });
    }

    const result = await pool.query(`
      SELECT
        p.*,
        t.horario
      FROM presencas p
      JOIN turmas t
      ON t.id = p.turma_id
      WHERE p.aluno_id = $1
      ORDER BY p.data DESC
    `, [id]);

    res.json(result.rows);

  } catch (err) {

    console.error(err);

    res.status(500).json({
      erro: err.message
    });
  }
};