import pool from '../src/db.js';

/**
 * 📌 ENTRAR NA TURMA
 */
export const entrarNaTurma = async (req, res) => {

  try {

    const turma_id =
        parseInt(
          req.body.turma_id
        );

    if (!turma_id) {

      return res.status(400).json({
        erro: 'turma_id inválido'
      });
    }

    /**
     * 🔍 BUSCAR ALUNO
     */
    const alunoResult =
        await pool.query(

      `SELECT
        id,
        sexo

       FROM alunos

       WHERE usuario_id = $1`,

      [req.user.id]
    );

    if (alunoResult.rows.length === 0) {

      return res.status(404).json({
        erro: 'Aluno não encontrado'
      });
    }

    const aluno_id =
        alunoResult.rows[0].id;

    const alunoSexo =
        alunoResult.rows[0].sexo;

    /**
     * 🔍 VERIFICA TURMA
     */
    const turmaResult =
        await pool.query(

      `SELECT
        limite,
        sexo,
        modalidade,
        professor

       FROM turmas

       WHERE id = $1`,

      [turma_id]
    );

    if (turmaResult.rows.length === 0) {

      return res.status(404).json({
        erro: 'Turma não encontrada'
      });
    }

    const turma =
        turmaResult.rows[0];

    /**
     * 🚺 BLOQUEIO FEMININO
     */
    if (

      turma.sexo === 'feminino' &&

      alunoSexo !== 'feminino'

    ) {

      return res.status(403).json({

        erro:
            'Esta turma é exclusiva para mulheres'
      });
    }

    /**
     * 🔍 VERIFICA DUPLICIDADE
     */
    const jaExiste =
        await pool.query(

      `SELECT *

       FROM inscricoes

       WHERE aluno_id = $1
       AND turma_id = $2`,

      [
        aluno_id,
        turma_id
      ]
    );

    if (jaExiste.rows.length > 0) {

      return res.status(400).json({
        erro: 'Já está nesta turma'
      });
    }

    /**
     * 🔍 CONTAR INSCRITOS
     */
    const count =
        await pool.query(

      `SELECT COUNT(*)

       FROM inscricoes

       WHERE turma_id = $1`,

      [turma_id]
    );

    const total =
        parseInt(
          count.rows[0].count
        );

    if (total >= turma.limite) {

      return res.status(400).json({
        erro: 'Turma lotada'
      });
    }

    /**
     * 🔥 REMOVE INSCRIÇÃO ANTIGA
     */
    await pool.query(

      `DELETE FROM inscricoes

       WHERE aluno_id = $1`,

      [aluno_id]
    );

    /**
     * ✅ NOVA INSCRIÇÃO
     */
    const result =
        await pool.query(

      `INSERT INTO inscricoes
      (
        aluno_id,
        turma_id
      )

      VALUES ($1, $2)

      RETURNING *`,

      [
        aluno_id,
        turma_id
      ]
    );

    res.json({

      ...result.rows[0],

      modalidade:
          turma.modalidade,

      professor:
          turma.professor
    });

  } catch (err) {

    console.error(
      'ERRO ENTRAR TURMA:',
      err
    );

    res.status(500).json({
      erro: err.message
    });
  }
};

/**
 * 📌 MINHA TURMA
 */
export const minhaTurma = async (req, res) => {

  try {

    const result =
        await pool.query(

      `SELECT

        t.id,
        t.horario,
        t.limite,
        t.tipo,
        t.modalidade,
        t.professor,
        t.sexo,

        COUNT(DISTINCT i2.id)
          AS inscritos

      FROM inscricoes i

      JOIN alunos a
      ON a.id = i.aluno_id

      JOIN turmas t
      ON t.id = i.turma_id

      LEFT JOIN inscricoes i2
      ON i2.turma_id = t.id

      WHERE a.usuario_id = $1

      GROUP BY
        t.id,
        t.horario,
        t.limite,
        t.tipo,
        t.modalidade,
        t.professor,
        t.sexo`,

      [req.user.id]
    );

    if (result.rows.length === 0) {

      return res.json(null);
    }

    const t =
        result.rows[0];

    const inscritos =
        parseInt(
          t.inscritos
        ) || 0;

    res.json({

      id:
          t.id,

      horario:
          t.horario,

      tipo:
          t.tipo,

      modalidade:
          t.modalidade,

      professor:
          t.professor,

      sexo:
          t.sexo,

      limite:
          t.limite,

      inscritos,

      vagas:
          t.limite - inscritos,

      lotada:
          inscritos >= t.limite
    });

  } catch (err) {

    console.error(
      'ERRO MINHA TURMA:',
      err
    );

    res.status(500).json({
      erro: err.message
    });
  }
};

/**
 * 📌 SAIR DA TURMA
 */
export const sairDaTurma = async (req, res) => {

  try {

    const alunoResult =
        await pool.query(

      `SELECT id

       FROM alunos

       WHERE usuario_id = $1`,

      [req.user.id]
    );

    if (alunoResult.rows.length === 0) {

      return res.status(404).json({
        erro: 'Aluno não encontrado'
      });
    }

    const aluno_id =
        alunoResult.rows[0].id;

    await pool.query(

      `DELETE FROM inscricoes

       WHERE aluno_id = $1`,

      [aluno_id]
    );

    res.json({
      mensagem: 'Saiu da turma'
    });

  } catch (err) {

    console.error(
      'ERRO SAIR TURMA:',
      err
    );

    res.status(500).json({
      erro: err.message
    });
  }
};