import pool from '../src/db.js';

// 🔥 LISTAR
export const listarAlunos = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT current_database(), current_user;
    `);

    console.log('BANCO:', result.rows);

    const alunos = await pool.query('SELECT * FROM alunos');

    console.log('ALUNOS:', alunos.rows);

    res.json(alunos.rows);

  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao listar alunos');
  }
};

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
      usuario_id // 🔥 AQUI
    } = req.body;

    const result = await pool.query(
      `INSERT INTO alunos 
      (nome, telefone, email, documento, endereco, modalidade, dia_semana, horario, professor, sexo, usuario_id)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
      RETURNING *`,
      [nome, telefone, email, documento, endereco, modalidade, dia_semana, horario, professor, sexo, usuario_id]
    );

    res.status(201).json(result.rows[0]);

  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao criar aluno');
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
        tipo=$6,
        modalidade=$7
      WHERE id=$8 AND usuario_id = $9
      RETURNING *`,
      [
        req.body.nome,
        req.body.telefone,
        req.body.email,
        req.body.documento,
        req.body.endereco,
        req.body.tipo,
        req.body.modalidade,
        id,
        req.userId // 🔥 proteção
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
      'DELETE FROM alunos WHERE id=$1 AND usuario_id=$2',
      [id, req.userId] // 🔥 proteção
    );

    res.send('Aluno deletado');

  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao deletar aluno');
  }
};