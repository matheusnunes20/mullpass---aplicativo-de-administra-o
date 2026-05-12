import pool from '../src/db.js';

/**
 * 📌 LISTAR TODAS AS TURMAS
 */
export const listarTurmas = async (req, res) => {

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

        COUNT(DISTINCT i.aluno_id)
          AS inscritos,

        COUNT(DISTINCT p.aluno_id)
          AS presentes_hoje

      FROM turmas t

      LEFT JOIN inscricoes i
      ON i.turma_id = t.id

      LEFT JOIN presencas p
      ON p.turma_id = t.id
      AND DATE(p.data) = CURRENT_DATE

      GROUP BY t.id

      ORDER BY t.horario`
    );

    const turmasFormatadas =
        result.rows.map((t) => {

      const inscritos =
          parseInt(
            t.inscritos,
            10
          );

      const presentesHoje =
          parseInt(
            t.presentes_hoje,
            10
          );

      return {

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

        limite:
            t.limite,

        inscritos,

        presentes_hoje:
            presentesHoje,

        vagas:
            t.limite - inscritos,

        lotada:
            inscritos >= t.limite
      };
    });

    const manha = [];
    const noite = [];

    turmasFormatadas.forEach((t) => {

      const hora =
          parseInt(
            t.horario
              .split(':')[0],
            10
          );

      if (

        !isNaN(hora) &&
        hora < 12

      ) {

        manha.push(t);

      } else {

        noite.push(t);
      }
    });

    res.json({
      manha,
      noite
    });

  } catch (err) {

    console.error(
      'ERRO LISTAR TURMAS:',
      err
    );

    res.status(500).json({
      erro: err.message
    });
  }
};

/**
 * 📌 BUSCAR TURMA POR ID
 */
export const buscarTurmaPorId = async (req, res) => {

  try {

    const id =
        parseInt(
          req.params.id,
          10
        );

    if (!id) {

      return res.status(400).json({
        erro: 'ID inválido'
      });
    }

    const result =
        await pool.query(

      `SELECT

        t.id,
        t.horario,
        t.limite,
        t.tipo,
        t.modalidade,
        t.professor,

        COUNT(DISTINCT i.aluno_id)
          AS inscritos,

        COUNT(DISTINCT p.aluno_id)
          AS presentes_hoje

      FROM turmas t

      LEFT JOIN inscricoes i
      ON i.turma_id = t.id

      LEFT JOIN presencas p
      ON p.turma_id = t.id
      AND DATE(p.data) = CURRENT_DATE

      WHERE t.id = $1

      GROUP BY t.id`,

      [id]
    );

    if (result.rows.length === 0) {

      return res.status(404).json({
        erro: 'Turma não encontrada'
      });
    }

    const t =
        result.rows[0];

    const inscritos =
        parseInt(
          t.inscritos,
          10
        );

    const presentesHoje =
        parseInt(
          t.presentes_hoje,
          10
        );

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

      limite:
          t.limite,

      inscritos,

      presentes_hoje:
          presentesHoje,

      vagas:
          t.limite - inscritos,

      lotada:
          inscritos >= t.limite
    });

  } catch (err) {

    console.error(
      'ERRO TURMA ID:',
      err
    );

    res.status(500).json({
      erro: err.message
    });
  }
};

/**
 * 📌 LISTAR ALUNOS DA TURMA
 */
export const listarAlunosTurma = async (req, res) => {

  try {

    const id =
        parseInt(
          req.params.id,
          10
        );

    if (!id) {

      return res.status(400).json({
        erro: 'ID inválido'
      });
    }

    const result =
        await pool.query(

      `SELECT

        a.id,
        a.nome,
        a.telefone

       FROM inscricoes i

       JOIN alunos a
       ON a.id = i.aluno_id

       WHERE i.turma_id = $1

       ORDER BY a.nome`,

      [id]
    );

    res.json(
      result.rows
    );

  } catch (err) {

    console.error(
      'ERRO ALUNOS TURMA:',
      err
    );

    res.status(500).json({
      erro: err.message
    });
  }
};