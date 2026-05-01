import pool from '../src/db.js';

// 🔥 LISTAR
export const listarAlunos = async (req, res) => {
  try {
    const alunos = await pool.query('SELECT * FROM alunos');
    res.json(alunos.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao listar alunos');
  }
};


// 🔥 CRIAR ALUNO + INSCRIÇÃO + FINANCEIRO (VERSÃO FINAL)
export const criarAluno = async (req, res) => {
  try {
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

    console.log('📥 RECEBIDO:', req.body);

    // 🔒 VALIDAÇÕES
    if (!nome || !usuario_id) {
      return res.status(400).json({ erro: 'Nome e usuário são obrigatórios' });
    }

    if (!horario) {
      return res.status(400).json({ erro: 'Horário obrigatório' });
    }

    if (!plano_id) {
      return res.status(400).json({ erro: 'Plano obrigatório' });
    }

    // 🔥 BUSCA PLANO
    const plano = await pool.query(
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

    console.log('🕒 FORMATADO:', horarioFormatado);

    // 🔥 CRIA ALUNO
    const result = await pool.query(
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

    const aluno = result.rows[0];

    // 🔥 BUSCA TURMA (COMPATÍVEL COM SUA TABELA)
    const turmaResult = await pool.query(
      `SELECT id, limite 
       FROM turmas 
       WHERE horario = $1
       LIMIT 1`,
      [horarioFormatado]
    );

    if (turmaResult.rows.length === 0) {
      return res.status(400).json({
        erro: 'Nenhuma turma encontrada para esse horário'
      });
    }

    const turma = turmaResult.rows[0];

    // 🔥 EVITA DUPLICAÇÃO DE INSCRIÇÃO
    const jaInscrito = await pool.query(
      `SELECT 1 FROM inscricoes WHERE aluno_id = $1`,
      [aluno.id]
    );

    if (jaInscrito.rows.length === 0) {

      const count = await pool.query(
        `SELECT COUNT(*) FROM inscricoes WHERE turma_id = $1`,
        [turma.id]
      );

      const total = parseInt(count.rows[0].count);

      if (total >= turma.limite) {
        return res.status(400).json({ erro: 'Turma cheia' });
      }

      await pool.query(
        `INSERT INTO inscricoes (aluno_id, turma_id)
         VALUES ($1, $2)`,
        [aluno.id, turma.id]
      );

      console.log('✅ INSCRIÇÃO CRIADA');
    } else {
      console.log('⚠️ Já inscrito');
    }

    // 🔥 💰 CRIAR MENSALIDADE (SEM DUPLICAR)
    const existeMensalidade = await pool.query(
      `SELECT 1 FROM mensalidades 
       WHERE aluno_id = $1 
       AND DATE_TRUNC('month', data_vencimento) = DATE_TRUNC('month', CURRENT_DATE)`,
      [aluno.id]
    );

    if (existeMensalidade.rows.length === 0) {
      await pool.query(
        `INSERT INTO mensalidades (aluno_id, valor, data_vencimento)
         VALUES ($1, $2, CURRENT_DATE + INTERVAL '30 days')`,
        [aluno.id, valorPlano]
      );

      console.log('💰 Mensalidade criada');
    } else {
      console.log('⚠️ Mensalidade já existe');
    }

    res.status(201).json(aluno);

  } catch (err) {
    console.error('💥 ERRO REAL:', err);
    res.status(500).json({ erro: err.message });
  }
};


// 🔥 ATUALIZAR
export const atualizarAluno = async (req, res) => {
  try {
    const { id } = req.params;

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
    console.error(err);
    res.status(500).send('Erro ao atualizar aluno');
  }
};


// 🔥 DELETAR
export const deletarAluno = async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query(
      'DELETE FROM alunos WHERE id=$1',
      [id]
    );

    res.send('Aluno deletado');

  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao deletar aluno');
  }
};