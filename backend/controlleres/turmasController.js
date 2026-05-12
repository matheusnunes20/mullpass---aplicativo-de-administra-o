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

        COALESCE(
          t.modalidade,
          '-'
        ) AS modalidade,

        COALESCE(
          t.professor,
          '-'
        ) AS professor,

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

      GROUP BY
        t.id,
        t.horario,
        t.limite,
        t.tipo,
        t.modalidade,
        t.professor

      ORDER BY t.horario`
    );

    const turmasFormatadas =
        result.rows.map((t) => {

      const inscritos =
          parseInt(
            t.inscritos,
            10
          ) || 0;

      const presentesHoje =
          parseInt(
            t.presentes_hoje,
            10
          ) || 0;

      const limite =
          parseInt(
            t.limite,
            10
          ) || 0;

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

        limite,

        inscritos,

        presentes_hoje:
            presentesHoje,

        vagas:
            limite - inscritos,

        lotada:
            inscritos >= limite
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

        COALESCE(
          t.modalidade,
          '-'
        ) AS modalidade,

        COALESCE(
          t.professor,
          '-'
        ) AS professor,

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

      GROUP BY
        t.id,
        t.horario,
        t.limite,
        t.tipo,
        t.modalidade,
        t.professor`,

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
        ) || 0;

    const presentesHoje =
        parseInt(
          t.presentes_hoje,
          10
        ) || 0;

    const limite =
        parseInt(
          t.limite,
          10
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

      limite,

      inscritos,

      presentes_hoje:
          presentesHoje,

      vagas:
          limite - inscritos,

      lotada:
          inscritos >= limite
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
 * 📌 LISTAR ALUNOS PRESENTES HOJE
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

      `SELECT DISTINCT

        a.id,
        a.nome,
        a.telefone

      FROM presencas p

      JOIN alunos a
      ON a.id = p.aluno_id

      WHERE p.turma_id = $1
      AND DATE(p.data) = CURRENT_DATE

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