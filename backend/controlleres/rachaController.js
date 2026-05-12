import pool from '../src/db.js';

/**
 * 📌 CRIAR RACHA
 */
export const criarRacha = async (req, res) => {

  try {

    const userId =
        req.user?.id;

    if (!userId) {

      return res.status(401).json({
        erro: 'Acesso negado'
      });
    }

    const {

      data,
      hora_inicio,
      hora_fim,
      local,
      quadra,
      limite,
      tipo

    } = req.body;

    if (

      !data ||
      !hora_inicio ||
      !hora_fim ||
      !local ||
      !quadra ||
      !limite ||
      !tipo

    ) {

      return res.status(400).json({
        erro: 'Campos obrigatórios faltando'
      });
    }

    const horaInicioFormatada =

        hora_inicio.includes(':')

            ? hora_inicio

            : `${hora_inicio}:00`;

    const horaFimFormatada =

        hora_fim.includes(':')

            ? hora_fim

            : `${hora_fim}:00`;

    const horaFinal =

        `${horaInicioFormatada} - ${horaFimFormatada}`;

    const result =
        await pool.query(

      `INSERT INTO rachas
      (
        data,
        hora,
        local,
        quadra,
        limite,
        tipo,
        criado_por
      )

       VALUES
       (
        $1,$2,$3,$4,$5,$6,$7
       )

       RETURNING *`,

      [
        data,
        horaFinal,
        local,
        quadra,
        limite,
        tipo,
        userId
      ]
    );

    res.status(201).json(
      result.rows[0]
    );

  } catch (err) {

    console.error(
      'ERRO CRIAR RACHA:',
      err
    );

    res.status(500).json({
      erro: err.message
    });
  }
};

/**
 * 📌 LISTAR RACHAS
 */
export const listarRachas = async (req, res) => {

  try {

    const result =
        await pool.query(

      `SELECT

        id,
        data,
        hora,
        local,
        quadra,
        limite,
        tipo,
        criado_por

      FROM rachas

      ORDER BY data DESC`
    );

    res.json(
      result.rows
    );

  } catch (err) {

    console.error(
      'ERRO LISTAR RACHAS:',
      err
    );

    res.status(500).json({
      erro: err.message
    });
  }
};

/**
 * 📌 LISTAR JOGADORES
 */
export const listarJogadoresRacha = async (req, res) => {

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

        a.nome,
        a.telefone

       FROM racha_jogadores rj

       JOIN alunos a
       ON a.id = rj.aluno_id

       WHERE rj.racha_id = $1`,

      [id]
    );

    res.json(
      result.rows
    );

  } catch (err) {

    console.error(
      'ERRO JOGADORES RACHA:',
      err
    );

    res.status(500).json({
      erro: err.message
    });
  }
};

/**
 * 📌 ENTRAR NO RACHA
 */
export const entrarRacha = async (req, res) => {

  try {

    const usuarioId =
        req.user.id;

    const { racha_id } =
        req.body;

    if (!racha_id) {

      return res.status(400).json({
        erro: 'Racha não informado'
      });
    }

    /**
     * 🔍 BUSCAR ALUNO
     */
    const aluno =
        await pool.query(

      `SELECT id

       FROM alunos

       WHERE usuario_id = $1`,

      [usuarioId]
    );

    if (aluno.rows.length === 0) {

      return res.status(404).json({
        erro: 'Aluno não encontrado'
      });
    }

    const alunoId =
        aluno.rows[0].id;

    /**
     * 🔍 VERIFICA DUPLICIDADE
     */
    const existe =
        await pool.query(

      `SELECT id

       FROM racha_jogadores

       WHERE racha_id = $1
       AND aluno_id = $2`,

      [
        racha_id,
        alunoId
      ]
    );

    if (existe.rows.length > 0) {

      return res.status(400).json({
        erro: 'Você já entrou nesse racha'
      });
    }

    /**
     * 🔍 VERIFICA LIMITE
     */
    const total =
        await pool.query(

      `SELECT COUNT(*) as total

       FROM racha_jogadores

       WHERE racha_id = $1`,

      [racha_id]
    );

    const racha =
        await pool.query(

      `SELECT limite

       FROM rachas

       WHERE id = $1`,

      [racha_id]
    );

    if (racha.rows.length === 0) {

      return res.status(404).json({
        erro: 'Racha não encontrado'
      });
    }

    const jogadores =
        Number(
          total.rows[0].total
        );

    const limite =
        Number(
          racha.rows[0].limite
        );

    if (jogadores >= limite) {

      return res.status(400).json({
        erro: 'Racha lotado'
      });
    }

    /**
     * ✅ ENTRAR
     */
    await pool.query(

      `INSERT INTO racha_jogadores
       (
        racha_id,
        aluno_id
       )

       VALUES ($1, $2)`,

      [
        racha_id,
        alunoId
      ]
    );

    res.status(201).json({
      sucesso: true
    });

  } catch (err) {

    console.error(
      'ERRO ENTRAR RACHA:',
      err
    );

    res.status(500).json({
      erro: err.message
    });
  }
};

/**
 * 📌 DELETAR RACHA
 */
export const deletarRacha = async (req, res) => {

  try {

    const id =
        parseInt(
          req.params.id,
          10
        );

    const userId =
        req.user?.id;

    if (!id) {

      return res.status(400).json({
        erro: 'ID inválido'
      });
    }

    if (!userId) {

      return res.status(401).json({
        erro: 'Acesso negado'
      });
    }

    const result =
        await pool.query(

      `SELECT *

       FROM rachas

       WHERE id = $1`,

      [id]
    );

    const racha =
        result.rows[0];

    if (!racha) {

      return res.status(404).json({
        erro: 'Racha não encontrado'
      });
    }

    if (

      racha.criado_por.toString() !==
      userId.toString()

      &&

      req.user.tipo !== 'admin'

    ) {

      return res.status(403).json({
        erro: 'Sem permissão'
      });
    }

    await pool.query(

      `DELETE FROM racha_jogadores
       WHERE racha_id = $1`,

      [id]
    );

    await pool.query(

      `DELETE FROM rachas
       WHERE id = $1`,

      [id]
    );

    res.json({
      mensagem: 'Racha deletado com sucesso'
    });

  } catch (err) {

    console.error(
      'ERRO DELETAR RACHA:',
      err
    );

    res.status(500).json({
      erro: err.message
    });
  }
};