import pool from '../src/db.js';

/**
 * 📌 LISTAR ALUNOS
 */
export const listarAlunos = async (req, res) => {
  try {
    const alunos = await pool.query('SELECT * FROM alunos');
    res.json(alunos.rows);
  } catch (err) {
    console.error('ERRO LISTAR ALUNOS:', err);
    res.status(500).json({ erro: err.message });
  }
};

/**
 * 📌 CRIAR ALUNO (100% CORRIGIDO)
 */
export const criarAluno = async (req, res) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const {
      nome,
      telefone,
      email,
      documento,
      endereco,
      modalidade,
      dia_semana,
      horario,
      professor,
      sexo,
      usuario_id,
      plano_id
    } = req.body;

    // 🔥 VALIDAÇÕES
    if (!nome || !usuario_id || !horario || !plano_id) {
      return res.status(400).json({
        erro: 'Campos obrigatórios: nome, usuario_id, horario, plano_id'
      });
    }

    // 🔍 VALIDA USUÁRIO
    const userCheck = await client.query(
      'SELECT id FROM usuarios WHERE id = $1',
      [usuario_id]
    );

    if (userCheck.rows.length === 0) {
      return res.status(400).json({ erro: 'Usuário inválido' });
    }

    // 🔍 VALIDA PLANO
    const plano = await client.query(
      'SELECT preco FROM planos WHERE id = $1',
      [plano_id]
    );

    if (plano.rows.length === 0) {
      return res.status(400).json({ erro: 'Plano inválido' });
    }

    const valorPlano = plano.rows[0].preco;

    // 🔥 FORMATA HORÁRIO
    let horarioFormatado = horario;

    if (!horario.includes(':')) {
      const partes = horario.split('-');

      if (partes.length !== 2) {
        return res.status(400).json({ erro: 'Formato de horário inválido' });
      }

      horarioFormatado = `${partes[0]}:00-${partes[1]}:00`;
    }

    // 🔍 VALIDA TURMA
    const turmaResult = await client.query(
      `SELECT id, limite FROM turmas WHERE horario = $1 LIMIT 1`,
      [horarioFormatado]
    );

    if (turmaResult.rows.length === 0) {
      return res.status(400).json({
        erro: 'Nenhuma turma encontrada para esse horário'
      });
    }

    const turma = turmaResult.rows[0];

    // 🔍 VERIFICA LOTAÇÃO
    const count = await client.query(
      `SELECT COUNT(*) FROM inscricoes WHERE turma_id = $1`,
      [turma.id]
    );

    const total = parseInt(count.rows[0].count, 10);

    if (total >= turma.limite) {
      return res.status(400).json({ erro: 'Turma cheia' });
    }

    // 🔥 CRIA ALUNO
    const alunoResult = await client.query(
      `INSERT INTO alunos 
      (nome, telefone, email, documento, endereco, modalidade, dia_semana, horario, professor, sexo, usuario_id, plano_id)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
      RETURNING *`,
      [
        nome,
        telefone,
        email,
        documento,
        endereco,
        modalidade,
        dia_semana,
        horarioFormatado,
        professor,
        sexo,
        usuario_id,
        plano_id
      ]
    );

    const aluno = alunoResult.rows[0];

    // 🔥 INSCRIÇÃO
    await client.query(
      `INSERT INTO inscricoes (aluno_id, turma_id)
       VALUES ($1, $2)`,
      [aluno.id, turma.id]
    );

    // 🔥 MENSALIDADE
    await client.query(
      `INSERT INTO mensalidades (aluno_id, valor, data_vencimento)
       VALUES ($1, $2, CURRENT_DATE + INTERVAL '30 days')`,
      [aluno.id, valorPlano]
    );

    await client.query('COMMIT');

    res.status(201).json(aluno);

  } catch (err) {
    await client.query('ROLLBACK');

    console.error('💥 ERRO CRIAR ALUNO:', err);

    res.status(500).json({
      erro: err.message
    });

  } finally {
    client.release();
  }
};

/**
 * 📌 ATUALIZAR ALUNO
 */
export const atualizarAluno = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);

    if (!id) {
      return res.status(400).json({ erro: 'ID inválido' });
    }

    const result = await pool.query(
      `UPDATE alunos SET 
        nome=$1, 
        telefone=$2,
        email=$3,
        documento=$4,
        endereco=$5,
        modalidade=$6,
        plano_id=$7
      WHERE id=$8
      RETURNING *`,
      [
        req.body.nome,
        req.body.telefone,
        req.body.email,
        req.body.documento,
        req.body.endereco,
        req.body.modalidade,
        req.body.plano_id,
        id
      ]
    );

    res.json(result.rows[0]);

  } catch (err) {
    console.error('ERRO ATUALIZAR ALUNO:', err);
    res.status(500).json({ erro: err.message });
  }
};

/**
 * 📌 BUSCAR ALUNO POR ID
 */
export const buscarAlunoPorId = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);

    if (!id) {
      return res.status(400).json({ erro: 'ID inválido' });
    }

    const result = await pool.query(
      `SELECT * FROM alunos WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ erro: 'Aluno não encontrado' });
    }

    res.json(result.rows[0]);

  } catch (err) {
    console.error('ERRO BUSCAR ALUNO:', err);
    res.status(500).json({ erro: err.message });
  }
};

/**
 * 📌 DELETAR ALUNO
 */
export const deletarAluno = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);

    if (!id) {
      return res.status(400).json({ erro: 'ID inválido' });
    }

    await pool.query(
      'DELETE FROM alunos WHERE id=$1',
      [id]
    );

    res.json({ mensagem: 'Aluno deletado com sucesso' });

  } catch (err) {
    console.error('ERRO DELETAR ALUNO:', err);
    res.status(500).json({ erro: err.message });
  }
};